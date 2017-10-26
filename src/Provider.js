import axios from 'axios'
import { script, networks, address, crypto } from 'bitcoinjs-lib'
import { _, to, _private, blockHash } from './common/'
import { Buffer } from 'buffer'

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
    _(this).blocksLoadLimit = 1000
  }

  async getConfigsCommited () {
    const configsCommited = await this[_private.request]({ url: `${_(this).path.configuration}/configs/committed` })
    return configsCommited.map(({ config }) => ({
      actualFrom: config.actual_from,
      frequency: config.services.btc_anchoring.frequency,
      address: this[_private.parseConfigAddress](config)
    })).sort((a, b) => a.actualFrom < b.actualFrom)
  }

  async getBlocks (from, to, nextCheck) {
    let count = (to + 1) - from
    const reqCount = Math.ceil(count / _(this).blocksLoadLimit)

    let blocks = []
    let lastLoaded = from
    for (let i = 1; i <= reqCount; i++) {
      const needCount = count > _(this).blocksLoadLimit ? _(this).blocksLoadLimit : count
      const result = await this[_private.request]({
        url: `${_(this).path.explorer}/blocks`,
        params: { count: needCount, latest: lastLoaded + needCount }
      })
      result.sort((a, b) => Number(a.height) - Number(b.height))
      count = count - result.length
      lastLoaded = lastLoaded + result.length
      blocks = [...blocks, ...result]
    }
    return Object.assign({ blocks }, this.checkBlocksChain(blocks, nextCheck))
  }

  checkBlocksChain (blocks, nextCheck) {
    let errors = []
    for (let i = 0; i < blocks.length; i++) {
      if (i === 0) {
        if (!nextCheck) continue
        if (nextCheck !== blockHash(blocks[i])) {
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
      valid: errors.length === 0,
      errors
    }
  }

  async [_private.request] ({ url, params }) {
    const [res, err] = await to(axios.get(url, { params }).then(({ data }) => data))
    // @todo add error handling and trying count
    return res
  }

  [_private.parseConfigAddress] ({ services }) {
    const pubKeys = services.btc_anchoring.anchoring_keys.map((hex) => Buffer.from(hex, 'hex'))
    const pubKeysLen = services.btc_anchoring.anchoring_keys.length
    const signCount = pubKeysLen <= 4 ? pubKeysLen : Math.ceil(pubKeysLen * 2 / 3) + 1
    const redeemScript = script.multisig.output.encode(signCount, pubKeys)
    const scriptPubKey = script.scriptHash.output.encode(crypto.hash160(redeemScript))
    return address.fromOutputScript(scriptPubKey, networks[services.btc_anchoring.network])
  }
}
