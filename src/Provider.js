import axios from 'axios'
import bitcoin from 'bitcoinjs-lib'
import { _, to } from './common/'

const request = Symbol('request')
const parseConfigAddress = Symbol('parseConfigAddress')

export default class Provider {
  constructor (params) {
    const { nodes, version, port, network } = Object.assign({}, {
      nodes: ['http://localhost'],
      version: 'v1',
      port: 8000
    }, params)

    _(this).path = {
      anchoring: `${nodes[0]}:${port}/api/services/btc_anchoring/${version}`,
      explorer: `${nodes[0]}:${port}/api/services/btc_anchoring/${version}`,
      configuration: `${nodes[0]}:${port}/api/services/configuration/${version}`
    }
    _(this).nodes = nodes
    _(this).network = network
  }

  async [request] ({ url }) {
    console.log(url)
    const [res] = await to(axios.get(url).then(({ data }) => data))
    // @todo add error handling and trying count
    return res
  }

  getActualAddress () {
    return this[request]({ url: `${_(this).path.anchoring}/address/actual` })
  }

  async getConfigsCommited () {
    const configsCommited = await this[request]({ url: `${_(this).path.configuration}/configs/committed` })
    return configsCommited.map(item => {
      this.address = this[parseConfigAddress](item)
      return item
    })
  }

  [parseConfigAddress] ({ config }) {
    if (!config.services.btc_anchoring) return null
    const pubKeys = config.services.btc_anchoring.anchoring_keys.map(function (hex) { return Buffer.from(hex, 'hex') })
    const redeemScript = bitcoin.script.multisig.output.encode(1, pubKeys)
    const scriptPubKey = bitcoin.script.scriptHash.output.encode(bitcoin.crypto.hash160(redeemScript))
    return bitcoin.address.fromOutputScript(scriptPubKey, bitcoin.networks[_(this).network])
  }
}
