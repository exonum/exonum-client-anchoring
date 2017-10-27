import Provider from './Provider'
import { _, _private, blockHash } from './common/'

const fs = require('fs')

export default class Anchoring {
  constructor (params) {
    const { provider, driver } = Object.assign({}, {}, params)

    this.provider = new Provider(provider)
    this.driver = driver

    _(this).blocksLimit = 1000
    _(this).errorsList = []

    this[_private.loadAnchorChain]()
  }

  async [_private.loadAnchorChain] () {
    let nextCheck
    let lastBlock = 0
    let anchorHeight = 0

    let { config, next } = await this.getConfigForBlock(lastBlock)

    for (let i = 1; ; i++) {
      const { txs, hasMore } = await this.driver[_private.getAddressTransactions](config.address, i)
      for (let j = 0; j < txs.length; j++) {
        const tx = txs[j]
        anchorHeight += config.frequency

        if (next && next.actualFrom <= tx.blockHeight) {
          const { config, next } = await this.getConfigForBlock(lastBlock)
          console.log(config, next)
        }

        if (anchorHeight !== tx.blockHeight) {
          this.handleError({ message: `Missed anchor on heigth:${tx.blockHeight}, should be: ${anchorHeight}`, tx })
        }
        const { blocks, errors, nextCheck, valid } = await this.provider.getBlocks(lastBlock, tx.blockHeight, nextCheck)
        if (!valid) this.handleError(errors)
        lastBlock = tx.blockHeight

        // check Anchoring
        const anchorBlock = blocks.find(item => Number(item.height) === tx.blockHeight)
        if (blockHash(anchorBlock) !== tx.blockHash) {
          this.handleError({
            message: `Block hash not equal to anchor hash on height: ${tx.blockHeight}`, block: anchorBlock, tx
          })
        }
      }

      if (!hasMore) break
    }

    console.log(_(this).errorsList, _(this).errorsList.length)

    // fs.writeFile('data.json', JSON.stringify(data))

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
}
