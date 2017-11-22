# Validity check for Exonum blockchain
[![Build status][travis-image]][travis-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![js-standard-style][codestyle-image]][codestyle-url]
[![License][license-image]][license-url]

[sause-image]: https://saucelabs.com/browser-matrix/Exonum.svg
[sause-url]: https://saucelabs.com/u/Exonum
[travis-image]: https://img.shields.io/travis/qvantor/exonum-anchoring/master.svg
[travis-url]: https://travis-ci.org/qvantor/exonum-anchoring
[coveralls-image]: https://coveralls.io/repos/github/qvantor/exonum-anchoring/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/qvantor/exonum-anchoring?branch=master
[codestyle-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[codestyle-url]: http://standardjs.com
[license-image]: https://img.shields.io/github/license/exonum/exonum-client.svg?style=flat-square
[license-url]: https://opensource.org/licenses/Apache-2.0

## Browser Support
[![Sauce Test Status][sause-image]][sause-url]


## Core concepts
When you initialize new instance of Exonum Anchoring Client, it's automatically start loading anchoring transactions from bitcoin network using driver. When every part of transactions is loaded - `loaded` event is dispatched. When all anchoring transactions is loaded - `synchronized` event is dispatched.
#### Driver
Driver it's a class, which is provide bitcoin transactions([anchoring transactions](https://exonum.com/doc/advanced/bitcoin-anchoring/)) from HTTP API, to Exonum Anchoring Client. By default implemented two driver for [Blocktrail API](https://blocktrail.com) and [Insight API](https://github.com/bitpay/insight-api). If you need custom Driver for another API, you can implement it, by extending Driver class.
#### Provider
Provider it's a class, which is provide Exonum transactions and blocks from HTTP API, to Exonum Anchoring Client.

## Check validity of blocks and transactions
```js
import * as exonum from 'exonum-client-anchoring'

const config = {
  driver: exonum.drivers.Blocktrail({
    token: 'TOKEN' // Yours Blocktrail API Token here. Required
    network: 'BTC' // BTC for mainnet, tBTC for testnet. Optional
    version: 'v1' // Version of Blocktrail API. Optional
  }),
  provider: {
    nodes: ['http://192.168.1.1:8000', 'http://192.168.1.2:8000'] // list of IP addresses of Exonum nodes
  }
}

const anchoring = new exonum.Anchoring(config)

const blockHeight = 10000
anchoring.blockStatus(blockHeight)
  .then(data => /* work here with data object */) // data will contain status of block and proof
  .catch(err => /* error handler */) //err will be returned in case of network or unexpected errors
  
const transactionHash = 'b0459b712bca9a95bcb09b922f90f8a8bd28270475b169b7bcc281270ab38338'
anchoring.txStatus(transactionHash)
  .then(data => /* work here with data object */) // data will contain status of transaction and proof
  .catch(err => /* error handler */) //err will be returned in case of network or unexpected errors

```

### Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by [Sauce Labs][homepage]

[homepage]: https://saucelabs.com
