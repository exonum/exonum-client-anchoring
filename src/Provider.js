import { script, networks, address, crypto } from 'bitcoinjs-lib'
import { _, blockHash, http, to } from './common/'
import { Buffer } from 'buffer'
import { Hash, MapProof, merkleProof, newType, Uint16 } from 'exonum-client'
import bigInt from 'big-integer/BigInteger'

const ANCHORING_SERVICE_ID = 3

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
      configuration: `${this.nodes[this.activeNode]}/api/services/configuration/${this.version}`
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
      address: Provider.parseConfigAddress(config),
      validatorKeys: config.validator_keys.map(item => item.consensus_key)
    })).sort((a, b) => a.actualFrom > b.actualFrom)
  }

  async getBlocks (from, at, nextCheck) {
    let count = at - from
    const reqCount = Math.ceil(count / _(this).blocksLoadLimit)
    let blocks = []
    let lastLoaded = from
    for (let i = 1; i <= reqCount; i++) {
      const needCount = count > _(this).blocksLoadLimit ? _(this).blocksLoadLimit : count
      const latest = lastLoaded + needCount
      const [result, err] = await to(this.getFromNode({
        key: 'explorer',
        url: `/blocks`,
        params: { count: needCount, latest }
      }))
      if (err) throw err
      result.blocks.sort((a, b) => Number(a.height) - Number(b.height))
      count = count - result.blocks.length
      lastLoaded = lastLoaded + result.blocks.length
      blocks = [...blocks, ...result.blocks]
    }
    if (Number(blocks[0].height) < from) blocks = blocks.filter(item => Number(item.height) > from)

    return Object.assign({ blocks }, this.checkBlocksChain(blocks, nextCheck))
  }

  getBlock (height) {
    return this.getFromNode({ key: 'explorer', url: `/block`, params: { height } })
  }

  async getBlockHeaderProof (height) {
    return this.getFromNode({ key: 'anchoring', url: `/block_header_proof`, params: { height } })
  }

  getTx (hash) {
    return this.getFromNode({ key: 'explorer', url: `/transactions`, params: { hash } })
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

  verifyBlockHeaderProof (height, proof) {
    const tableProof = new MapProof(proof.to_table, Hash, Hash)
    if (tableProof.merkleRoot !== proof.latest_authorized_block.block.state_hash) return false

    const TableKey = newType({
      fields: [
        { name: 'service_id', type: Uint16 },
        { name: 'table_index', type: Uint16 }
      ]
    })
    const tableKey = TableKey.hash({
      service_id: ANCHORING_SERVICE_ID,
      table_index: 0
    })
    const blocksHash = tableProof.entries.get(tableKey)
    if (typeof blocksHash === 'undefined') return false

    const count = bigInt(proof.latest_authorized_block.block.height).valueOf()
    const elements = merkleProof(blocksHash, count, proof.to_block_header, [height, height])
    if (elements.length !== 1) return false

    return true
  }

  async getConfigForBlock (block) {
    const [configs, err] = await to(this.getConfigsCommited())
    if (err) throw err
    return configs.find(item => Number(block) >= item.actualFrom)
  }

  static parseConfigAddress ({ services }) {
    const pubKeys = services.btc_anchoring.public_keys.map((hex) => Buffer.from(hex, 'hex'))
    const pubKeysLen = services.btc_anchoring.public_keys.length
    const signCount = pubKeysLen < 4 ? pubKeysLen : pubKeysLen * 2 / 3 + 1
    const redeemScript = script.multisig.output.encode(signCount, pubKeys)
    const scriptPubKey = script.witnessScriptHash.output.encode(crypto.sha256(redeemScript))
    return address.fromOutputScript(scriptPubKey, networks[services.btc_anchoring.network])
  }

  getState () {
    const { nodes, version, port } = _(this)
    return { nodes, version, port }
  }
}
