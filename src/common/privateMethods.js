// Anchoring
export const loadAnchorChain = Symbol('loadAnchorChain')
export const syncAnchorTransaction = Symbol('syncAnchorTransaction')
export const getAllAnchorTransaction = Symbol('getAllAnchorTransaction')
export const getAnchorTx = Symbol('getAnchorTx')
export const getAnchorTxAsync = Symbol('getAnchorTxAsync')
export const getState = Symbol('getState')
export const safeState = Symbol('safeState')

// Driver
export const getAddressTransactions = Symbol('getAddressTransactions')

// Provider
export const request = Symbol('request')
export const parseConfigAddress = Symbol('parseConfigAddress')

//Events
export const dispatch = Symbol('dispatch')