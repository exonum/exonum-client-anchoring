/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const { mock, exonumAnchoring, configSmartbit, provider } = require('../constants').module

const { cfg, getFullBlock, getBlocks, getTxs } = require('../mocks/')

describe('Check anchor blocks valid', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg)
  })

  it('when anchor block height provided', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const block = 4200

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(30, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(block))

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(11)
      .notify(d)
  })

  it('when provided block height that in chain, and anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const block = 4100

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 4200, count: 100 }
    }).replyOnce(200, getBlocks(4201, 100))

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(33, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(block))

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(11)
      .notify(d)
  })

  it('when provided block that in chain, but not anchored', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const block = 4500

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 4600, count: 100 }
    }).replyOnce(200, getBlocks(4601, 100))

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(1, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(block))

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(10)
      .notify(d)
  })
})
