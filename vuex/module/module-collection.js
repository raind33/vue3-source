import { forEach } from '../utils'
import Module from './module'

class ModuleCollection {
  constructor(rootModule) {
    this.register([], rootModule)
  }
  register(path, module) {
    // path 记录父子关系
    const newModule = new Module(module)

    if (path.length === 0) {
      this.root = newModule
    } else {
      const parent = path.slice(0, -1).reduce((memo, current) => {
        return memo.getChild(current)
      }, this.root)
      parent.addChild(path[path.length - 1], newModule)
    }
    if (module.modules) {
      forEach(module.modules, (module, modulename) => {
        this.register([...path, modulename], module)
      })
    }
  }
  getNameSpace (path) {
    let module = this.root
    return path.reduce((str, key) => {
      module = module.getChild(key)
      return str + (module.namespaced ? key+'/' : '')
    }, '')
  }
}

export default ModuleCollection
