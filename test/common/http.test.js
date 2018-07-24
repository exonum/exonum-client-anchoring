/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

// const { mock, provider } = require('../constants').module

const http = require('../../src/common/http').default
const exonum = require('../../src/').default

describe('Http module', function () {
  const url = '/someurl'
  const obj = { ok: 'ok' }

  it('5 tries, before error return', d => {
    for (let i = 0; i < 5; i++) {
      mock.onGet(provider + url).replyOnce(500 + i)
    }

    http.get({ url: provider + url })
      .catch(err => err.map(item => item.response.status))
      .should
      .eventually
      .deep.equal([500, 501, 502, 503, 504])
      .notify(d)
  })

  it('if one of tries will succeed - continue in normal mode', d => {
    for (let i = 0; i < 4; i++) {
      mock.onGet(provider + url).replyOnce(500)
    }
    mock.onGet(provider + url).replyOnce(200, obj)

    http.get({ url: provider + url })
      .should
      .eventually
      .deep.equal(obj)
      .notify(d)
  })

  it('super puper', () => {
    const config = {
      driver: new exonum.drivers.Smartbit({
        network: 'testnet'
      }),
      provider: {
        nodes: ['http://127.0.0.1:8022'] // list of IP addresses of Exonum nodes
      }
    }

    const anchoring = new exonum.Anchoring(config)
    anchoring.on('loaded', e => console.log('loaded', e.anchorHeight))
    anchoring.on('error', e => console.log('error', e))

    // anchoring.blockStatus(10900).then(data => console.log(data.message, data.proof.errors))
    anchoring.blockStatus(12)
      .then(data => console.log(data.message, data.proof.errors))
  })
})
