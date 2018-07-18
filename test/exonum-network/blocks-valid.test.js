/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const {
  mock, exonumAnchoring,
  configBtcDotCom, token, btcdotcomAPI, provider
} = require('../constants').module

const { cfg1, getFullBlock, getBlocks, getTxs } = require('../mocks/')

describe('Check anchor blocks valid', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg1)
  })

  it('when anchor block height provided', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const block = 1000

    mock.onGet(`${btcdotcomAPI}/v3/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(25, 1))

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, getFullBlock(block))

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(11)
      .notify(d)
  })
  it('when provided block height that in chain, and anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const block = 1001

    mock.onGet(`${btcdotcomAPI}/v3/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(255, 1))

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, getFullBlock(block))

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 2001, count: 999 }
    }).replyOnce(200, getBlocks(2001, 999))

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(11)
      .notify(d)
  })
  it('when provided block that in chain, but not anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const block = 3876

    mock.onGet(`${btcdotcomAPI}/v3/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(4, 1))

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, getFullBlock(block))

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 4877, count: 1000 }
    }).replyOnce(200, getBlocks(4877, 1000))

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(10)
      .notify(d)
  })
})
