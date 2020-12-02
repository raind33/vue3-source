const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const dynamicArgAttribute = /^\s*((?:v-[\w-]+:|@|:|#)\[[^=]+\][^\s"'<>\/=]*)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/
const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`
const qnameCapture = `((?:${ncname}\\:)?${ncname})`
const startTagOpen = new RegExp(`^<${qnameCapture}`)
const startTagClose = /^\s*(\/?)>/
const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`)
const doctype = /^<!DOCTYPE [^>]+>/i
// #7298: escape - to avoid being passed as HTML comment when inlined in page
const comment = /^<!\--/
const conditionalComment = /^<!\[/
// <div id="app" mode=2>
//   23222222222222
//   <p class="log" model="3">232<span id="we">23</span></p>
// </div>
export function htmlParser(html) {
  let root
  let currentParent
  let stack = []
  while (html) {
    const textEnd = html.indexOf('<')
    if (textEnd === 0) {
      const startTagMatch = parseStartTag()
      if (startTagMatch) {
        start(startTagMatch.tagName, startTagMatch.attrs)
        continue
      }
      // </span></p>
      //  </div>
      const endTagMatch = html.match(endTag)
      if (endTagMatch) {
        advance(endTagMatch[0].length)
        end(endTagMatch[1]) // 结束标签
        continue
      }
    }
    // 匹配文本
    let text
    if (textEnd > 0) {
      //   23222222222222
      //   <p class="log" model="3">232<span id="we">23</span></p>
      // </div>
      text = html.substring(0, textEnd)
    }
    if (text) {
      advance(text.length)
      chars(text)
    }
  }
  // console.log(root, 9999999999)
  return root
  function advance(n) {
    html = html.substring(n)
  }

  function parseStartTag() {
    const start = html.match(startTagOpen)
    if (start) {
      const match = {
        tagName: start[1],
        attrs: [],
      }
      advance(start[0].length)
      let end
      let attr
      // 匹配开始标签的属性
      while (
        !(end = html.match(startTagClose)) &&
        (attr = html.match(attribute))
      ) {
        match.attrs.push({
          name: attr[1],
          value: attr[3] || attr[4] || attr[5],
        })
        advance(attr[0].length)
      }
      if (end) {
        advance(end[0].length)
        return match
      }
    }
  }

  function createASTElement(tagName, attrs) {
    return {
      tag: tagName,
      type: 1, // 元素类型，
      children: [],
      attrs,
      parent,
    }
  }

  function start(tagName, attrs) {
    let element = createASTElement(tagName, attrs)
    if (!root) {
      root = element
    }

    currentParent = element
    stack.push(element)
  }
  function chars(text) {
    text = text.trim()
    currentParent.children.push({
      type: 3,
      text,
    })
  }
  function end(tagName) {
    // 在结尾标签处创建父子关系
    const element = stack.pop()
    currentParent = stack[stack.length - 1]
    if (currentParent) {
      // 闭合时可以知道父亲是谁
      currentParent.children.push(element)
      element.parent = currentParent
    }
  }
}
