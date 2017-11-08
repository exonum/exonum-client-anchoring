import { script, networks, address, crypto } from 'bitcoinjs-lib'
import { _, _private, blockHash, http } from './common/'
import { Buffer } from 'buffer'

// @todo implement node change on error response
export default class Provider {
  constructor (params) {
    const { nodes, version, port } = Object.assign({}, {
      nodes: ['http://localhost'],
      version: 'v1',
      port: 8000
    }, params)

    _(this).path = {
      anchoring: `${nodes[0]}:${port}/api/services/btc_anchoring/${version}`,
      explorer: `${nodes[0]}:${port}/api/explorer/${version}`,
      configuration: `${nodes[0]}:${port}/api/services/configuration/${version}`
    }
    _(this).nodes = nodes
    _(this).version = version
    _(this).port = port
    _(this).blocksLoadLimit = 1000
  }

  async getConfigsCommited () {
    const configsCommited = await http.get({ url: `${_(this).path.configuration}/configs/committed` })
    return configsCommited.map(({ config }) => ({
      actualFrom: config.actual_from,
      frequency: config.services.btc_anchoring.frequency,
      address: this[_private.parseConfigAddress](config),
      validatorKeys: config.validator_keys.map(item => item.consensus_key)
    })).sort((a, b) => a.actualFrom > b.actualFrom)
  }

  async getBlocks (from, to, nextCheck) {
    let count = to - from
    const reqCount = Math.ceil(count / _(this).blocksLoadLimit)
    let blocks = []
    let lastLoaded = from + 1
    for (let i = 1; i <= reqCount; i++) {
      const needCount = count > _(this).blocksLoadLimit ? _(this).blocksLoadLimit : count
      const latest = lastLoaded + needCount
      const result = await http.get({
        url: `${_(this).path.explorer}/blocks`,
        params: { count: needCount, latest }
      })
      result.sort((a, b) => Number(a.height) - Number(b.height))
      count = count - result.length
      lastLoaded = lastLoaded + result.length
      blocks = [...blocks, ...result]
    }
    if (Number(blocks[0].height) < from) blocks = blocks.filter(item => Number(item.height) > from)

    return Object.assign({ blocks }, this.checkBlocksChain(blocks, nextCheck))
  }

  getBlock (height) {
    return http.get({ url: `${_(this).path.explorer}/blocks/${height}` })
  }

  checkBlocksChain (blocks, nextCheck) {
    let errors = []
    for (let i = 0; i < blocks.length; i++) {
      if (i === 0) {
        if (!nextCheck) continue
        if (nextCheck !== blocks[i].prev_hash) {
          errors = [...errors, { message: `Chain broken on height ${blocks[i].height}`, block: blocks[i] }]
        }
        continue
      }
      const prevBlock = blocks[i - 1]
      const block = blocks[i]
      if (blockHash(prevBlock) !== block.prev_hash) {
        errors = [...errors, { message: `Chain broken on height ${block.height}`, prevBlock, block }]
      }
    }
    return {
      nextCheck: blockHash(blocks[blocks.length - 1]),
      chainValid: errors.length === 0,
      errors
    }
  }

  // @todo make it private
  async getConfigForBlock (block) {
    const configs = await this.getConfigsCommited()
    return configs.find(item => Number(block) >= item.actualFrom)
  }

  [_private.parseConfigAddress] ({ services }) {
    const pubKeys = services.btc_anchoring.anchoring_keys.map((hex) => Buffer.from(hex, 'hex'))
    const pubKeysLen = services.btc_anchoring.anchoring_keys.length
    const signCount = pubKeysLen <= 4 ? pubKeysLen : Math.ceil(pubKeysLen * 2 / 3) + 1
    const redeemScript = script.multisig.output.encode(signCount, pubKeys)
    const scriptPubKey = script.scriptHash.output.encode(crypto.hash160(redeemScript))
    return address.fromOutputScript(scriptPubKey, networks[services.btc_anchoring.network])
  }

  getState () {
    const { nodes, version, port } = _(this)
    return { nodes, version, port }
  }
}
