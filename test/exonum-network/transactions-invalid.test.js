/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const {
  mock, exonumAnchoring, blockTrailAPI,
  configBtcDotCom, token, provider
} = require('../constants').module

const { cfg1, getFullBlock, getFullBlockInvalid, getBlocks, getTxs, getExonumTx, getExonumTxInvalid } = require('../mocks/')

// @todo need more testcases
describe('Check anchor transactions invalid', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg1)
  })

  it('when transaction hash is invalid', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const txs = [null, undefined, '06', '6b55ffe594c40c09cfcb6f0e797f22fd34c68992f6c0f6817c8bf5c36853c7a/']
    Promise.all(txs.map(tx => anchoring.txStatus(tx)))
      .catch(e => e)
      .should
      .eventually.to.be.an('error')
      .notify(d)
  })

  it('when transaction refers on block, which doesn\'t exist', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const tx = '068f75773d8d407f354a4515df158536f7f5a7ae6aaa4b07e221099df072ce95'
    const block = 1153277

    mock.onGet(`${provider}/api/explorer/v1/transactions/${tx}`)
      .replyOnce(200, getExonumTx(tx))

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, null)

    anchoring.txStatus(tx, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(0)
      .notify(d)
  })

  it('when transaction refers on block, which is invalid', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const tx = '6b55ffe594c40c09cfcb6f0e797f22fd34c68992f6c0f6817c8bf5c36853c7ee'
    const block = 1153277

    mock.onGet(`${provider}/api/explorer/v1/transactions/${tx}`)
      .replyOnce(200, getExonumTx(tx))

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, getFullBlockInvalid(block))

    anchoring.txStatus(tx, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(1)
      .notify(d)
  })

  it('when transaction refers on block, which is in broken chain of blocks', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const tx = 'e518ed4254d2080a7ad9602e05b96cb456395878ba2fcd6cc609792c159b3ec0'
    const block = 1153277

    mock.onGet(`${blockTrailAPI}/v3/address/tb1q4mg65jafgx2qgq5ssle7m9v62m5t5tmgv2lqdw6ly5nv4tr8kufq4rj8qz/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(200, 1))

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, getFullBlock(block))

    mock.onGet(/api\/explorer\/v1\/blocks/, {
      params: { latest: 1154278, count: 1000 }
    }).replyOnce(200, [...getBlocks(1154177, 900), ...getBlocks(1154278, 100)])

    mock.onGet(`${provider}/api/explorer/v1/transactions/${tx}`)
      .replyOnce(200, getExonumTx(tx))

    mock.onGet(`${blockTrailAPI}/v3/address/tb1q4mg65jafgx2qgq5ssle7m9v62m5t5tmgv2lqdw6ly5nv4tr8kufq4rj8qz/tx`, {
      params: { api_key: token, pagesize: 50, page: 2 }
    }).replyOnce(200, getTxs(199, 2))

    anchoring.txStatus(tx, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(2)
      .notify(d)
  })

  it('when transaction refers on block, which is wrong anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const tx = 'b4db78bf1bd164e0417fab25055b1f0e3f7fdad44325a5bf1999d86ab44af2c1'
    const block = 1688

    mock.onGet(`${blockTrailAPI}/v3/address/tb1q4mg65jafgx2qgq5ssle7m9v62m5t5tmgv2lqdw6ly5nv4tr8kufq4rj8qz/tx`, {
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

    mock.onGet(`${provider}/api/explorer/v1/transactions/${tx}`)
      .replyOnce(200, getExonumTx(tx))

    anchoring.txStatus(tx, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(3)
      .notify(d)
  })

  it('when merkle tree of transaction is wrong', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBtcDotCom)
    const tx = '068f75773d8d407f354a4515df158536f7f5a7ae6aaa4b07e221099df072ce95'
    const block = 1153277

    mock.onGet(`${blockTrailAPI}/v3/address/tb1q4mg65jafgx2qgq5ssle7m9v62m5t5tmgv2lqdw6ly5nv4tr8kufq4rj8qz/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(200, 1))

    mock.onGet(`${provider}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, getFullBlock(block))

    mock.onGet(/api\/explorer\/v1\/blocks/, {
      params: { latest: 1154278, count: 1000 }
    }).replyOnce(200, getBlocks(1154278, 1000))

    mock.onGet(`${provider}/api/explorer/v1/transactions/${tx}`)
      .replyOnce(200, getExonumTxInvalid(tx))

    mock.onGet(`${blockTrailAPI}/v3/address/tb1q4mg65jafgx2qgq5ssle7m9v62m5t5tmgv2lqdw6ly5nv4tr8kufq4rj8qz/tx`, {
      params: { api_key: token, pagesize: 50, page: 2 }
    }).replyOnce(200, getTxs(199, 2))

    anchoring.txStatus(tx, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(5)
      .notify(d)
  })
})
