import Driver from './Driver'
import { http } from '../common/'

export default class ChainBtc extends Driver {
  constructor (params) {
    super()

    const { version, token } = Object.assign({
      version: 'v3',
      token: null
    }, params)

    this.params = { api_key: token }
    this.api = `https://chain.api.btc.com/${version}`
    this.txLoadLimit = 200
  }

  getOpReturnFromTx (tx) {
    return tx.outputs[1] && tx.outputs[1].script_hex
  }

  getAddressTransactions ({ address, pagesize, page }) {
    return http.get({
      url: `${this.api}/address/${address}/tx`,
      params: Object.assign({}, this.params, {
        page,
        pagesize
      })
    }).then((data) => data.data.list)
  }
}
