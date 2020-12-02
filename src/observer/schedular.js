import { nextTick } from "../util"

let queue = []
let has = {}
let pending = false
function flushSchedular () {
  for (let i = 0; i < queue.length; i++) {
    const watcher = queue[i]
    watcher.run()
  }
  queue = []
  has = {}
  pending = false
}
// 多次调用queueWatcher， 如果watcher不是同一个也会重复调用nextTick
export function queueWatcher (watcher) {
  const id = watcher.id
  if (has[id] == null) {
    queue.push(watcher)
    has[id] = true
    if(!pending) {
      pending = true
      nextTick(flushSchedular)
    }
  }
}