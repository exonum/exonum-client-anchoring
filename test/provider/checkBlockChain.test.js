/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const Provider = require('../../src/Provider').default
const { expect } = chai

const { getBlocks } = require('../mocks/')

chai.use(chaiAsPromised)
chai.should()

describe('checkBlockChain', function () {
  const provider = new Provider()

  it('check block sequence', () => {
    expect(provider.checkBlocksChain(getBlocks(100, 100))).to.deep
      .equal({
        nextCheck: 'f920a6601cf0641ee740c21c96cb249c5013819e5068a20a675739279ddcb231',
        chainValid: true,
        errors: []
      })
  })

  it('check block sequence with missed block', () => {
    const from0to99 = getBlocks(100, 100)
    const from101to200 = getBlocks(201, 100)
    expect(provider.checkBlocksChain([...from0to99, ...from101to200])).to.deep
      .equal({
        nextCheck: '21be00bd4b57207c7cf0739fe2951e72a0aa65092f0e519c58101b0a65539145',
        chainValid: false,
        errors: [
          { message: 'Chain broken on height 101', block: from101to200[0], prevBlock: from0to99[from0to99.length - 1] }
        ]
      })
  })

  it('check block sequence starting with correct prevHash', () => {
    expect(provider.checkBlocksChain(getBlocks(203, 2),
      '21be00bd4b57207c7cf0739fe2951e72a0aa65092f0e519c58101b0a65539145')).to.deep
      .equal({
        nextCheck: '6ad44e43f378e927d45dc7a8587116bc7b9966e2282b7a8d1398b27ecca19ec3',
        chainValid: true,
        errors: []
      })
  })

  it('check block sequence starting with incorrect prevHash', () => {
    const from201to203 = getBlocks(203, 2)
    expect(provider.checkBlocksChain(getBlocks(203, 2),
      'f920a6601cf0641ee740c21c96cb249c5013819e5068a20a675739279ddcb231')).to.deep
      .equal({
        nextCheck: '6ad44e43f378e927d45dc7a8587116bc7b9966e2282b7a8d1398b27ecca19ec3',
        chainValid: false,
        errors: [{ message: 'Chain broken on height 201', block: from201to203[0] }]
      })
  })
})
