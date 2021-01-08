export default {
  namespaced: true,
  state: {
    cc: 323
  },
  mutations: {
    changeC (state, val) {
      state.cc = state.cc + val
    }
  }
}
