# Validity check for Exonum blockchain
[![Build status][travis-image]][travis-url]
[![npm version][npmjs-image]][npmjs-url]
[![Coverage Status][coveralls-image]][coveralls-url]
[![js-standard-style][codestyle-image]][codestyle-url]
[![License][license-image]][license-url]

[travis-image]: https://travis-ci.org/exonum/exonum-client-anchoring.svg?branch=master
[travis-url]: https://travis-ci.org/exonum/exonum-client-anchoring
[npmjs-image]: https://img.shields.io/npm/v/exonum-client-anchoring.svg
[npmjs-url]: https://www.npmjs.com/package/exonum-client-anchoring
[coveralls-image]: https://coveralls.io/repos/github/exonum/exonum-client-anchoring/badge.svg?branch=master
[coveralls-url]: https://coveralls.io/github/exonum/exonum-client-anchoring?branch=master
[codestyle-image]: https://img.shields.io/badge/code%20style-standard-brightgreen.svg
[codestyle-url]: http://standardjs.com
[license-image]: https://img.shields.io/github/license/exonum/exonum-client.svg?style=flat-square
[license-url]: https://opensource.org/licenses/Apache-2.0

- [Browser Support](#browser-support)
- [Core concepts](#core-concepts)
  - [Driver](#driver)
  - [Provider](#provider)
- [Check validity of blocks and transactions](#check-validity-of-blocks-and-transactions)
- [Config](#config)
  - [driver](#driver---instance-of-driver-class-required)
  - [provider](#provider---object-optional)
  - [cache](#cache---boolean-optional)
  - [syncTimeout](#synctimeout---number-optional)
- [Events](#events)
  - [initialized](#initialized)
  - [loaded](#loaded)
  - [stopped](#stopped)
  - [synchronized](#synchronized)
  - [error](#error)
- [Custom drivers](#custom-drivers)
  - [getAddressTransactions](#getaddresstransactions)
  - [getOpReturnFromTx](#getopreturnfromtx)
  - [txLoadLimit](#txloadlimit)
- [Instance methods](#instance-methods)
  - [blockStatus](#blockstatusblockheight)
  - [txStatus](#txstatustxhash)
  - [getStatus](#getstatus)
  - [syncStop](#syncstop)
  - [on](#oneventname-callback)
  - [off](#offeventname-callback)
- [Big Thanks](#big-thanks)
- [License](#license)

## Browser Support
[![Sauce Test Status][sause-image]][sause-url]

[sause-image]: https://saucelabs.com/browser-matrix/Exonum.svg
[sause-url]: https://saucelabs.com/u/Exonum

## Core concepts

When you initialize a new instance of exonum-anchoring, it automatically starts
loading anchoring transactions from the bitcoin network using driver. Loading of
every part of the transactions causes a `loaded` event to be dispatched. When
all anchoring transactions are loaded a `synchronized` event is dispatched.
After all anchoring transactions are loaded, exonum-anchoring checks
availability of new transactions at regular intervals.

#### Driver

Driver is a class, which provides bitcoin transactions
([anchoring transactions](https://exonum.com/doc/advanced/bitcoin-anchoring/))
from HTTP API to the Exonum Anchoring Client. By default  two drivers are
implemented - for [ChainBtc API](https://chainbtc.com) and
[Insight API](https://github.com/bitpay/insight-api). If you need a custom
driver for another API, you can implement it by extending the Driver class.

#### Provider

Provider is a class, which provides Exonum transactions and blocks from HTTP
API to the Exonum Anchoring Client.

## Check validity of blocks and transactions

```js
import exonum from 'exonum-client-anchoring'

const config = {
  driver: exonum.drivers.ChainBtc({
    token: 'TOKEN' // Your ChainBtc API Token here. Required
    network: 'BTC' // BTC for mainnet, tBTC for testnet. Optional
    version: 'v1' // Version of ChainBtc API. Optional
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
## Config

#### driver - `instance of Driver class`, required

An instance of the Driver class, which provides anchoring transactions from the
bitcoin blockchain to exonum-anchoring.

#### provider - `object`, optional

Includes a set of parameters about your Exonum blockchain.

* **nodes - `Array of IPs`, optional**  
List of IP addresses of your Exonum nodes with a port. All nodes in this list
should be with HTTP module and CORS enabled.  
*Default:* `['http://localhost:8000']`
* **version - `string`, optional**  
Exonum API version.  
*Default:* `v1`

#### cache - `boolean`, optional

If cache is disabled, exonum-anchoring will ignore the cache and begin loading
from the first transaction.  
*Default:* `false`

#### syncTimeout - `number`, optional
When all anchoring transactions are loaded, exonum-anchoring checks availability
of new transactions at regular intervals. `syncTimeout` sets these intervals in
seconds.  
*Default:* `120` seconds

## Events

During work exonum-anchoring will be dispatching events; to subscribe to/
unsubscribe from the event you can use standard API:

```js
const eventHandler = event => {/* work here with event */}
anchoring.on('loaded', eventHandler) // subscribe
anchoring.off('loaded', eventHandler) // unsubscribe
```
#### `initialized`

Fires after cache is loaded (if cache loading is enabled), when anchoring
transactions synchronization starts.

#### `loaded`

Fires when a list of anchoring transactions according to the request is loaded.

#### `stopped`

Fires when synchronization stops after `syncStop` method is called. On
dispatching this event exonum-anchoring instance deactivates.

#### `synchronized`

Fires when all anchoring transactions from Provider are synchronized. Also will
fire after every check for new transactions according to `syncTimeout` config
parameter.

#### `error`

Fires when an unexpected error occurs. Such errors include cache boot errors,
cache saving errors, network connection errors.

## Custom drivers

To create a custom driver you should extend standard Driver class.
Your custom driver should have two methods and one parameter inside:

#### `getAddressTransactions`

A method which takes an object parameter with three fields
`{address, limit, page}` and returns a promise, where `address` is a
bitcoin address from which a transactions list needs to be obtained, `limit`
and `page` are pagination data. *Note, transactions are sorted from the oldest
to the newest.*

#### `getOpReturnFromTx`

A method which takes a single transaction and returns `OP_RETURN` from this
transaction.

#### `txLoadLimit`

A maximum number of transactions that can be obtained by a single request
according to provider limitations.

Here you can see an example of a driver to [blockchain.info API](https://blockchain.info/api/blockchain_api):

```js
import { drivers } from 'exonum-client-anchoring'
import http from 'http' // your HTTP client library
const Driver = drivers.Driver

class BlockchainInfo extends Driver {
  constructor (params) {
    super()
    this.txLoadLimit = 50
  }

  getOpReturnFromTx (tx) {
    return tx.out[1].script // return OP_RETURN
  }

  getAddressTransactions ({ address, limit, page }) {
    return http.get({
      url: `https://blockchain.info/rawaddr/${address}`,
      params: Object.assign({}, this.params, {
        limit,
        offset: page * this.txLoadLimit,
        sort: 1
      })
    }).then(res => res.txs) // return array of transactions from response
  }
}
```

## Instance methods

#### `blockStatus(blockHeight)`

Returns a promise with the block status, message and proof (if exists), 
can return an error in case of unexpected troubles.

#### `txStatus(txHash)`

Returns a promise with the transaction status, message and proof (if exists),
can return an error in case of unexpected troubles.

#### `getStatus()`

Returns a current status of anchoring check.

#### `syncStop()`

Stops anchoring synchronization. Dispatches `stopped` event after stop.

#### `on(eventName, callback)`

Adds a new event listener by the event name.

#### `off(eventName, callback)`

Removes event listener by the event name and callback.
Returns a boolean status of an operation.

## Big Thanks

Cross-browser Testing Platform and Open Source <3 Provided by
[Sauce Labs][sauce-labs-homepage]

[sauce-labs-homepage]: https://saucelabs.com

## License

Exonum Anchoring Check library is licensed under the Apache License (Version 2.0).
See [LICENSE](LICENSE) for details.
