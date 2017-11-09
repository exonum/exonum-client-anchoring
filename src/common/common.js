import {
  newType, Uint16, Uint32, Uint64, Hash,
  hash, stringToUint8Array, hexadecimalToUint8Array
} from 'exonum-client'

export const to = promise => promise.then(data => [data, null]).catch(err => [null, err])

export const isObject = (obj) =>
  (typeof obj === 'object' && !Array.isArray(obj) && obj !== null && !(obj instanceof Date))

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

export const blockHash = block => hash(Block.serialize(block))

export const getEnv = () => {
  if (Object.prototype.toString.call(typeof process !== 'undefined' ? process : 0) === '[object process]') {
    return 'node'
  } else if (typeof window === 'object') {
    return 'browser'
  }
  return 'unknown'
}

// @todo put it into exonum-client
export function merkleRootHash (node) {
  let hashLeft = ''
  let hashRight = ''
  let buffer

  if (node.val !== undefined) return node.val

  if (node.left !== undefined) {
    if (typeof node.left === 'string') {
      hashLeft = node.left
    } else if (isObject(node.left)) {
      if (node.left.val !== undefined) {
        hashLeft = node.left.val
      } else {
        hashLeft = merkleRootHash(node.left)
      }
    }
  }

  if (node.right !== undefined) {
    if (typeof node.right === 'string') {
      hashRight = node.right
    } else if (isObject(node.right)) {
      if (node.right.val !== undefined) {
        hashRight = node.right.val
      } else {
        hashRight = merkleRootHash(node.right)
      }
    }

    buffer = new Uint8Array(64)
    buffer.set(hexadecimalToUint8Array(hashLeft))
    buffer.set(hexadecimalToUint8Array(hashRight), 32)
  } else {
    buffer = hexadecimalToUint8Array(hashLeft)
  }

  return hash(buffer)
}
