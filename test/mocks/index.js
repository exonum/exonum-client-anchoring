const btTx1 = require('./blocktrail/transactions-1.json')
const btTx2 = require('./blocktrail/transactions-2.json')
const btTx3 = require('./blocktrail/transactions-3.json')
const btTx4 = require('./blocktrail/transactions-4.json')
const btTx5 = require('./blocktrail/transactions-5.json')
export const btTx = require('./blocktrail/transactions.json')

export const cfg1 = require('./configs-1.json')
const blocks = require('./blocks.json')

export const getBlocks = (from, count) => {
  const to = from + count
  blocks.filter(item => Number(item.height) > from && Number(item.height) < to)
}

export const btTxPages = [btTx1, btTx2, btTx3, btTx4, btTx5]

