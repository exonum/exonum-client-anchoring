/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */
const {
  mock, exonumAnchoring, expect, sinon,
  configBtcDotCom, token, blockTrailAPI
} = require('../../constants').module

const { cfg1, getTxs } = require('../../mocks/')
const provider = 'http://localhost:8001'
const configCopy = Object.assign({}, configBtcDotCom, { provider: { nodes: [provider] } })
const configTimeoutCopy = Object.assign({}, configCopy, { syncTimeout: 1 })
const configCacheCopy = Object.assign({}, configCopy, { cache: true })

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
    Promise.all([anchoring.txStatus(tx, true), anchoring.blockStatus(block, true)])
      .catch(e => e)
      .should
      .eventually
      .eventually.to.be.an('error')
      .notify(d)
  })
  it('instances with same config should load state', d => {
    const anchoring = new exonumAnchoring.Anchoring(configCacheCopy)

    mock.onGet(`${blockTrailAPI}/v3/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(50, 1))

    anchoring.on('stopped', stopped => {
      const anchoring2 = new exonumAnchoring.Anchoring(configCacheCopy)

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
      if (e.anchorHeight === 28000) {
        expect(synchronized.callCount).to.equal(2)
        expect(synchronized.args.map(item => item[0].anchorHeight)).to.deep.equal([28000, 28000])
        d()
      }
    })

    mock.onGet(`${blockTrailAPI}/v3/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(30, 1))

    mock.onGet(`${blockTrailAPI}/v3/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/tx`, {
      params: { api_key: token, pagesize: 50, page: 1 }
    }).replyOnce(200, getTxs(50, 1))

    mock.onGet(`${blockTrailAPI}/v3/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/tx`, {
      params: { api_key: token, pagesize: 50, page: 2 }
    }).replyOnce(200, getTxs(25, 2))
  })
})
