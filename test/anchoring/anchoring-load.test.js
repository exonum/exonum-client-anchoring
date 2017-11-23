/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */
const {
  mock, exonumAnchoring, expect,
  network, config, token, blockTrailAPI
} = require('../constants').module

const { cfg1, getTxs } = require('../mocks/')
const provider = 'http://localhost:8001'
const configCopy = Object.assign({}, config, { provider: { nodes: [provider] } })

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
      .should
      .eventually
      .to.deep.equal([false, false])
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
})
