/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const exonumAnchoring = require('src')
const nock = require('nock')
const http = require('src/common/http').default

const { cfg1, getFullBlock, getTxs } = require('./mocks/')

chai.use(chaiAsPromised)
chai.should()

const token = 'token'
const network = 'BTC'
const provider = 'http://node.com'
const provWithPort = `${provider}:8000`
const blockTrailAPI = 'https://api.blocktrail.com'

describe('Check anchors and blocks in chain', function () {
  it('first', d => {
    const anchoring = new exonumAnchoring.Anchoring({
      driver: new exonumAnchoring.drivers.Blocktrail({ token, network }),
      provider: { nodes: [provider] }
    })
    const block = 1000

    nock(provWithPort)
      .get(`/api/services/configuration/v1/configs/committed`)
      .reply(200, cfg1)

    nock(blockTrailAPI)
      .get(`/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`)
      .query({ api_key: token, limit: 200, page: 1, sort_dir: 'asc' })
      .reply(200, getTxs(100, 1))

    nock(blockTrailAPI)
      .get(`/v1/${network}/address/2MswUr6HSff6QooGgup4nFVeVWfnrXi83sZ/transactions`)
      .query({ api_key: token, limit: 200, page: 1, sort_dir: 'asc' })
      .reply(200, getTxs(100, 2))

    nock(provWithPort)
      .get(`/api/services/configuration/v1/configs/committed`)
      .reply(200, cfg1)

    nock(provWithPort)
      .get(`/api/explorer/v1/blocks/${block}`)
      .reply(200, getFullBlock(block))

    anchoring.blockStatus(block)
      .then(data => data.status)
      .should
      .eventually
      .equal(11)
      .notify(d)
  })
})
