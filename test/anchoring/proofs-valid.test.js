const {
  mock, exonumAnchoring, expect,
  config, provider
} = require('../constants').module

const { cfg1 } = require('../mocks/')

const proofs = require('../mocks/exonum/block-proofs.json')

describe('Check block header proof', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg1)
  })

  it('is not anchored', () => {
    const anchoring = new exonumAnchoring.Anchoring(config)
    const height = 3
    const proof = proofs[height].proof
    const keys = proofs[height].keys

    expect(anchoring.verifyBlockHeaderProof(height, proof, keys)).to.equal(true)
  })

  it('is anchored', () => {
    const anchoring = new exonumAnchoring.Anchoring(config)
    const height = 12
    const proof = proofs[height].proof
    const keys = proofs[height].keys

    expect(anchoring.verifyBlockHeaderProof(height, proof, keys)).to.equal(true)
  })
})