import Provider from './Provider'
import { _ } from './common/'

const loadAnchorChain = Symbol('loadAnchorChain')

export default class Anchoring {
  constructor (params) {
    const { provider, network } = Object.assign({}, {
      network: 'bitcoin'
    }, params)

    this.provider = new Provider(Object.assign({}, provider, { network }))

    _(this).exonumPrefix = '45584f4e554d'
    _(this).blocksLimit = 1000

    this[loadAnchorChain]()
  }

  async [loadAnchorChain] () {
    _(this).actualAddress = await this.provider.getActualAddress()
    _(this).configsCommited = await this.provider.getConfigsCommited()
    console.log(_(this).configsCommited)
  }
}
