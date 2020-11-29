const oldArrayMethods = Array.prototype

export const newArrayProto = Object.create(oldArrayMethods)
let methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'splice',
  'reverse',
  'sort'
]

methods.forEach(method => {
  newArrayProto[method] = function (...args) {
    const result = oldArrayMethods[method].apply(this, args)
    let insert
    switch (method) {
      case 'push':
      case 'unshift':
        insert = args
        break
      case 'splice':
        insert = args.slice(2)
        break
      default:
        break;
    }

    if (insert) {
      this.__ob__.observedArray(insert)
    }
    return result
  }
})