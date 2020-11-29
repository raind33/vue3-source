class Observer {
  constructor (data) {
    this.walk(data)
  }
  walk (data) {
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
  
}
function defineReactive (data, key, val) {
  observe(val)
  Object.defineProperty(data, key, {
    get () {
      console.log('获取值')
      return val
    },
    set (newVal) {
      console.log('设置值')
      if (val === newVal) return
      observe(newVal)
      val = newVal
    }
  })
}
export function observe (data) {
  if (typeof data !== 'object' || typeof data === null) {
    return
  }
  return new Observer(data)
  console.log(data)
}