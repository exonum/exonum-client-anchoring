/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const {
  mock, exonumAnchoring, expect, sinon,
  network, config, token, blockTrailAPI, provider
} = require('../constants').module

const { cfg2, getTxs } = require('../mocks/')

describe('Check correctness of work with config', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg2)
  })

  it('get anchor transactions from different addresses', d => {
    const anchoring = new exonumAnchoring.Anchoring(config)
    const loaded = sinon.spy()
    const synchronized = sinon.spy()

    anchoring.on('loaded', loaded)
    anchoring.on('synchronized', synchronized)

    anchoring.on('synchronized', e => {
      expect(loaded.callCount).to.equal(3)
      expect(synchronized.callCount).to.equal(1)
      expect(loaded.args.map(item => item[0].anchorHeight)).to.deep.equal([98000, 198000, 298000])
      expect(synchronized.args[0][0].anchorHeight).to.equal(298000)
      d()
    })

    mock.onGet(`${blockTrailAPI}/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`, {
      params: { api_key: token, limit: 200, page: 1, sort_dir: 'asc' }
    }).replyOnce(200, getTxs(100, 1))

    mock.onGet(`${blockTrailAPI}/v1/${network}/address/2MswUr6HSff6QooGgup4nFVeVWfnrXi83sZ/transactions`, {
      params: { api_key: token, limit: 200, page: 1, sort_dir: 'asc' }
    }).replyOnce(200, getTxs(100, 2))

    mock.onGet(`${blockTrailAPI}/v1/${network}/address/2NCcdBCgUffRFB5ECWwpXNEDs2sKzcoK7yf/transactions`, {
      params: { api_key: token, limit: 200, page: 1, sort_dir: 'asc' }
    }).replyOnce(200, getTxs(100, 3))
  })
})
