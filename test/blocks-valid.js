/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const fs = require('fs')
const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const exonumAnchoring = require('src')
const nock = require('nock')

const { cfg1, getFullBlock, getBlocks, getTxs } = require('./mocks/')

chai.use(chaiAsPromised)
chai.should()

const token = 'token'
const network = 'BTC'
const provider = 'http://node.com'
const provWithPort = `${provider}:8000`
const blockTrailAPI = 'https://api.blocktrail.com'
const path = './.cache/37bc686b77a3468237affe5775ea58330ddfbd16d65f8ac92bd37157445e3d73'

const cleanFile = () => fs.existsSync(path) && fs.unlinkSync(path)

describe('Check anchor block', function () {
  beforeEach(() => {
    cleanFile()

    for (let i = 0; i < 2; i++) {
      nock(provWithPort)
        .get(`/api/services/configuration/v1/configs/committed`)
        .reply(200, cfg1)
    }
  })

  it('when anchor block height provided', d => {
    const anchoring = new exonumAnchoring.Anchoring({
      driver: new exonumAnchoring.drivers.Blocktrail({ token, network }),
      provider: { nodes: [provider] }
    })
    const block = 1000

    nock(blockTrailAPI)
      .get(`/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`)
      .query({ api_key: token, limit: 200, page: 1, sort_dir: 'asc' })
      .reply(200, getTxs(100, 1))

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

  it('when provided block height that in chain, and anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring({
      driver: new exonumAnchoring.drivers.Blocktrail({ token, network }),
      provider: { nodes: [provider] }
    })
    const block = 9001

    nock(blockTrailAPI)
      .get(`/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`)
      .query({ api_key: token, limit: 200, page: 1, sort_dir: 'asc' })
      .reply(200, getTxs(100, 1))

    nock(provWithPort)
      .get(`/api/explorer/v1/blocks/${block}`)
      .reply(200, getFullBlock(block))

    nock(provWithPort)
      .get(/api\/explorer\/v1\/blocks/)
      .query({ latest: 10001, count: 999 })
      .reply(200, getBlocks(10001, 999))

    anchoring.blockStatus(block)
      .then(data => data.status)
      .should
      .eventually
      .equal(11)
      .notify(d)
  })

  it('when provided block that in chain, but not anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring({
      driver: new exonumAnchoring.drivers.Blocktrail({ token, network }),
      provider: { nodes: [provider] }
    })
    const block = 29876

    nock(blockTrailAPI)
      .get(`/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`)
      .query({ api_key: token, limit: 200, page: 1, sort_dir: 'asc' })
      .reply(200, getTxs(30, 1))

    nock(provWithPort)
      .get(`/api/explorer/v1/blocks/${block}`)
      .reply(200, getFullBlock(block))

    nock(provWithPort)
      .get(/api\/explorer\/v1\/blocks/)
      .query({ latest: 30877, count: 1000 })
      .reply(200, getBlocks(30877, 1000))

    anchoring.blockStatus(block)
      .then(data => data.status)
      .should
      .eventually
      .equal(10)
      .notify(d)
  })

  cleanFile()
})
