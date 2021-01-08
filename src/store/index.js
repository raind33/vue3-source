import Vue from 'vue'
import Vuex from '../../vuex'
import test from './modules/test'
import { persist } from './plugins/persist'
Vue.use(Vuex)

export default new Vuex.Store({
  plugins: [
    persist()
  ],
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
  actions: {
    changeA ({ commit }, val) {
      return new Promise((resolve) => {
        setTimeout(() => {
          commit('changeA', val)
          resolve()
        }, 1000)
      })
    }
  },
  modules: {
    test
  }
})
