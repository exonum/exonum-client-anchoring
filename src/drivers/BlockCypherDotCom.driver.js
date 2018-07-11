import Driver from './Driver'
import { http } from '../common/'

export default class BlockCypherDotCom extends Driver {
  constructor (params) {
    super()

    const { version, token } = Object.assign({
      version: 'v1',
      token: null
    }, params)

    this.params = { api_key: token }
    this.api = `https://api.blockcypher.com/${version}`
    this.txLoadLimit = 50
  }

  getOpReturnFromTx (tx) {
    return tx.outputs[1] && tx.outputs[1].script_hex
  }

  getAddressTransactions ({ address, pagesize, page }) {
    return http.get({
      url: `${this.api}/btc/main/addrs/${address}`,
      params: Object.assign({}, this.params, {
        page,
        pagesize
      })
    }).then((data) => {
      console.log(data)
      return data
    })
  }
}
