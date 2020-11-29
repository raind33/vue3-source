(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  const attribute = /^\s*([^\s"'<>\/=]+)(?:\s*(=)\s*(?:"([^"]*)"+|'([^']*)'+|([^\s"'=<>`]+)))?/;
  const ncname = `[a-zA-Z_][\\-\\.0-9_a-zA-Z]*`;
  const qnameCapture = `((?:${ncname}\\:)?${ncname})`;
  const startTagOpen = new RegExp(`^<${qnameCapture}`);
  const startTagClose = /^\s*(\/?)>/;
  const endTag = new RegExp(`^<\\/${qnameCapture}[^>]*>`);
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
        }

        const endTagMatch = html.match(endTag);

        if (endTagMatch) {
          advance(endTagMatch[0].length);
          end(endTagMatch[1]); // 结束标签

          continue;
        }
      } // 匹配文本


      let text;

      if (textEnd > 0) {
        text = html.substring(0, textEnd);
      }

      if (text) {
        advance(text.length);
        chars(text);
      }
    }

    console.log(root, 9999999999);
    debugger;

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

      if (!opts.render) {
        let template = opts.template;

        if (!template && el) {
          template = el.outerHTML;
        }

        opts.render = compileToFunction(template);
      }
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
