/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */
const {
  mock, exonumAnchoring, expect, sinon,
  network, config, token, blockTrailAPI
} = require('../constants').module

const { cfg1, getTxs } = require('../mocks/')
const provider = 'http://localhost:8001'
const configCopy = Object.assign({}, config, { provider: { nodes: [provider] } })
const configTimeoutCopy = Object.assign({}, configCopy, { syncTimeout: 1 })

describe('check loading intermediate data', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg1)
  })

  it('syncStop test', d => {
    const anchoring = new exonumAnchoring.Anchoring(configCopy)
    const block = 1000
    const tx = 'e518ed4254d2080a7ad9602e05b96cb456395878ba2fcd6cc609792c159b3ec0'

    anchoring.syncStop()
    Promise.all([anchoring.txStatus(tx), anchoring.blockStatus(block)])
      .catch(e => e)
      .should
      .eventually
      .eventually.to.be.an('error')
      .notify(d)
  })
  it('instances with same config should load state', d => {
    const anchoring = new exonumAnchoring.Anchoring(configCopy)

    mock.onGet(`${blockTrailAPI}/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`, {
      params: { api_key: token, limit: 200, page: 1, sort_dir: 'asc' }
    }).replyOnce(200, getTxs(200, 1))

    anchoring.on('stopped', stopped => {
      const anchoring2 = new exonumAnchoring.Anchoring(Object.assign({}, configCopy, { cache: true }))

      anchoring2.on('initialized', initialized => {
        expect(stopped.anchorHeight).to.equal(initialized.anchorHeight)
        expect(stopped.anchorTxs).to.deep.equal(initialized.anchorTxs)
        d()
      })
    })
    anchoring.on('loaded', e => anchoring.syncStop())
  })

  it('syncTimeout test', d => {
    const anchoring = new exonumAnchoring.Anchoring(configTimeoutCopy)
    const synchronized = sinon.spy()
    anchoring.on('synchronized', synchronized)
    anchoring.on('synchronized', e => {
      if (e.anchorHeight === 198000) {
        expect(synchronized.callCount).to.equal(2)
        expect(synchronized.args.map(item => item[0].anchorHeight)).to.deep.equal([168000, 198000])
        d()
      }
    })

    mock.onGet(`${blockTrailAPI}/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`, {
      params: { api_key: token, limit: 200, page: 1, sort_dir: 'asc' }
    }).replyOnce(200, getTxs(170, 1))

    mock.onGet(`${blockTrailAPI}/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`, {
      params: { api_key: token, limit: 200, page: 1, sort_dir: 'asc' }
    }).replyOnce(200, getTxs(200, 1))

    mock.onGet(`${blockTrailAPI}/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`, {
      params: { api_key: token, limit: 200, page: 2, sort_dir: 'asc' }
    }).replyOnce(200, getTxs(50, 2))
  })
})
