import { script, networks, address, crypto } from 'bitcoinjs-lib'
import { _, blockHash, http, to } from './common/'
import { Buffer } from 'buffer'

export default class Provider {
  constructor (params) {
    const { nodes, version } = Object.assign({
      nodes: ['http://localhost:8000'],
      version: 'v1'
    }, params)

    this.nodes = nodes
    this.version = version
    this.activeNode = 0

    this.setPathParams()
    _(this).blocksLoadLimit = 1000

    this.cfgsCommited = null
  }

  setPathParams () {
    this.path = {
      anchoring: `${this.nodes[this.activeNode]}/api/services/btc_anchoring/${this.version}`,
      explorer: `${this.nodes[this.activeNode]}/api/explorer/${this.version}`,
      configuration: `${this.nodes[this.activeNode]}/api/services/configuration/${this.version}`,
      system: `${this.nodes[this.activeNode]}/api/system/${this.version}`
    }
  }

  async getFromNode ({ key, url, params }) {
    const tries = this.nodes.length > 1 ? 2 : 5
    const [res, err] = await to(http.get({ url: `${this.path[key]}${url}`, tries, params }))
    if (err) {
      const errors = this.nodes.length > 1 ? [err] : err
      for (let i = 1; i < this.nodes.length; i++) {
        this.activeNode = i
        this.setPathParams()
        const [nextRes, nextErr] = await to(http.get({ url: `${this.path[key]}${url}`, tries, params }))
        if (nextErr) errors.push(nextErr)
        if (nextRes) return nextRes
      }
      this.activeNode = 0
      throw errors
    }
    return res
  }

  getConfigsCommited () {
    if (this.cfgsCommited && new Date() - this.cfgsCommited.date < 600000) {
      return this.cfgsCommited.cfgs
    } else {
      this.cfgsCommited = { cfgs: this._getConfigsCommited(), date: new Date() }
      return this.cfgsCommited.cfgs
    }
  }

  async _getConfigsCommited () {
    const [configsCommited, err] = await to(this.getFromNode({ key: 'configuration', url: `/configs/committed` }))
    if (err) {
      this.cfgsCommited = null
      throw err
    }
    return configsCommited.map(({ config }) => ({
      actualFrom: config.actual_from,
      frequency: config.services.btc_anchoring.frequency,
      address: this.parseConfigAddress(config),
      validatorKeys: config.validator_keys.map(item => item.consensus_key)
    })).sort((a, b) => a.actualFrom > b.actualFrom)
  }

  async getBlocks (from, at, nextCheck) {
    let count = at - from
    const reqCount = Math.ceil(count / _(this).blocksLoadLimit)
    let blocks = []
    let lastLoaded = from + 1
    for (let i = 1; i <= reqCount; i++) {
      const needCount = count > _(this).blocksLoadLimit ? _(this).blocksLoadLimit : count
      const latest = lastLoaded + needCount
      const [result, err] = await to(this.getFromNode({
        key: 'explorer',
        url: `/blocks`,
        params: { count: needCount, latest }
      }))
      if (err) throw err
      result.sort((a, b) => Number(a.height) - Number(b.height))
      count = count - result.length
      lastLoaded = lastLoaded + result.length
      blocks = [...blocks, ...result]
    }
    if (Number(blocks[0].height) < from) blocks = blocks.filter(item => Number(item.height) > from)

    return Object.assign({ blocks }, this.checkBlocksChain(blocks, nextCheck))
  }

  getBlock (height) {
    return this.getFromNode({ key: 'explorer', url: `/blocks/${height}` })
  }

  getTx (txHash) {
    return this.getFromNode({ key: 'system', url: `/transactions/${txHash}` })
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

  async getConfigForBlock (block) {
    const [configs, err] = await to(this.getConfigsCommited())
    if (err) throw err
    return configs.find(item => Number(block) >= item.actualFrom)
  }

  parseConfigAddress ({ services }) {
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
