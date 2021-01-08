export default {
  namespaced: true,
  state: {
    cc: 323
  },
  getters: {
    ccc (state) {
      return state.cc + 1000
    }
  },
  mutations: {
    changeC (state, val) {
      state.cc = state.cc + val
    }
  }
}
