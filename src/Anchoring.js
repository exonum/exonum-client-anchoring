import axios from 'axios'

// private data
const map = new WeakMap()
const _ = key => {
  if (!map.has(key)) {
    map.set(key, {})
  }
  return map.get(key)
}
// private methods
const loadAnchorChain = Symbol('loadAnchorChain')

export default class Anchoring {
  constructor (params) {
    const { url, prefix, version, anchorStep } = Object.assign({}, {
      url: 'http://localhost:8000/',
      version: 'v1',
      prefix: 'api',
      anchorStep: 1000
    }, params)

    _(this).anchoringPath = `${url}${prefix}/services/btc_anchoring/${version}`
    _(this).explorerPath = `${url}${prefix}/services/btc_anchoring/${version}`
    _(this).anchorStep = anchorStep

    _(this).exonumPrefix = '45584f4e554d'
    _(this).blocksLimit = 1000

    this[loadAnchorChain]()
  }

  getActualAddress () {
    return axios.get(`${_(this).anchoringPath}/address/actual`).then(({ data }) => data)
  }

  async [loadAnchorChain] () {
    _(this).address = await this.getActualAddress()
    console.log(_(this).address)
  }
}
