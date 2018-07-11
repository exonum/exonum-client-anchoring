import Driver from './Driver'
import { http } from '../common/'

export default class BlockCypher extends Driver {
  constructor (params) {
    super()

    const { version, token, network } = Object.assign({
      version: 'v1',
      network: 'main',
      token: null
    }, params)

    this.params = { api_key: token }
    this.api = `https://api.blockcypher.com/${version}/btc/${network}`
    this.txLoadLimit = 50
  }

  getOpReturnFromTx (tx) {
    return tx.outputs[1] && tx.outputs[1].script_hex
  }

  getAddressTransactions ({ address, pagesize, page }) {
    return http.get({
      url: `${this.api}/addrs/${address}`,
      params: Object.assign({}, this.params, {
        page,
        pagesize
      })
    }).then((data) => {
      return data.txrefs
    })
  }
}
