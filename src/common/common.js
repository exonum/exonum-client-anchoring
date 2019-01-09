import { protocol, hash, hexadecimalToUint8Array } from 'exonum-client'

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

export const blockHash = block => {
  const blockPrepared = {
    prev_hash: {
      data: hexadecimalToUint8Array(block.prev_hash)
    },
    tx_hash: {
      data: hexadecimalToUint8Array(block.tx_hash)
    },
    state_hash: {
      data: hexadecimalToUint8Array(block.state_hash)
    }
  }

  if (block.proposer_id !== 0) {
    blockPrepared.proposer_id = block.proposer_id
  }

  if (block.height !== 0) {
    blockPrepared.height = block.height
  }

  if (block.tx_count !== 0) {
    blockPrepared.tx_count = block.tx_count
  }

  const message = protocol.exonum.Block.create(blockPrepared)
  const buffer = new Uint8Array(protocol.exonum.Block.encode(message).finish())

  return hash(buffer)
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
