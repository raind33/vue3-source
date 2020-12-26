import Vuex from 'vuex'
import Vue from 'vue'
import { reject } from 'async'
Vue.use(Vuex)

export default () => {
  const store = new Vuex.Store({
    state: {
      name: 'aa'
    },
    mutations: {
      changeName (state, val) {
        state.name = val
      }
    },
    actions: {
      changeName ({ commit }, val) {
        return new Promise((resolve, reject) => {
          setTimeout(() => {
            commit('changeName', 'bbbb')
            resolve()
          }, 2000)
        })
      }
    }
  })
  // 前端运行时会执行此方法，同步服务端的store
  if (typeof window !== 'undefined' && window.__INITIAL_STATE__) {
    store.replaceState(window.__INITIAL_STATE__)
  }
  return store
}