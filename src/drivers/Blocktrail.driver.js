import Driver from './Driver'
import { http } from '../common/'

export default class Blocktrail extends Driver {
  constructor (params) {
    super()

    const { network, version, token } = Object.assign({
      network: 'BTC',
      version: 'v1',
      token: null
    }, params)

    this.params = { api_key: token }
    this.api = `https://api.blocktrail.com/${version}/${network}`
    this.txLoadLimit = 200
  }

  getOpReturnFromTx (tx) {
    return tx.outputs[1] && tx.outputs[1].script_hex
  }

  getAddressTransactions ({ address, limit, page }) {
    return http.get({
      url: `${this.api}/address/${address}/transactions`,
      params: Object.assign({}, this.params, {
        limit,
        page,
        sort_dir: 'asc'
      })
    }).then((data) => data.data)
  }
}
