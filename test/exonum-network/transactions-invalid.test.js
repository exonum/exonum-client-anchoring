/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const { mock, exonumAnchoring, configSmartbit, provider } = require('../constants').module

const { cfg1, getFullBlock, getFullBlockInvalid, getBlocks, getTxs, getExonumTx, getExonumTxInvalid } = require('../mocks/')

// @todo need more testcases
describe('Check anchor transactions invalid', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg1)
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
    const hash = '6b55ffe594c40c09cfcb6f0e797f22fd34c68992f6c0f6817c8bf5c36853c7ee'
    const block = 1153277

    mock.onGet(`${provider}/api/explorer/v1/transactions`, { hash })
      .replyOnce(200, getExonumTx(hash))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlockInvalid(block))

    anchoring.txStatus(hash, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(1)
      .notify(d)
  })

  it('when transaction refers on block, which is in broken chain of blocks', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const hash = 'e327eb66b3a7df8b3822343bd4233af4148d063368e5003f73adb934d945e9ab'
    const block = 4302

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(33, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(block))

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 4400, count: 98 }
    }).replyOnce(200, { blocks: [...getBlocks(4352, 48).blocks, ...getBlocks(4400, 50).blocks] })

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
    const hash = 'e327eb66b3a7df8b3822343bd4233af4148d063368e5003f73adb934d945e9ab'
    const block = 4302

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(33, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(block))

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 4400, count: 98 }
    }).replyOnce(200, {
      blocks: [{
        'height': '4400',
        'prev_hash': '75656cf255cf11749a82693461ce07fb3961e3506553c2c0c13caaf78df91590',
        'proposer_id': 0,
        'state_hash': '14351944cbe24d770c373199853fa55a41046eda40425573f4aad3ac83af723a',
        'tx_count': 0,
        'tx_hash': '0000000000000000000000000000000000000000000000000000000000000000'
      }, ...getBlocks(4400, 97).blocks]
    })

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
    const hash = '10c2ff13b013bbe0543471637385252bb5a40442e0013cf506f505f7a93b28c9'
    const block = 4902

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(33, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(block))

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 5000, count: 98 }
    }).replyOnce(200, getBlocks(5001, 98))

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
