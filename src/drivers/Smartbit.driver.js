import Driver from './Driver'
import { http, to } from '../common/'
import * as store from '../store/'
import { stringToUint8Array, hash } from 'exonum-client'

const NEXT_EMPTY = 'NEXT_EMPTY'

export default class Smartbit extends Driver {
  constructor (params) {
    super()

    const { version = 'v1', network = 'mainnet' } = params

    const networkPrefix = network === 'testnet' ? 'testnet-api' : 'api'

    this.params = {}
    this.api = `https://${networkPrefix}.smartbit.com.au/${version}`
    this.txLoadLimit = 50
    this.txHashKey = 'txid'
    this.driverId = 'smartbit' + hash(stringToUint8Array(JSON.stringify({ version, network })))

    this.pagesLoaded = false
    this.loadPages()
  }

  loadPages () {
    return store.load(this.driverId).then(e => {
      this.pages = Object.keys(e).length > 0 ? e : { 1: null }
      this.pagesLoaded = true
    })
  }

  getOpReturnFromTx (tx) {
    return tx.op_return.hex
  }

  async getAddressTransactions ({ address, pagesize, page }) {
    if (!this.pagesLoaded) await to(this.loadPages())
    if (this.pages[page] === NEXT_EMPTY) return []
    const [data, err] = await to(http.get({
      url: `${this.api}/blockchain/address/${address}/op-returns`,
      params: Object.assign({}, this.params, {
        next: this.pages[page],
        limit: pagesize,
        sort: 'time',
        dir: 'asc'
      })
    }))
    if (err) throw err
    this.pages[page + 1] = data.paging.next || NEXT_EMPTY
    const saveErr = await to(store.save(this.pages, this.driverId))[1]
    if (saveErr) throw saveErr
    return data.op_returns
  }
}
