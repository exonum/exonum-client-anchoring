/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const { mock, exonumAnchoring, configSmartbit, configBtcDotCom, provider } = require('../constants').module

const { cfg1, getFullBlock, getBlocks, getTxs, getExonumTx } = require('../mocks/')

// @todo need more testcases
describe('Check anchor transactions valid', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg1)
  })

  it('when transaction, in correct block and anchored', d => {
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
    }).replyOnce(200, getBlocks(4401, 312))

    mock.onGet(`${provider}/api/explorer/v1/transactions`, { params: { hash } })
      .replyOnce(200, getExonumTx(hash))

    anchoring.txStatus(hash, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(11)
      .notify(d)
  })

  it('when transaction, in correct block, but not anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const hash = 'e327eb66b3a7df8b3822343bd4233af4148d063368e5003f73adb934d945e9ab'
    const block = 4302

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(1, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(block))

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 4402, count: 100 }
    }).replyOnce(200, getBlocks(4403, 100))

    mock.onGet(`${provider}/api/explorer/v1/transactions`, { params: { hash } })
      .replyOnce(200, getExonumTx(hash))

    anchoring.txStatus(hash, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(10)
      .notify(d)
  })

  it('when transaction not commited yet', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const hash = 'c59b07e4bf9c79f487957ee3353dca578495a3284e5145214905c9d6874d393f'

    mock.onGet(`${provider}/api/explorer/v1/transactions`, { params: { hash } })
      .replyOnce(200, getExonumTx(hash))

    anchoring.txStatus(hash, true)
      .then(d => d.status)
      .should
      .eventually
      .equal(9)
      .notify(d)
  })
})
