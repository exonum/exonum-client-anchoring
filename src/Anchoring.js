import Provider from './Provider'
import * as store from './store/'
import { _, _private, blockHash, to, status } from './common/'
import { verifyBlock } from 'exonum-client'

export default class Anchoring {
  constructor (params) {
    const { provider, driver } = Object.assign({}, {}, params)

    this.provider = new Provider(provider)
    this.driver = driver

    _(this).anchorTx = []
    _(this).anchorHeight = 0

    this.getAllAnchorTransaction()
  }

  async getAllAnchorTransaction () {
    const configsCommited = await this.provider.getConfigsCommited()
    const configsAddresses = Object.keys(configsCommited
      .reduce((sum, item) => Object.assign({}, sum, { [item.address]: item.actualFrom }), {}))

    for (let address of configsAddresses) {
      for (let i = 1; ; i++) {
        const { txs, hasMore } = await this.driver[_private.getAddressTransactions](address, i)
        _(this).anchorTx = [..._(this).anchorTx, ...txs]
        _(this).anchorHeight = Number(txs[txs.length - 1].blockHeight)

        if (!hasMore) {
          _(this).anchorsLoaded = new Date()
          break
        }
      }
    }
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
    const { validatorKeys, frequency } = await this.getConfigForBlock(height)
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

  // @todo make it private
  async getConfigForBlock (block) {
    _(this).configsCommited = await this.provider.getConfigsCommited()
    return _(this).configsCommited.find(item => Number(block) >= item.actualFrom)
  }

  // @todo make it private
  handleError (err) {
    // console.log(err)
    if (Array.isArray(err)) {
      err.forEach(item => this.handleError(item))
      return
    }
    _(this).errorsList = [..._(this).errorsList, err]
  }

  getState () {
    const {} = _(this)

    return {
      provider: this.provider.getState()
    }
  }

  // @todo make it private
  async safeState () {
    const [save, err] = await to(store.save(this.getState()))
    if (err) throw err
    return save
  }
}
