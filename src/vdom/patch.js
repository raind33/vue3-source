export function patch (oldVnode, vnode) {
  console.log(vnode)

  const isRealEl = oldVnode.nodeType
  if (isRealEl) {
    let el = createEle(vnode)
    let parentEl = oldVnode.parentNode
    parentEl.insertBefore(el, oldVnode.nextSibling)
    parentEl.removeChild(oldVnode)
    return el
  } else {

  }
}

function createEle (vnode) {
  let { tag, data, children, key, text } = vnode
  if (typeof tag === 'string') {
    vnode.el  = document.createElement(tag)
    patchProps(vnode)
    children.forEach(child => {
      vnode.el.appendChild(createEle(child))
    })
  } else {
    vnode.el = document.createTextNode(text)
  }

  return vnode.el
}

function patchProps (vnode) {
  const newProps = vnode.data || {}
  const el = vnode.el
  for(let key in newProps) {
    if (key === 'style') {
      for (let s in newProps[key]) {
        el.style[s] = newProps[key][s]
      }
    } else if (key === 'class') {
      el.className = newProps[key]
    } else {
      el.setAttribute(key, newProps[key])
    }

  }
}