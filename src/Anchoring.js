import Provider from './Provider'
import * as store from './store/'
import { _, _private, blockHash, to } from './common/'

let defaultIteration = {
  page: 1,
  txNumber: 0
}

export default class Anchoring {
  constructor (params) {
    store.load()
      .then(data => {
        const { provider, driver } = Object.assign({}, {}, params)

        this.provider = new Provider(provider)
        this.driver = driver

        _(this).blocksLimit = 1000
        _(this).errorsList = data.errorsList || []

        console.log(data)
        const page = Math.floor(data.txProcessed / this.driver.txLoadLimit)
        const txNumber = data.txProcessed - (page * this.driver.txLoadLimit)

        this[_private.loadAnchorChain](data.lastTx || {})
      })
  }

  async [_private.loadAnchorChain] ({ iteration = defaultIteration, blockHeight = 0, nextCheck }) {
    _(this).lastTx = { blockHeight }

    for (iteration.page; ; iteration.page++) {
      let { config } = await this.getConfigForBlock(_(this).lastTx.blockHeight)
      const { txs, hasMore } = await this.driver[_private.getAddressTransactions](config.address, iteration.page)

      for (iteration.txNumber; iteration.txNumber < txs.length; iteration.txNumber++) {
        this.safeState()
        const tx = txs[iteration.txNumber]
        // anchorHeight += config.frequency
        // if (anchorHeight !== tx.blockHeight) {
        //   this.handleError({ message: `Missed anchor on heigth:${tx.blockHeight}, should be: ${anchorHeight}`, tx })
        // }
        const checkedBlocks = await this.provider.getBlocks(_(this).lastTx.blockHeight, tx.blockHeight, nextCheck)
        const { blocks, errors, valid } = checkedBlocks
        nextCheck = checkedBlocks.nextCheck
        _(this).lastTx = Object.assign({}, tx, { iteration, nextCheck })
        // _(this).txProcessed = (iteration.page - 1) * this.driver.txLoadLimit + iteration.txNumber
        if (!valid) this.handleError(errors)

        // check Anchoring
        const anchorBlock = blocks.find(item => Number(item.height) === tx.blockHeight)
        if (blockHash(anchorBlock) !== tx.blockHash) {
          this.handleError({
            message: `Block hash not equal to anchor hash on height: ${tx.blockHeight}`, block: anchorBlock, tx
          })
        }
      }
      iteration.txNumber = 0

      if (!hasMore) break
    }

    console.log(_(this).errorsList, _(this).errorsList.length)
  }

  // @todo make it private
  async getConfigForBlock (block) {
    _(this).configsCommited = await this.provider.getConfigsCommited()
    const i = _(this).configsCommited.findIndex(item => Number(block) >= item.actualFrom)
    return { config: _(this).configsCommited[i], next: _(this).configsCommited[i - 1] }
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
    const { errorsList, txProcessed, lastTx, nextCheck } = _(this)

    return {
      errorsList,
      txProcessed,
      nextCheck,
      lastTx,
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
