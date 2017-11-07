import Provider from './Provider'
import Events from './Events'
import * as store from './store/'
import { _, _private, blockHash, to, status } from './common/'
import { verifyBlock } from 'exonum-client'

const LOADED = 'loaded'
const SYNCHRONIZED = 'synchronized'

export default class Anchoring extends Events {
  constructor (params) {
    super()
    const { provider, driver } = Object.assign({}, {}, params)

    this.provider = new Provider(provider)
    this.driver = driver

    store.load().then(data => {
      _(this).anchorTxs = data.anchorTxs || []
      _(this).anchorHeight = data.anchorHeight || 0
      _(this).address = data.address || 0
      _(this).page = data.page || 1
      _(this).anchorsLoaded = false

      this[_private.syncAnchorTransaction]()
    })
  }

  async [_private.syncAnchorTransaction] () {
    await this[_private.getAllAnchorTransaction]()
    setTimeout(() => this[_private.syncAnchorTransaction](), 120000)
  }

  async [_private.getAllAnchorTransaction] () {
    const configsCommited = await this.provider.getConfigsCommited()
    const addresses = Object.keys(configsCommited
      .reduce((sum, item) => Object.assign({}, sum, { [item.address]: item.actualFrom }), {}))

    for (_(this).address; _(this).address < addresses.length; _(this).address++) {
      const address = addresses[_(this).address]
      for (_(this).page; ; _(this).page++) {
        const { txs, hasMore } = await this.driver[_private.getAddressTransactions](address, _(this).page)
        const filteredTxs = txs.filter(item => Number(item[3]) > _(this).anchorHeight)
        _(this).anchorTxs = [..._(this).anchorTxs, ...filteredTxs]

        if (filteredTxs.length > 0) {
          _(this).anchorHeight = Number(filteredTxs[filteredTxs.length - 1][3])
          this[_private.dispatch](LOADED, _(this).anchorHeight)
        }

        this[_private.safeState]()
        if (!hasMore) break
      }
    }
    this[_private.dispatch](SYNCHRONIZED, _(this).anchorHeight)
    _(this).anchorsLoaded = new Date()
    _(this).address--
  }

  [_private.getAnchorTx] (height) {
    if (_(this).anchorHeight >= height) {
      return _(this).anchorTxs.find(item => item[3] >= height)
    }
  }

  [_private.getAnchorTxAsync] (height) {
    return new Promise(resolve => {
      const anchor = this[_private.getAnchorTx](height)
      if (anchor) resolve(anchor)

      const onLoaded = () => {
        const anchor = this[_private.getAnchorTx](height)
        if (anchor) {
          this.off(LOADED, onLoaded)
          this.off(SYNCHRONIZED, onSync)
          resolve(anchor)
        }
      }
      this.on(LOADED, onLoaded)

      const onSync = () => {
        const anchor = this[_private.getAnchorTx](height)
        this.off(LOADED, onLoaded)
        this.off(SYNCHRONIZED, onSync)
        anchor ? resolve(anchor) : resolve(null)
      }
      this.on(SYNCHRONIZED, onSync)
    })
  }

  async blockStatus (height) {
    const { validatorKeys, frequency } = await this.provider.getConfigForBlock(height)
    const block = await this.provider.getBlock(height)
    if (block === null) return status(0)

    const blockValid = verifyBlock(block, validatorKeys, block.precommits[0].network_id)
    if (!blockValid) return status(1, { block })

    const anchorTx = await this[_private.getAnchorTxAsync](height)
    if (anchorTx && anchorTx[3] === height) {
      const proof = { anchorTx, block }
      if (anchorTx[4] !== blockHash(block.block)) return status(4, proof)
      return status(11, proof)
    }

    const { blocks, errors, chainValid } = await this.provider
      .getBlocks(height, anchorTx ? anchorTx[3] : height + frequency, blockHash(block.block))

    const proof = { errors, block, blocks, anchorTx }
    if (!anchorTx) return chainValid ? status(10, proof) : status(2, proof)

    if (anchorTx[4] !== blockHash(blocks[blocks.length - 1]))
      return chainValid ? status(4, proof) : status(3, proof)

    return status(11, proof)
  }

  [_private.getState] () {
    const { address, page, anchorTxs, anchorHeight } = _(this)
    return { address, page, anchorHeight, anchorTxs, provider: this.provider.getState() }
  }

  async [_private.safeState] () {
    const [save, err] = await to(store.save(this[_private.getState]()))
    if (err) throw err
    return save
  }
}
