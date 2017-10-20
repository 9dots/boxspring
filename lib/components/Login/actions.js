import createAction from '@f/create-action'

const transaction = createAction('vdux-fireSummon: transaction')
const unsubscribe = createAction('vdux-fireSummon: unsubscribe')
const invalidate = createAction('vdux-fireSummon: invalidate')
const subscribe = createAction('vdux-fireSummon: subscribe')
const refMethod = createAction('vdux-fireSummon: refMethod')
const getLast = createAction('vdux-fireSummon: getLast')
const update = createAction('vdux-fireSummon: update')
const once = createAction('vdux-fireSummon: once')
const push = createAction('vdux-fireSummon: push')
const set = createAction('vdux-fireSummon: set')
const signUp = createAction('vdux-fireSummon: signUp')
const signIn = createAction('vdux-fireSummon: signIn')
const signOut = createAction('vdux-fireSummon: signOut')

export {
  unsubscribe,
  transaction,
  invalidate,
  subscribe,
  refMethod,
  getLast,
  update,
  push,
  once,
  signIn,
  set,
  signUp,
  signOut
}