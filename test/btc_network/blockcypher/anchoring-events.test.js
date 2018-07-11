/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const {
  mock, expect, sinon, exonumAnchoring,
  configBlockCypher, token, blockCypherAPI, provider
} = require('../../constants').module
const { getCrypherTxs, cfg1 } = require('../../mocks/')
const _ = require('../../../src/common/private').default

describe('Events', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg1)
  })

  it('loaded and synchronized events', d => {
    const anchoring = new exonumAnchoring.Anchoring(configBlockCypher)
    const loaded = sinon.spy()
    const synchronized = sinon.spy()
    const count = 2

    anchoring.on('loaded', loaded)
    anchoring.on('synchronized', synchronized)

    for (let i = 1; i <= count; i++) {
      mock.onGet(`${blockCypherAPI}/v1/btc/main/addrs/2NCtE6CcPiZD2fWHfk24G5UH5YNyoixxEu6`, {
        params: { api_key: token, pagesize: 50, page: i }
      }).replyOnce(200, getCrypherTxs(i === count ? 49 : 50, i))
    }

    anchoring.on('synchronized', e => {
      expect(loaded.callCount).to.equal(count)
      expect(synchronized.callCount).to.equal(1)
      expect(loaded.args.map(item => item[0].anchorHeight)).to.deep.equal([48000, 96000])
      expect(synchronized.args[0][0].anchorHeight).to.equal(96000)
      d()
    })
  })

  it('adding and removing', () => {
    const anchoring = new exonumAnchoring.Anchoring(configBlockCypher)
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
