/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
// const exonumAnchoring = require('src')
const nock = require('nock')
const http = require('src/common/http').default

const { btTx, cfg1, getBlocks } = require('./mocks/')

chai.use(chaiAsPromised)
chai.should()

const token = 'token'
const network = 'BTC'
const provider = 'http://node.com'
const provWithPort = `${provider}:8000`
const blockTrailAPI = 'https://api.blocktrail.com'

describe('Check anchors and blocks in chain', function () {
  http.get({ url: 'http://test.com/hi', params: { a: 1, b: '2' }, tries: 8 })
    .then((data) => console.log(data))
    .catch(e => console.log(e))

  nock('http://test.com')
    .get(`/hi`)
    .query({ a: 1, b: '2' })
    .reply(500)
  nock('http://test.com')
    .get(`/hi`)
    .query({ a: 1, b: '2' })
    .reply(500)
  nock('http://test.com')
    .get(`/hi`)
    .query({ a: 1, b: '2' })
    .reply(500)
  nock('http://test.com')
    .get(`/hi`)
    .query({ a: 1, b: '2' })
    .reply(500)
  nock('http://test.com')
    .get(`/hi`)
    .query({ a: 1, b: '2' })
    .reply(500)
  nock('http://test.com')
    .get(`/hi`)
    .query({ a: 1, b: '2' })
    .reply(500)
  nock('http://test.com')
    .get(`/hi`)
    .query({ a: 1, b: '2' })
    .reply(500)

  nock('http://test.com')
    .get(`/hi`)
    .query({ a: 1, b: '2' })
    .reply(200, { test: 'test' })

  // it('first', () => {
  //   const anchoring = new exonumAnchoring.Anchoring({
  //     driver: new exonumAnchoring.drivers.Blocktrail({ token, network }),
  //     provider: { nodes: [provider] }
  //   })
  //
  //   nock(provWithPort)
  //     .get(`/api/services/configuration/v1/configs/committed`)
  //     .reply(200, cfg1)
  //
  //   nock(blockTrailAPI)
  //     .get(`/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`)
  //     .query({ api_key: token, limit: 200, page: 1, sort_dir: 'asc' })
  //     .reply(200, btTx)
  // })
})
