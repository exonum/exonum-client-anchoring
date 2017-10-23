/* eslint-env node, mocha */
/* eslint-disable no-unused-expressions */

const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const exonumAnchoring = require('src')

chai.use(chaiAsPromised)
chai.should()

describe('Anchoring', function () {
  const anchoring = new exonumAnchoring.Anchoring({
    url: 'http://192.168.221.129:8000/'
  })
  console.log(anchoring)
})
