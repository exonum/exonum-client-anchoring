import { newType, Uint16, Uint32, Uint64, Hash, hash } from 'exonum-client'

export const to = promise => promise.then(data => [data, null]).catch(err => [null, err])

export const byteArrayToInt = byteArray => {
  let value = 0
  for (let i = byteArray.length - 1; i >= 0; i--) {
    value = (value * 256) + byteArray[i]
  }

  return value
}

const Block = newType({
  size: 112,
  fields: {
    schema_version: { type: Uint16, size: 2, from: 0, to: 2 },
    proposer_id: { type: Uint16, size: 2, from: 2, to: 4 },
    height: { type: Uint64, size: 8, from: 4, to: 12 },
    tx_count: { type: Uint32, size: 4, from: 12, to: 16 },
    prev_hash: { type: Hash, size: 32, from: 16, to: 48 },
    tx_hash: { type: Hash, size: 32, from: 48, to: 80 },
    state_hash: { type: Hash, size: 32, from: 80, to: 112 }
  }
})

export const blockHash = block => {
  return hash(Block.serialize(block))
}

export const getEnv = () => {
  if (Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]') {
    return 'node'
  } else if (typeof window === 'object') {
    return 'browser'
  }
  return 'unknown'
}