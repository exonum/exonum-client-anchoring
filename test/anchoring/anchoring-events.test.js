/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const {
  mock, expect, sinon, exonumAnchoring,
  network, config, token, blockTrailAPI, provider
} = require('../constants').module
const { getTxs, cfg1 } = require('../mocks/')
const _ = require('../../src/common/private').default

describe('Events', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg1)
  })

  it('loaded and synchronized events', d => {
    const anchoring = new exonumAnchoring.Anchoring(config)
    const loaded = sinon.spy()
    const synchronized = sinon.spy()
    const count = 2

    anchoring.on('loaded', loaded)
    anchoring.on('synchronized', synchronized)

    for (let i = 1; i <= count; i++) {
      mock.onGet(`${blockTrailAPI}/v1/${network}/address/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6/transactions`, {
        params: { api_key: token, limit: 200, page: i, sort_dir: 'asc' }
      }).replyOnce(200, getTxs(i === count ? 199 : 200, i))
    }

    anchoring.on('synchronized', e => {
      expect(loaded.callCount).to.equal(count)
      expect(synchronized.callCount).to.equal(1)
      expect(loaded.args).to.deep.equal([[198000], [396000]])
      expect(synchronized.args[0][0]).to.equal(396000)
      d()
    })
  })

  it('adding and removing', () => {
    const anchoring = new exonumAnchoring.Anchoring(config)
    const loaded = e => e

    anchoring.on('loaded', loaded)
    expect(_(anchoring).events.loaded.length).to.equal(1)

    expect(anchoring.off('loaded', e => e)).to.equal(false)
    expect(_(anchoring).events.loaded.length).to.equal(1)

    expect(anchoring.off('loaded', loaded)).to.equal(true)
    expect(_(anchoring).events.loaded.length).to.equal(0)

    expect(anchoring.off('loaded', loaded)).to.equal(false)
  })
})
