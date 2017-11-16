/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const { mock, exonumAnchoring } = require('./constants').module
const { cfg1, getFullBlockInvalid, getTxs } = require('./mocks/')

const token = 'token'
const network = 'BTC'
const provider = 'http://node.com'
const provWithPort = `${provider}:8000`
const blockTrailAPI = 'https://api.blocktrail.com'
const config = {
  cache: false,
  driver: new exonumAnchoring.drivers.Blocktrail({ token, network }),
  provider: { nodes: [provider] }
}
// @todo need more testcases
describe('Check anchor blocks invalid', function () {
  beforeEach(() => {
    mock.onGet(`${provWithPort}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg1)
  })
  it('when height is not a number', d => {
    const anchoring = new exonumAnchoring.Anchoring(config)
    anchoring.blockStatus('text')
      .should.be
      .rejectedWith(TypeError, 'Height text is invalid number')
      .notify(d)
  })

  it('when wrong data in block data', d => {
    const anchoring = new exonumAnchoring.Anchoring(config)
    const block = 999

    mock.onGet(`${blockTrailAPI}/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`, {
      params: { api_key: token, limit: 200, page: 1, sort_dir: 'asc' }
    }).replyOnce(200, getTxs(100, 1))

    mock.onGet(`${provWithPort}/api/explorer/v1/blocks/${block}`)
      .replyOnce(200, getFullBlockInvalid(block))

    anchoring.blockStatus(block)
      .then(data => data.status)
      .should
      .eventually
      .equal(1)
      .notify(d)
  })
})
