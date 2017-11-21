/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const { mock, provider } = require('../constants').module
const http = require('../../src/common/http').default

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
})
