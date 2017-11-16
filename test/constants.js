const chai = require('chai')
const chaiAsPromised = require('chai-as-promised')
const exonumAnchoring = require('../src')
const sinon = require('sinon')

const axios = require('axios')
const MockAdapter = require('axios-mock-adapter')
const mock = new MockAdapter(axios)
const { expect } = chai

chai.use(chaiAsPromised)
chai.should()

exports.module = { mock, expect, sinon, exonumAnchoring }
