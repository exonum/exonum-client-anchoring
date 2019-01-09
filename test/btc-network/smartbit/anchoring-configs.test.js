/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const { mock, exonumAnchoring, expect, sinon, provider, configSmartbit } = require('../../constants').module

const { cfg, getTxs } = require('../../mocks/')

describe('Check correctness of work with config - Smartbit', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg)
  })

  it('get anchor transactions from different addresses', d => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
    const loaded = sinon.spy()
    const synchronized = sinon.spy()

    anchoring.on('loaded', loaded)
    anchoring.on('synchronized', synchronized)

    anchoring.on('synchronized', e => {
      expect(loaded.callCount).to.equal(2)
      expect(synchronized.callCount).to.equal(1)
      expect(loaded.args.map(item => item[0].anchorHeight)).to.deep.equal([9100, 13500])
      expect(synchronized.args[0][0].anchorHeight).to.equal(13500)
      d()
    })
    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: null, limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(50, '1'))

    mock.onGet(/address\/tb1qhcacy66m3sry7lwk29auqsu47ftet70ma7slzpldstyjq39fw2eq9xevnx\/op-returns/, {
      params: { next: 'NzI2MDYzMDY', limit: 50, sort: 'time', dir: 'asc' }
    }).replyOnce(200, getTxs(44, 'NzI2MDYzMDY'))
  })
})
