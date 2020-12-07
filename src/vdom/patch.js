import { isSameNode } from "."

export function patch (oldVnode, vnode) {

  if(!oldVnode) {
    return createEle(vnode)
  }
  const isRealEl = oldVnode.nodeType
  if (isRealEl) {
    let el = createEle(vnode)
    let parentEl = oldVnode.parentNode
    parentEl.insertBefore(el, oldVnode.nextSibling)
    parentEl.removeChild(oldVnode)
    return el
  } else {
    // diff算法
    //1.标签类型不同 直接删除老的
    if(oldVnode.tag !== vnode.tag) {
      oldVnode.el.parentNode.replaceChild(createEle(vnode), oldVnode.el)
      return
    }
    // 2.文本类型
    if(!oldVnode.tag) {
      if(oldVnode.text !== vnode.text) {
        oldVnode.el.textContent = vnode.text
        return oldVnode.el
      }
    }
    // 3.元素类型相同,复用老节点，并且更新属性
    let el = vnode.el = oldVnode.el
    patchProps(vnode, oldVnode.data || {})

    // 4. 更新儿子
    //  1. 老的有儿子新的也有儿子domdiff
    let oldChildren = oldVnode.children || []
    let newChildren = vnode.children || []
    if (oldChildren.length > 0 && newChildren.length > 0 ) {
      updateChildren(el, oldChildren, newChildren)
    } else if(oldChildren.length > 0) {//  2. 老的有儿子 新的没有儿子 =》删除老儿子
      el.innerHTML = ''
    } else {//  3. 新的有儿子 老的的没有儿子 =》老节点上直接增加儿子
      newChildren.forEach(child => el.appendChild(createEle(child)))
    }
    
    
  }
}
function updateChildren (parent, oldChildren, newChildren) {
  // 双指针比较法
  let oldStartIndex = 0 // 老的头索引
  let oldEndIndex = oldChildren.length - 1 // 老的尾索引
  let oldStartNode = oldChildren[0] // 老的开始节点
  let oldEndNode = oldChildren[oldEndIndex] // 老的结束节点

  let newStartIndex = 0 // 新的头索引
  let newEndIndex = newChildren.length - 1 // 新的尾索引
  let newStartNode = newChildren[0] // 新的开始节点
  let newEndNode = newChildren[newEndIndex] // 新的结束节点

  while(oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
    if (isSameNode(oldStartNode, newStartNode)) { //头比较
      patch(oldStartNode, newStartNode)
      oldStartNode = oldChildren[++oldStartIndex]
      newStartNode = newChildren[++newStartIndex]
    } else if (isSameNode(oldEndNode, newEndNode)) { //尾比较
      patch(oldEndNode, newEndNode)
      oldEndNode = oldChildren[--oldEndIndex]
      newEndNode = newChildren[--newEndIndex]
    } else if (isSameNode(oldStartNode, newEndNode)) { // 假设children刚好倒序
      patch(oldStartNode, newEndNode)
      parent.insertBefore(oldStartNode.el, oldEndNode.el.nextSibling)
      oldStartNode = oldChildren[++oldStartIndex]
      newEndNode = newChildren[--newEndIndex]
    }
  }
  // 新字节点有多余
  if(newStartIndex <= newEndIndex) {
    for(let i = newStartIndex; i <= newEndIndex; i++) {
      let ele = !newChildren[newEndIndex+1] ? null : newChildren[newEndIndex+1].el
      parent.insertBefore(createEle(newChildren[i]), ele)
    }
  }
}
export function createEle (vnode) {
  let { tag, data, children, key, text } = vnode
  if (typeof tag === 'string') {
    if(createComponent(vnode)){
      return vnode.componentInstance.$el
    }
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

function createComponent (vnode) {
  const { data } = vnode
  let i
  if((i = data.hook) && (i = i.init)) {
    i(vnode) // 调用组件的初始化方法
    if (vnode.componentInstance) {
      return true
    }
  }
  return false
}
function patchProps (vnode, oldProps = {}) {
  const newProps = vnode.data || {}
  const el = vnode.el
  //1. 老的属性有，新的没有，删除没有的
  for(let key in oldProps) {
    if(!newProps[key]) {
      el.removeAttribute(key)
    }
  }
  // style特殊处理
  let oldStyle = oldProps.style || {}
  let newStyle = newProps.style || {}
  for(let key in oldStyle) {
    if(!newStyle[key]) {
      el.style[key] = ''
    }
  }
  //2.老的属性没有，新的属性有，直接增加
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