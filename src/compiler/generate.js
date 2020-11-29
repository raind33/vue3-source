const defaultTagRe = /\{\{((?:.|\r?\n)+?)\}\}/g
export function generate(ast) {
  // <div id="app" style="color:red"> hello {{name}} <span>232</span></div>
  // render () {
  //   return _c('div', {id:'app',style:{color:'red'}},_v('hello'+_s(name)),_c('span',null,
  //     _v('232')
  //   ))
  // }
  let children = genChildren(ast.children)
  let code = `_c('${ast.tag}',${
    ast.attrs.length ? genProps(ast.attrs):'undefined'
  }${children?`,${children}`:''})`

  return code
}

function genProps (attrs) {
  let str = ''

  for(let i = 0; i< attrs.length; i++) {
    const attr = attrs[i]
    if (attr.name === 'style') {
      let obj = {}
      attr.value.split(';').forEach(item => {
        const [key, value] = item.split(':')
        obj[key] = value
      })
      attr.value = obj
    }
    str+=`${attr.name}:${JSON.stringify(attr.value)},`
  }

  return `{${str.slice(0, -1)}}`
}
function genChildren (children) {
  if (children) {
    return children = children.map(child => gen(child)).join(',')
  }
}

function gen (child) {
  if (child.type === 1) {
    return generate(child)
  } else {
    let text = child.text
    if (!defaultTagRe.test(text)) {
      return `_v(${JSON.stringify(text)})`
    }

    let tokens = []
    let lastIndex = defaultTagRe.lastIndex = 0
    let match,index
    //hello {{name}} wew {{age}}
    while (match = defaultTagRe.exec(text)) {
      index = match.index
      if(index > lastIndex) {
        tokens.push(JSON.stringify(text.slice(lastIndex, index)))
      } 
      tokens.push(`_s(${match[1].trim()})`)
      lastIndex = index + match[0].length
    }

    if (lastIndex<text.length) {
      tokens.push(JSON.stringify(text.slice(lastIndex)))
    }
    return `_v(${tokens.join('+')})`
  }
}
