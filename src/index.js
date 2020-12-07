import { compileToFunction } from "./compiler"
import { initGlobalApi } from "./global-api/index"
import { initMixin } from "./init"
import { lifecycleMixin } from "./lifecycle"
import { renderMixin } from "./vdom/index"
import { createEle, patch } from './vdom/patch'
function Vue (options) {
  this._init(options)
}
initMixin(Vue)
renderMixin(Vue)
lifecycleMixin(Vue)
initGlobalApi(Vue)

let vm1 = new Vue({
  data () {
    return {
      name: '232'
    }
  }
})
let render1 = compileToFunction(`<ul>
  <li key="a">a</li>
  <li key="b">b</li>
  <li key="c">c</li>
</ul>`)
let oldVnode = render1.call(vm1)
let el1 = createEle(oldVnode)
document.body.appendChild(el1)
let vm2 = new Vue({
  data () {
    return {
      name: '232323322'
    }
  }
})
let render2 = compileToFunction(`<ul>
<li key="c">c</li>
<li key="b">b</li>
<li key="a">a</li>
</ul>`)
let newVnode = render2.call(vm2)
setTimeout(() => {

  patch(oldVnode, newVnode)
},4000)
export default Vue