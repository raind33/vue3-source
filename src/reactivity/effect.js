export function effect (fn, options = {}) {
  const effect = createReactiveEffect(fn, options)
  
  if (!options.lazy) {
    effect()
  }

  return effect
}

// 创建响应式effect
let uid = 0
let activeEffect = null
let effectStack = []
function createReactiveEffect (fn, options) {
  const effect = function reactiveEffect () {
    // 主要防止不停的更改属性导致死循环
    try {
      effectStack.push(effect)
      activeEffect = effect
      return fn()
    } finally {
      effectStack.pop()
      activeEffect = effectStack[effectStack.length - 1]
    }
    if (!effectStack.includes(effect)) {
    }
  }
  effect.options = options
  effect.id = uid++
  effect.deps = [] // 依赖了哪些属性
  return effect
}

// {
//   {a:1, b:2}: {
//     a: [effect, effect],
//     b: [effect]
//   }
// }
const targetMap = new WeakMap()
export function track (target, type, key) {
  // 不在effect函数中，不做依赖收集,说明取值的属性，不依赖effect
  if(activeEffect === undefined) {
    return
  }
  let depsMap = targetMap.get(target)
  if (!depsMap) {
    targetMap.set(target, (depsMap = new Map()))
  }
  let dep = depsMap.get(key)
  if (!dep) {
    depsMap.set(key, (dep = new Set()))
  }
  if(!dep.has(activeEffect)) {
    dep.add(activeEffect)   // 双向记录，与vue2基本类似
    activeEffect.deps.push(dep) // effect记录属性
  }
}
export function trigger (target, type, key, value, oldValue) {
  const depsMap = targetMap.get(target)
  if (!depsMap) {
    return
  }
  // 计算属性要优于effect执行
  const effects = new Set()
  const computedRunners = new Set()
  const add = (effectsToAdd) => {
    if (effectsToAdd) {
      effectsToAdd.forEach(effect => {
        if (effect.options.computed) {
          computedRunners.add(effect)
        } else {
          effects.add(effect)
        }
      })
    }
  }
  // const run = (effects) => {
  //   if (effects) effects.forEach(effect => effect())
  // }
  if (key !== null) {
    add(depsMap.get(key))
  }
  if(type === 'add') { // 对数组新增属性，会触发length对应的依赖收集
    add(depsMap.get(Array.isArray(target) ? 'length' : ''))
  }
  const run = (effect) => {
    if (effect.options.schedular) {
      effect.options.schedular()
    } else {
      effect()
    }
  }
  computedRunners.forEach(run)
  effects.forEach(run)
}