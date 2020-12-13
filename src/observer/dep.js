let id = 0
class Dep {
  constructor () {
    this.id = id++
    this.subs = [] // 需要记住的watcher
  }

  depend () {
    Dep.target.addDep(this)
  }

  addSub (watcher) {
    this.subs.push(watcher)
    console.log(this.subs)
  }

  notify () {
    this.subs.forEach(watcher => {
      watcher.update()
    })
  }
}

Dep.target = null
const stack = []
export function pushTarget (watcher) {
  Dep.target = watcher
  stack.push(watcher)
}

export function popTarget () {
  stack.pop()
  Dep.target = stack[stack.length - 1]
}
export default Dep