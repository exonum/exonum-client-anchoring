/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const { expect } = require('../constants').module
const Provider = require('../../src/Provider').default
const { getBlocks } = require('../mocks/')

describe('checkBlockChain', function () {
  const provider = new Provider()

  it('check block sequence', () => {
    expect(provider.checkBlocksChain(getBlocks(100, 100).blocks)).to.deep
      .equal({
        nextCheck: '13a7ea61b8d73135fd87674da6836f1b1ead37db1fb59ce6e84e2b7e2ef196c0',
        chainValid: true,
        errors: []
      })
  })

  it('check block sequence with missed block', () => {
    const from0to99 = getBlocks(100, 100).blocks
    const from101to200 = getBlocks(201, 100).blocks
    expect(provider.checkBlocksChain([...from0to99, ...from101to200])).to.deep
      .equal({
        nextCheck: 'e650d76b51d631764559c7967d468d6df504d242e9e74c5c12e2ea323e7fd413',
        chainValid: false,
        errors: [
          { message: 'Chain broken on height 101', block: from101to200[0], prevBlock: from0to99[from0to99.length - 1] }
        ]
      })
  })

  it('check block sequence starting with correct prevHash', () => {
    expect(provider.checkBlocksChain(getBlocks(203, 2).blocks,
      'e650d76b51d631764559c7967d468d6df504d242e9e74c5c12e2ea323e7fd413')).to.deep
      .equal({
        nextCheck: '6c601db8f1d940724f343a9fb5d410dcd0766e511ab226a8406a8d575ece6595',
        chainValid: true,
        errors: []
      })
  })

  it('check block sequence starting with incorrect prevHash', () => {
    const from201to203 = getBlocks(203, 2).blocks
    expect(provider.checkBlocksChain(getBlocks(203, 2).blocks,
      'f920a6601cf0641ee740c21c96cb249c5013819e5068a20a675739279ddcb231')).to.deep
      .equal({
        nextCheck: '6c601db8f1d940724f343a9fb5d410dcd0766e511ab226a8406a8d575ece6595',
        chainValid: false,
        errors: [{ message: 'Chain broken on height 201', block: from201to203[0] }]
      })
  })
})
