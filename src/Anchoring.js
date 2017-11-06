import Provider from './Provider'
import * as store from './store/'
import { _, _private, blockHash, to, status } from './common/'
import { verifyBlock } from 'exonum-client'

export default class Anchoring {
  constructor (params) {
    const { provider, driver } = Object.assign({}, {}, params)

    this.provider = new Provider(provider)
    this.driver = driver

    store.load().then(data => {
      _(this).anchorTx = data.anchorTx || []
      _(this).anchorHeight = data.anchorHeight || 0
      _(this).address = data.address || 0
      _(this).page = data.page || 1
      _(this).anchorsLoaded = false

      this.syncAnchorTransaction()
    })
  }

  async syncAnchorTransaction () {
    await this.getAllAnchorTransaction()
    setTimeout(() => this.syncAnchorTransaction(), 120000)
  }

  async getAllAnchorTransaction () {
    const configsCommited = await this.provider.getConfigsCommited()
    const addresses = Object.keys(configsCommited
      .reduce((sum, item) => Object.assign({}, sum, { [item.address]: item.actualFrom }), {}))

    for (_(this).address; _(this).address < addresses.length; _(this).address++) {
      const address = addresses[_(this).address]
      for (_(this).page; ; _(this).page++) {
        const { txs, hasMore } = await this.driver[_private.getAddressTransactions](address, _(this).page)
        const filteredTxs = txs.filter(item => Number(item.blockHeight) > _(this).anchorHeight)
        _(this).anchorTx = [..._(this).anchorTx, ...filteredTxs]

        if (filteredTxs.length > 0)
          _(this).anchorHeight = Number(filteredTxs[filteredTxs.length - 1].blockHeight)

        this.safeState()
        if (!hasMore) {
          _(this).anchorsLoaded = new Date()
          break
        }
      }
    }
    _(this).address--
  }

  getAnchorTx (height) {
    if (_(this).anchorHeight >= height) {
      return _(this).anchorTx.find(item => item.blockHeight >= height)
    }
  }

  getAnchorTxAsync (height) {
    return new Promise(resolve => {
      const anchor = this.getAnchorTx(height)
      if (anchor) resolve(anchor)

      //@todo here should be loadTX event listener
      const interval = setInterval(() => {
        const anchor = this.getAnchorTx(height)
        if (_(this).anchorsLoaded && !anchor) {
          clearInterval(interval)
          resolve(false)
        }
        if (anchor) {
          clearInterval(interval)
          resolve(anchor)
        }
      }, 300)
    })
  }

  async blockStatus (height) {
    const { validatorKeys, frequency } = await this.provider.getConfigForBlock(height)
    const block = await this.provider.getBlock(height)
    if (block === null) return status(0)

    const blockValid = verifyBlock(block, validatorKeys, block.precommits[0].network_id)
    if (!blockValid) return status(1, { block })

    const anchorTx = await this.getAnchorTxAsync(height)
    if (anchorTx.blockHeight === height) {
      const proof = { anchorTx, block }
      if (anchorTx.blockHash !== blockHash(block.block)) return status(4, proof)
      return status(11, proof)
    }

    const { blocks, errors, chainValid } = await this.provider
      .getBlocks(height, anchorTx ? anchorTx.blockHeight : height + frequency, blockHash(block.block))

    const proof = { errors, block, blocks, anchorTx }
    if (!anchorTx) return chainValid ? status(10, proof) : status(2, proof)

    if (anchorTx.blockHash !== blockHash(blocks[blocks.length - 1]))
      return chainValid ? status(4, proof) : status(3, proof)

    return status(11, proof)
  }

  getState () {
    const { address, page, anchorTx, anchorHeight } = _(this)
    return { address, page, anchorHeight, anchorTx, provider: this.provider.getState() }
  }

  // @todo make it private
  async safeState () {
    const [save, err] = await to(store.save(this.getState()))
    if (err) throw err
    return save
  }
}
