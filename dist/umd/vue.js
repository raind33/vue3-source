(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  const defaultTagRe = /\{\{((?:.|\r?\n)+?)\}\}/g;
  function generate(ast) {
    // <div id="app" style="color:red"> hello {{name}} <span>232</span></div>
    // render () {
    //   return _c('div', {id:'app',style:{color:'red'}},_v('hello'+_s(name)),_c('span',null,
    //     _v('232')
    //   ))
    // }
    let children = genChildren(ast.children);
    let code = `_c('${ast.tag}',${ast.attrs.length ? genProps(ast.attrs) : 'undefined'}${children ? `,${children}` : ''})`;
    return code;
  }

  function genProps(attrs) {
    let str = '';

    for (let i = 0; i < attrs.length; i++) {
      const attr = attrs[i];

      if (attr.name === 'style') {
        let obj = {};
        attr.value.split(';').forEach(item => {
          const [key, value] = item.split(':');
          obj[key] = value;
        });
        attr.value = obj;
      }

      str += `${attr.name}:${JSON.stringify(attr.value)},`;
    }

    return `{${str.slice(0, -1)}}`;
  }

  function genChildren(children) {
    if (children) {
      return children = children.map(child => gen(child)).join(',');
    }
  }

  function gen(child) {
    if (child.type === 1) {
      return generate(child);
    } else {
      let text = child.text;

      if (!defaultTagRe.test(text)) {
        return `_v(${JSON.stringify(text)})`;
      }

      let tokens = [];
      let lastIndex = defaultTagRe.lastIndex = 0;
      let match, index; //hello {{name}} wew {{age}}

      while (match = defaultTagRe.exec(text)) {
        index = match.index;

        if (index > lastIndex) {
          tokens.push(JSON.stringify(text.slice(lastIndex, index)));
        }

        tokens.push(`_s(${match[1].trim()})`);
        lastIndex = index + match[0].length;
      }

      if (lastIndex < text.length) {
        tokens.push(JSON.stringify(text.slice(lastIndex)));
      }

      return `_v(${tokens.join('+')})`;
    }
  }

  const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
  const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
  const startTagOpen = new RegExp(`^<${qnameCapture}`);
  const startTagClose = /^\s*(\/?)>/;
  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
  //   23222222222222
  //   <p class="log" model="3">232<span id="we">23</span></p>
  // </div>

  function htmlParser(html) {
    let root;
    let currentParent;
    let stack = [];

    while (html) {
      const textEnd = html.indexOf('<');

      if (textEnd === 0) {
        const startTagMatch = parseStartTag();

        if (startTagMatch) {
          start(startTagMatch.tagName, startTagMatch.attrs);
          continue;
        } // </span></p>
        //  </div>


        const endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]); // 结束标签

          continue;
        }
      } // 匹配文本


      let text;

      if (textEnd > 0) {
        //   23222222222222
        //   <p class="log" model="3">232<span id="we">23</span></p>
        // </div>
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length);
        chars(text);
      }
    }

    console.log(root, 9999999999);
    return root;

    function advance(n) {
      html = html.substring(n);
    }

    function parseStartTag() {
      const start = html.match(startTagOpen);

      if (start) {
        const match = {
          tagName: start[1],
          attrs: []
        };
        advance(start[0].length);
        let end;
        let attr; // 匹配开始标签的属性

        while (!(end = html.match(startTagClose)) && (attr = html.match(attribute))) {
          match.attrs.push({
            name: attr[1],
            value: attr[3] || attr[4] || attr[5]
          });
          advance(attr[0].length);
        }

        if (end) {
          advance(end[0].length);
          console.log(html);
          return match;
        }
      }
    }

    function createASTElement(tagName, attrs) {
      return {
        tag: tagName,
        type: 1,
        // 元素类型，
        children: [],
        attrs,
        parent
      };
    }

    function start(tagName, attrs) {
      let element = createASTElement(tagName, attrs);

      if (!root) {
        root = element;
      }

      currentParent = element;
      stack.push(element);
    }

    function chars(text) {
      text = text.trim();
      currentParent.children.push({
        type: 3,
        text
      });
      console.log(text, 'text');
    }

    function end(tagName) {
      // 在结尾标签处创建父子关系
      const element = stack.pop();
      currentParent = stack[stack.length - 1];

      if (currentParent) {
        // 闭合时可以知道父亲是谁
        currentParent.children.push(element);
        element.parent = currentParent;
      }

      console.log(tagName, '------结束标签------');
    }
  }

  function compileToFunction(template) {
    const ast = htmlParser(template);
    const code = generate(ast);
    const render = new Function(`with(this){return ${code}}`);
    console.log(render);
    return render;
  }

  function patch(oldVnode, vnode) {
    console.log(vnode);
    let el = createEle(vnode);
    let parentEl = oldVnode.parentNode;
    parentEl.insertBefore(el, oldVnode.nextSibling);
    parentEl.removeChild(oldVnode);
  }

  function createEle(vnode) {
    let {
      tag,
      data,
      children,
      key,
      text
    } = vnode;

    if (typeof tag === 'string') {
      vnode.el = document.createElement(tag);
      patchProps(vnode);
      children.forEach(child => {
        vnode.el.appendChild(createEle(child));
      });
    } else {
      vnode.el = document.createTextNode(text);
    }

    return vnode.el;
  }

  function patchProps(vnode) {
    const newProps = vnode.data || {};
    const el = vnode.el;

    for (let key in newProps) {
      if (key === 'style') {
        for (let s in newProps[key]) {
          el.style[s] = newProps[key][s];
        }
      } else if (key === 'class') {
        el.className = newProps[key];
      } else {
        el.setAttribute(key, newProps[key]);
      }
    }
  }

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      const vm = this;
      patch(vm.$el, vnode);
    };
  }
  function mountComponent(vm, el) {
    vm._update(vm._render());
  }

  const oldArrayMethods = Array.prototype;
  const newArrayProto = Object.create(oldArrayMethods);
  let methods = ['push', 'pop', 'shift', 'unshift', 'splice', 'reverse', 'sort'];
  methods.forEach(method => {
    newArrayProto[method] = function (...args) {
      const result = oldArrayMethods[method].apply(this, args);
      let insert;

      switch (method) {
        case 'push':
        case 'unshift':
          insert = args;
          break;

        case 'splice':
          insert = args.slice(2);
          break;
      }

      if (insert) {
        this.__ob__.observedArray(insert);
      }

      return result;
    };
  });

  function proxy(vm, data, key) {
    Object.defineProperty(vm, key, {
      get() {
        return vm[data][key];
      },

      set(val) {
        vm[data][key] = val;
      }

    });
  }
  function defineProperty(target, key, value) {
    Object.defineProperty(target, key, {
      enumerable: false,
      configurable: false,
      value
    });
  }

  class Observer {
    constructor(data) {
      defineProperty(data, '__ob__', this);

      if (Array.isArray(data)) {
        data.__proto__ = newArrayProto;
        this.observedArray(data);
        return;
      }

      this.walk(data);
    }

    observedArray(arr) {
      arr.forEach(item => {
        observe(item);
      });
    }

    walk(data) {
      Object.keys(data).forEach(key => {
        defineReactive(data, key, data[key]);
      });
    }

  }

  function defineReactive(data, key, val) {
    observe(val);
    Object.defineProperty(data, key, {
      get() {
        console.log('获取值');
        return val;
      },

      set(newVal) {
        console.log('设置值');
        if (val === newVal) return;
        observe(newVal);
        val = newVal;
      }

    });
  }

  function observe(data) {
    if (typeof data !== 'object' || typeof data === null) {
      return data;
    }

    if (data.__ob__) return data;
    return new Observer(data);
  }

  function initState(vm) {
    const opts = vm.$options;

    if (opts.props) ;

    if (opts.data) {
      initData(vm);
    }

    if (opts.methods) ;

    if (opts.watch) ;

    if (opts.computed) ;
  }

  function initData(vm) {
    let data = vm.$options.data;
    data = vm._data = typeof data === 'function' ? data.call(vm) : data;

    for (let key in data) {
      proxy(vm, '_data', key);
    }

    observe(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (opts) {
      const vm = this;
      vm.$options = opts;
      initState(vm);

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$mount = function (el) {
      const vm = this;
      const opts = vm.$options;
      el = document.querySelector(el);
      vm.$el = el;

      if (!opts.render) {
        let template = opts.template;

        if (!template && el) {
          template = el.outerHTML;
        }

        opts.render = compileToFunction(template);
      }

      mountComponent(vm);
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._c = function () {
      return createElement(...arguments);
    };

    Vue.prototype._s = function (val) {
      return val === null ? '' : typeof val === 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._v = function (text) {
      return createTextVnode(text);
    };

    Vue.prototype._render = function () {
      const vm = this;
      const render = vm.$options.render;
      const vnode = render.call(vm);
      return vnode;
    };
  }

  function createElement(tag, data = {}, ...children) {
    return vnode(tag, data, data.key, children);
  }

  function createTextVnode(text) {
    return vnode(undefined, undefined, undefined, undefined, text);
  }

  function vnode(tag, data, key, children, text) {
    return {
      tag,
      data,
      key,
      children,
      text
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);
  renderMixin(Vue);
  lifecycleMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
