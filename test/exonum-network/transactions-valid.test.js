/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const {
  mock, exonumAnchoring, blockTrailAPI,
  configBtcDotCom, token, provider
} = require('../constants').module

const { cfg1, getFullBlock, getBlocks, getTxs, getExonumTx } = require('../mocks/')

// @todo need more testcases
describe('Check anchor transactions valid', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg1)
  })

  it('when transaction, in correct block and anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const tx = 'b4db78bf1bd164e0417fab25055b1f0e3f7fdad44325a5bf1999d86ab44af2c1'
    const block = 1688

    mock.onGet(`${blockTrailAPI}/v3/address/tb1q4mg65jafgx2qgq5ssle7m9v62m5t5tmgv2lqdw6ly5nv4tr8kufq4rj8qz/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(20, 1))

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, getFullBlock(block))

    mock.onGet(/api\/explorer\/v1\/blocks/, {
      params: { latest: 2001, count: 312 }
    }).replyOnce(200, getBlocks(2001, 312))

    mock.onGet(`${provider}/api/explorer/v1/transactions/${tx}`)
      .replyOnce(200, getExonumTx(tx))

    anchoring.txStatus(tx, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(11)
      .notify(d)
  })

  it('when transaction, in correct block, but not anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const tx = 'e68a605aa5ce04b7e8c73b4ea46b5f4e2393d82bd50495d3f808315be4619c89'
    const block = 4002

    mock.onGet(`${blockTrailAPI}/v3/address/tb1q4mg65jafgx2qgq5ssle7m9v62m5t5tmgv2lqdw6ly5nv4tr8kufq4rj8qz/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(5, 1))

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, getFullBlock(block))

    mock.onGet(/api\/explorer\/v1\/blocks/, {
      params: { latest: 5003, count: 1000 }
    }).replyOnce(200, getBlocks(5003, 1000))

    mock.onGet(`${provider}/api/explorer/v1/transactions/${tx}`)
      .replyOnce(200, getExonumTx(tx))

    anchoring.txStatus(tx, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(10)
      .notify(d)
  })

  it('when transaction not commited yet', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const tx = 'c59b07e4bf9c79f487957ee3353dca578495a3284e5145214905c9d6874d393f'

    mock.onGet(`${provider}/api/explorer/v1/transactions/${tx}`)
      .replyOnce(200, getExonumTx(tx))

    anchoring.txStatus(tx, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(9)
      .notify(d)
  })
})
