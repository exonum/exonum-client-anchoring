/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const { mock, exonumAnchoring, configSmartbit, provider } = require('../constants').module

const { cfg, getFullBlock, getBlocks, getTxs, getExonumTx } = require('../mocks/')

// @todo need more testcases
describe('Check anchor transactions valid', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg)
  })

  it('when transaction, in correct block and anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const hash = 'eeb5577f04139db649f27847c9a72be48c17bd72e671b2a4a2d971f0245b0893'
    const block = 4198

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 4200, count: 2 }
    }).replyOnce(200, getBlocks(4201, 2))

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
      .equal(11)
      .notify(d)
  })

  it('when transaction, in correct block, but not anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const hash = '37541696c5652bf7a7c3b6497ac98eddedc45f38fb3e7f359d2f15e5c0284855'
    const block = 4202

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 4302, count: 100 }
    }).replyOnce(200, getBlocks(4303, 100))

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(1, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(block))

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
    const hash = 'bddb875d8a6aaea91f0858c85d8d4de164baf50870c697b29a9c64b16a1b6ac4'

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
