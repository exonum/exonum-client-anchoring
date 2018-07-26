/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const { mock, expect, exonumAnchoring, configSmartbit, provider } = require('../../constants').module
const { cfg1 } = require('../../mocks/')
const _ = require('../../../src/common/private').default

describe('Events', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg1)
  })

  it('adding and removing', () => {
    const anchoring = new exonumAnchoring.Anchoring(configSmartbit)
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
