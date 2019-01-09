/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const { mock, exonumAnchoring, configSmartbit, provider } = require('../constants').module
const { cfg, getFullBlockInvalid, getFullBlock, getTxs, getBlocks } = require('../mocks/')

describe('Check anchor blocks invalid', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg)
  })

  it('when height is not a number', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    anchoring.blockStatus('text', true)
      .should.be
      .rejectedWith(TypeError, 'Height text is invalid number')
      .notify(d)
  })

  it('when block is not existed', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const block = 999

    mock.onGet(`${provider}/api/explorer/v1/block`)
      .replyOnce(200, null)

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(0)
      .notify(d)
  })

  it('when block is invalid', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const block = 999

    mock
      .onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
        params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
      }).replyOnce(200, getTxs(30, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlockInvalid(block))

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(1)
      .notify(d)
  })

  it('when block in broken chain', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const block = 4100
    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(44, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(block))

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 4200, count: 100 }
    }).replyOnce(200, { blocks: [...getBlocks(4188, 88).blocks, ...getBlocks(4200, 12).blocks] })

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(2)
      .notify(d)
  })

  it('when hash of the anchor block is not equal to the hash in the anchor transaction', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const block = 4100

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(50, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(block))

    mock.onGet(`${provider}/api/explorer/v1/blocks`, {
      params: { latest: 4200, count: 100 }
    }).replyOnce(200, {
      blocks: [...getBlocks(4200, 99).blocks, {
        height: '2000',
        prev_hash: 'd94953cf40a01345ff7db2df089b984b426ecde744c9e01200a5c357ac4efb67',
        proposer_id: 0,
        state_hash: 'eb990c1cd018bed3896e9eb71b6439b2358968d26a3b350f8af5816be4ef0632',
        tx_count: 0,
        tx_hash: '0000000000000000000000000000000000000000000000000000000000000000'
      }]
    })

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(3)
      .notify(d)
  })

  it('when anchor block hash not equal to block hash', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const block = 4200

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(30, 1))

    mock.onGet(`${provider}/api/explorer/v1/block`, { params: { height: block } })
      .replyOnce(200, getFullBlock(4100))

    anchoring.blockStatus(block, true)
      .then(data => data.status)
      .should
      .eventually
      .equal(3)
      .notify(d)
  })
})
