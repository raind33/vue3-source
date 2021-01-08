export function persist () {
  return function (store) {
    console.log(3223)
    const data = localStorage.getItem('vuex:data')
    if (data) {
      store.replaceState(JSON.parse(data))
    }
    store.subscribe((mutation, state) => {
      debugger
      localStorage.setItem('vuex:data', JSON.stringify(state))
      console.log(mutation, state)
    })
  }
}