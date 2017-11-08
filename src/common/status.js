export const block = (key, proof) => {
  switch (key) {
    case 0:
      return {
        status: key,
        inChain: false,
        anchored: false,
        message: 'Block doesn\'t exist'
      }
    case 1:
      return {
        status: key,
        inChain: false,
        anchored: false,
        message: `Critical error in Exonum blockchain: block ${proof.block.block.height} is invalid`,
        proof
      }
    case 2:
      return {
        status: key,
        inChain: false,
        anchored: false,
        message: `Сhain of blocks is broken, block ${proof.block.block.height} is not in blockchain`,
        proof
      }
    case 3:
      return {
        status: key,
        inChain: false,
        anchored: false,
        message: `Сhain of blocks is broken, and hash of the anchor block is not equal to hash in anchor transaction`,
        proof
      }
    case 4:
      return {
        status: key,
        inChain: true,
        anchored: false,
        message: `The hash of the anchor block is not equal to the hash in the anchor transaction`,
        proof
      }
    case 10:
      return {
        status: key,
        inChain: true,
        anchored: false,
        message: `Block ${proof.block.block.height} valid in blockchain, but not anchored yet`,
        proof
      }
    case 11:
      return {
        status: key,
        inChain: true,
        anchored: true,
        message: `Block ${proof.block.block.height} valid in blockchain, and anchoring correct`,
        proof
      }
  }
}

export const transaction = (key, proof) => {
  switch (key) {
    case 0:
      return {
        status: key,
        inChain: false,
        anchored: false,
        message: 'Transaction refers on block, which doesn\'t exist',
        proof
      }
    case 1:
      return {
        status: key,
        inChain: false,
        anchored: false,
        message: 'Transaction refers on block, which is invalid',
        proof
      }
    case 2:
      return {
        status: key,
        inChain: false,
        anchored: false,
        message: 'Transaction refers on block, which is in broken chain of blocks',
        proof
      }
    case 3:
      return {
        status: key,
        inChain: false,
        anchored: false,
        message: 'Transaction refers on block, which is in broken chain of blocks and wrong anchored',
        proof
      }
    case 4:
      return {
        status: key,
        inChain: true,
        anchored: false,
        message: `Transaction refers on block, which is wrong anchored`,
        proof
      }
    case 5:
      return {
        status: key,
        inChain: false,
        anchored: false,
        message: `Merkle tree of transaction is wrong, transaction not in a block`,
        proof
      }
    case 9:
      return {
        status: key,
        inChain: false,
        anchored: false,
        message: `Transaction in mempool, and not commited`,
        proof
      }
    case 10:
      return {
        status: key,
        inChain: true,
        anchored: false,
        message: `Transaction refers on block, which is not anchored yet`,
        proof
      }
    case 11:
      return {
        status: key,
        inChain: true,
        anchored: true,
        message: `Transaction valid in blockchain, and anchoring correct`,
        proof
      }
  }
}
