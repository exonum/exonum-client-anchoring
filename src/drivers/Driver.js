import { to, byteArrayToInt, _, _private } from '../common/'
import { hexadecimalToUint8Array } from 'exonum-client'

export default class Driver {
  constructor () {
    _(this).exonumPrefix = '45584f4e554d'
  }

  async [_private.getAddressTransactions] (address, page) {
    const [txs, err] = await to(this.getAddressTransactions({ address, limit: this.txLoadLimit, page }))
    let parsedTx = []
    for (let tx of txs) {
      const opReturn = this.getOpReturnFromTx(tx)
      if (!this.checkOpReturn(opReturn)) continue
      parsedTx.push(Object.assign({}, {
          anchor: { hash: tx.hash }
        },
        this.parseOpReturn(opReturn)
      ))
    }
    // let transactions = []
    // let attemptsCount = 1
    // for (let i = 1; ; ++i) {
    //   const [response, err] = await to(this.getAddressTransactions({ address, limit: this.txLoadLimit, page: i }))
    //   if (err) {
    //     if (attemptsCount >= 5) throw err
    //     i--
    //     attemptsCount++
    //     continue
    //   }
    //   transactions = [...transactions, ...response]
    //   if (response.length < this.txLoadLimit) break
    // }
    return {
      txs: parsedTx,
      hasMore: txs.length === this.txLoadLimit
    }
  }

  // @todo make it private
  parseOpReturn (opReturn) {
    const anchor = opReturn.split(_(this).exonumPrefix)[1]
    return {
      version: byteArrayToInt(hexadecimalToUint8Array(anchor.slice(0, 2))),
      payloadType: byteArrayToInt(hexadecimalToUint8Array(anchor.slice(2, 4))),
      blockHeight: byteArrayToInt(hexadecimalToUint8Array(anchor.slice(4, 20))),
      blockHash: anchor.slice(20, 84)
    }
  }

  checkOpReturn (opReturn) {
    return new RegExp(`${_(this).exonumPrefix}[0-9a-z]{84,148}$`).test(opReturn)
  }
}
