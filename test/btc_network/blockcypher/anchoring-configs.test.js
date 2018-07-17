/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const {
  mock, exonumAnchoring, expect, sinon,
  configBlockCypher, token, blockCypherAPI, provider
} = require('../../constants').module

const { cfg2, getCrypherTxs } = require('../../mocks/')

describe('Check correctness of work with config', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg2)
  })

  it('get anchor transactions from different addresses', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBlockCypher)
    const loaded = sinon.spy()
    const synchronized = sinon.spy()

    anchoring.on('loaded', loaded)
    anchoring.on('synchronized', synchronized)

    anchoring.on('synchronized', e => {
      expect(loaded.callCount).to.equal(3)
      expect(synchronized.callCount).to.equal(1)
      expect(loaded.args.map(item => item[0].anchorHeight)).to.deep.equal([23000, 48000, 73000])
      expect(synchronized.args[0][0].anchorHeight).to.equal(73000)
      d()
    })

    mock.onGet(`${blockCypherAPI}/v1/btc/main/addrs/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/full`, {
      params: { api_key: token, page: 1, pagesize: 50 }
    }).replyOnce(200, getCrypherTxs(25, 1))

    mock.onGet(`${blockCypherAPI}/v1/btc/main/addrs/2MswUr6HSff6QooGgup4nFVeVWfnrXi83sZ/full`, {
      params: { api_key: token, page: 1, pagesize: 50 }
    }).replyOnce(200, getCrypherTxs(25, 2))

    mock.onGet(`${blockCypherAPI}/v1/btc/main/addrs/2NCcdBCgUffRFB5ECWwpXNEDs2sKzcoK7yf/full`, {
      params: { api_key: token, page: 1, pagesize: 50 }
    }).replyOnce(200, getCrypherTxs(25, 3))
  })
})
