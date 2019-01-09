/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const { mock, expect, configSmartbit, provider } = require('../constants').module
const Provider = require('../../src/Provider').default

const { cfg } = require('../mocks/')

const proofs = require('../mocks/exonum/block-proofs.json')

describe('Check block header proof', function () {
  beforeEach(() => {
    mock.onGet(`${provider}/api/services/configuration/v1/configs/committed`)
      .replyOnce(200, cfg)
  })

  it('is not anchored', () => {
    const height = 0
    const proof = proofs[height]

    expect(new Provider(configSmartbit.provider).verifyBlockHeaderProof(height, proof)).to.equal(true)
  })

  it('is anchored', () => {
    const height = 10
    const proof = proofs[height]

    expect(new Provider(configSmartbit.provider).verifyBlockHeaderProof(height, proof)).to.equal(true)
  })
})
