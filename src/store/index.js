import Vue from 'vue'
import Vuex from '../../vuex'

Vue.use(Vuex)

export default new Vuex.Store({
  modules: {
    b: {
      state: {
        cc: 323
      },
      modules: {
        c: {
          state: {
            fd: 322
          },
          mutations: {
            changeB () {

            }
          }
        }
      }
    }
  },
  state: {
    a: 2323
  },
  getters: {
    c (state) {
      return state.a + 32
    }
  },
  mutations: {
    changeA(state, val) {
      state.a = val
    }
  },
  actions: {},
})
