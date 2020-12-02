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

export function pushTarget (watcher) {
  Dep.target = watcher
}

export function popTarget () {
  Dep.target = null
}
export default Dep