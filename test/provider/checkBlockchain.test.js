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
        nextCheck: '12c5a6ae852210d5551876014425ccfa542d4cff9504b2111f45e1263f8fb120',
        chainValid: true,
        errors: []
      })
  })

  it('check block sequence with missed block', () => {
    const from0to99 = getBlocks(100, 100).blocks
    const from101to200 = getBlocks(201, 100).blocks
    expect(provider.checkBlocksChain([...from0to99, ...from101to200])).to.deep
      .equal({
        nextCheck: 'c4107c97e97143aa919d4a15e43842385fd2662208a37239a25c1b7fba56549b',
        chainValid: false,
        errors: [
          { message: 'Chain broken on height 101', block: from101to200[0], prevBlock: from0to99[from0to99.length - 1] }
        ]
      })
  })

  it('check block sequence starting with correct prevHash', () => {
    expect(provider.checkBlocksChain(getBlocks(203, 2).blocks,
      'c4107c97e97143aa919d4a15e43842385fd2662208a37239a25c1b7fba56549b')).to.deep
      .equal({
        nextCheck: 'a3d21c104d1f7b626402d68f21e34567e4c4481843670ba1b9cadf23d0af0888',
        chainValid: true,
        errors: []
      })
  })

  it('check block sequence starting with incorrect prevHash', () => {
    const from201to203 = getBlocks(203, 2).blocks
    expect(provider.checkBlocksChain(getBlocks(203, 2).blocks,
      'f920a6601cf0641ee740c21c96cb249c5013819e5068a20a675739279ddcb231')).to.deep
      .equal({
        nextCheck: 'a3d21c104d1f7b626402d68f21e34567e4c4481843670ba1b9cadf23d0af0888',
        chainValid: false,
        errors: [{ message: 'Chain broken on height 201', block: from201to203[0] }]
      })
  })
})
