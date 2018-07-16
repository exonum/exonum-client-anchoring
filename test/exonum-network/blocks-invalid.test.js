/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const {
  mock, exonumAnchoring,
  configBtcDotCom, token, blockTrailAPI, provider
} = require('../constants').module
const { cfg1, getFullBlockInvalid, getFullBlock, getTxs, getBlocks } = require('../mocks/')

describe('Check anchor blocks invalid', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg1)
  })
  it('when height is not a number', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    anchoring.blockStatus('text', true)
      .should.be
      .rejectedWith(TypeError, 'Height text is invalid number')
      .notify(d)
  })

  it('when block is not existed', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const block = 999

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, null)

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(0)
      .notify(d)
  })

  it('when block is invalid', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const block = 999

    mock.onGet(`${blockTrailAPI}/v3/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(100, 1))

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, getFullBlockInvalid(block))

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(1)
      .notify(d)
  })

  it('when block in broken chain', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const block = 1688

    mock.onGet(`${blockTrailAPI}/v3/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(100, 1))

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, getFullBlock(block))

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 2001, count: 312 }
    }).replyOnce(200, [...getBlocks(1989, 299), ...getBlocks(2001, 12)])

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(2)
      .notify(d)
  })

  it('when hash of the anchor block is not equal to the hash in the anchor transaction', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const block = 1688

    mock.onGet(`${blockTrailAPI}/v3/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(100, 1))

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, getFullBlock(block))

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 2001, count: 312 }
    }).replyOnce(200, [...getBlocks(2000, 311), {
      height: '2000',
      prev_hash: 'f90a7dff8e6dd43edfb198a5008c87942e656a1862ed668b4f4d1fb11125b5d0',
      proposer_id: 0,
      schema_version: 0,
      state_hash: '19098b0bff42bfaf65c59abf62264c257a78c690d08732361508dd96f3080c9d',
      tx_count: 0,
      tx_hash: '0000000000000000000000000000000000000000000000000000000000000000'
    }])

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(3)
      .notify(d)
  })

  it('when anchor block hash not equal to block hash', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const block = 1000

    mock.onGet(`${blockTrailAPI}/v3/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(25, 1))

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, getFullBlock(1688))

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(3)
      .notify(d)
  })
})
