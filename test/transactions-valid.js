/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const exonumAnchoring = require('src')
const nock = require('nock')

const { cfg1, getFullBlock, getBlocks, getTxs, getExonumTx } = require('./mocks/')

chai.use(chaiAsPromised)
chai.should()

const token = 'token'
const network = 'BTC'
const provider = 'http://node.com'
const provWithPort = `${provider}:8000`
const blockTrailAPI = 'https://api.blocktrail.com'
const config = {
  cache: false,
  driver: new exonumAnchoring.drivers.Blocktrail({ token, network }),
  provider: { nodes: [provider] }
}

describe('Check anchor transactions valid', function () {
  beforeEach(() => {
    for (let i = 0; i < 2; i++) {
      nock(provWithPort)
        .get(`/api/services/configuration/v1/configs/committed`)
        .reply(200, cfg1)
    }
  })

  it('when transaction, in correct block and anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring(config)
    const tx = 'b4db78bf1bd164e0417fab25055b1f0e3f7fdad44325a5bf1999d86ab44af2c1'
    const block = 1688

    nock(blockTrailAPI)
      .get(`/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`)
      .query({ api_key: token, limit: 200, page: 1, sort_dir: 'asc' })
      .reply(200, getTxs(20, 1))

    nock(provWithPort)
      .get(`/api/explorer/v1/blocks/${block}`)
      .reply(200, getFullBlock(block))

    nock(provWithPort)
      .get(/api\/explorer\/v1\/blocks/)
      .query({ latest: 2001, count: 312 })
      .reply(200, getBlocks(2001, 312))

    nock(provWithPort)
      .get(`/api/system/v1/transactions/${tx}`)
      .reply(200, getExonumTx(tx))

    anchoring.txStatus(tx)
      .then(d => d.status)
      .should
      .eventually
      .equal(11)
      .notify(d)
  })

  it('when transaction, in correct block, but not anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring(config)
    const tx = '7cb4a12a3fbbbf610b15c899eb3a5046091d510c0310c6dcd3f505af9946deed'
    const block = 49002

    nock(blockTrailAPI)
      .get(`/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`)
      .query({ api_key: token, limit: 200, page: 1, sort_dir: 'asc' })
      .reply(200, getTxs(5, 1))

    nock(provWithPort)
      .get(`/api/explorer/v1/blocks/${block}`)
      .reply(200, getFullBlock(block))

    nock(provWithPort)
      .get(/api\/explorer\/v1\/blocks/)
      .query({ latest: 50003, count: 1000 })
      .reply(200, getBlocks(50003, 1000))

    nock(provWithPort)
      .get(`/api/system/v1/transactions/${tx}`)
      .reply(200, getExonumTx(tx))

    anchoring.txStatus(tx)
      .then(d => d.status)
      .should
      .eventually
      .equal(10)
      .notify(d)
  })

  it('when transaction not commited yet', d => {
    const anchoring = new exonumAnchoring.Anchoring(config)
    const tx = 'c59b07e4bf9c79f487957ee3353dca578495a3284e5145214905c9d6874d393f'

    nock(provWithPort)
      .get(`/api/system/v1/transactions/${tx}`)
      .reply(200, getExonumTx(tx))

    anchoring.txStatus(tx)
      .then(d => d.status)
      .should
      .eventually
      .equal(9)
      .notify(d)
  })
})
