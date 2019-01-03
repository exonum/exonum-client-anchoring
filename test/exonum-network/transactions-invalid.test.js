/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const { mock, exonumAnchoring, configSmartbit, provider } = require('../constants').module

const { cfg, getFullBlock, getFullBlockInvalid, getBlocks, getTxs, getExonumTx, getExonumTxInvalid } = require('../mocks/')

// @todo need more testcases
describe('Check anchor transactions invalid', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg)
  })

  it('when transaction hash is invalid', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const txs = [null, undefined, '06', '6b55ffe594c40c09cfcb6f0e797f22fd34c68992f6c0f6817c8bf5c36853c7a/']
    Promise.all(txs.map(tx => anchoring.txStatus(tx)))
      .catch(e => e)
      .should
      .eventually.to.be.an('error')
      .notify(d)
  })

  it('when transaction refers on block, which doesn\'t exist', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const hash = '068f75773d8d407f354a4515df158536f7f5a7ae6aaa4b07e221099df072ce95'
    const block = 1153277

    mock.onGet(`${provider}/api/explorer/v1/transactions`, { hash })
      .replyOnce(200, getExonumTx(hash))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, null)

    anchoring.txStatus(hash, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(0)
      .notify(d)
  })

  it('when transaction refers on block, which is invalid', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const hash = '37541696c5652bf7a7c3b6497ac98eddedc45f38fb3e7f359d2f15e5c0284855'
    const block = 4202

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .reply(200, getFullBlockInvalid(block))

    mock.onGet(`${provider}/api/explorer/v1/transactions`, { hash })
      .replyOnce(200, getExonumTx(hash))

    anchoring.txStatus(hash, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(1)
      .notify(d)
  })

  it('when transaction refers on block, which is in broken chain of blocks', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const hash = '5ea500615643316b79851e156de410ea3140900b9b37c0f39a1714cdd2420de7'
    const block = 4302

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 4400, count: 98 }
    }).replyOnce(200, { blocks: [...getBlocks(4352, 48).blocks, ...getBlocks(4400, 50).blocks] })

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(33, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(block))

    mock.onGet(`${provider}/api/explorer/v1/transactions`, { params: { hash } })
      .replyOnce(200, getExonumTx(hash))

    anchoring.txStatus(hash, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(2)
      .notify(d)
  })

  it('when transaction refers on block, which is wrong anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const hash = '5ea500615643316b79851e156de410ea3140900b9b37c0f39a1714cdd2420de7'
    const block = 4302

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 4400, count: 98 }
    }).replyOnce(200, {
      blocks: [{
        'proposer_id': 0,
        'height': 4400,
        'tx_count': 1,
        'prev_hash': '2456aaec73ce354402a84290d47a5410daef0f5ed2c55245d69baa8cec16a337',
        'tx_hash': 'ab56fe868ff1b7a8dc8ffbcf02a26ba94f5df8006da64da2b92aa0921a4f878f',
        'state_hash': 'b57ea6186801a62ffadbadf60b11bf5eac734626174421704c1273849d708e34'
      }, ...getBlocks(4400, 97).blocks]
    })

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(33, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(block))

    mock.onGet(`${provider}/api/explorer/v1/transactions`, { params: { hash } })
      .replyOnce(200, getExonumTx(hash))

    anchoring.txStatus(hash, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(3)
      .notify(d)
  })

  it('when merkle tree of transaction is wrong', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const hash = 'eb12c4c3365b532857bab2bac93571db27a20a37fbfecf92457d53d6ba47d185'
    const block = 4040

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 4200, count: 160 }
    }).replyOnce(200, getBlocks(4201, 1600))

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(33, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(block))

    mock.onGet(`${provider}/api/explorer/v1/transactions`, { params: { hash } })
      .replyOnce(200, getExonumTxInvalid(hash))

    anchoring.txStatus(hash, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(5)
      .notify(d)
  })
})
