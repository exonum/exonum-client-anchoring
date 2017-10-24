import { to } from '../common/'

export default class Driver {
  async getAddressTransactions (address) {
    let transactions = []
    let attemptsCount = 1
    for (let i = 1; ; ++i) {
      const [response, err] = await to(this._getAddressTransactions({ address, limit: this.txLoadLimit, page: i }))
      if (err) {
        if (attemptsCount >= 5) throw err
        i--
        attemptsCount++
        continue
      }
      transactions = [...transactions, ...response]
      if (response.length < this.txLoadLimit) break
    }
    return transactions
  }
}
