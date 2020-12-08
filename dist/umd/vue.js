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
    } // console.log(root, 9999999999)


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
    }
  }

  function compileToFunction(template) {
    const ast = htmlParser(template);
    const code = generate(ast);
    const render = new Function(`with(this){return ${code}}`);
    return render;
  }

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
  let callbacks = [];
  let waiting = false;

  function flushCallback() {
    for (let i = 0; i < callbacks.length; i++) {
      callbacks[i]();
    }

    waiting = false;
  } // 1.第一次cb渲染watcher更新操作调用nextTick,页面初渲染
  // 2. 第二次是用户主动调用nextTick的cb
  // 3.所以当在页面中使用nextTick,页面渲染与nextTick的回调都是在宏任务结束后同步执行，渲染先


  function nextTick(cb) {
    callbacks.push(cb);

    if (!waiting) {
      waiting = true;
      Promise.resolve().then(flushCallback); // 多次调用nextTick，只执行一次
    }
  }
  const hooks = ['beforeCreate', 'created', 'beforeMount', 'mounted'];
  const strat = {};
  strat.components = mergeComponents;

  function mergeComponents(parent, child) {
    const res = Object.create(parent);

    if (child) {
      for (let key in child) {
        res[key] = child[key];
      }
    }

    return res;
  }

  hooks.forEach(hook => {
    strat[hook] = mergeHook;
  });

  function mergeHook(parent, child) {
    if (child) {
      if (parent) {
        return parent.concat(child);
      } else {
        return [child];
      }
    } else {
      return parent;
    }
  }

  function mergeOptions(parent, child) {
    let options = {};

    for (let key in parent) {
      mergeField(key);
    }

    for (let key in child) {
      if (!parent.hasOwnProperty(key)) {
        mergeField(key);
      }
    }

    return options;

    function mergeField(key) {
      if (strat[key]) {
        options[key] = strat[key](parent[key], child[key]);
        return;
      }

      if (isObj(parent[key]) && isObj(child[key])) {
        options[key] = Object.assign(parent[key], child[key]);
      } else {
        if (child[key]) {
          options[key] = child[key];
        } else if (parent[key]) {
          options[key] = parent[key];
        }
      }
    }
  }
  function isObj(val) {
    return typeof val === 'object' && typeof val !== 'null';
  }

  function makeup(str) {
    const map = {};
    str.split(',').forEach(tag => {
      map[tag] = true;
    });
    return val => map[val] || false;
  }

  const isReservedTag = makeup('a,p,ul,li,ol,div,span,input,button');

  function initGlobalApi(Vue) {
    Vue.options = {};

    Vue.mixin = function (options) {
      this.options = mergeOptions(this.options, options);
      console.log(this.options);
    };

    Vue.options.components = {};
    Vue.options._base = Vue;

    Vue.component = function (id, definition) {
      definition.name = id || definition.name;
      definition = this.options._base.extend(definition);
      this.options.components[id] = definition;
    };

    let cid = 0;

    Vue.extend = function (options) {
      const Super = this;

      const Sub = function VueComponent(options) {
        this._init(options);
      };

      Sub.cid = cid++;
      Sub.prototype = Object.create(Super.prototype);
      Sub.prototype.constructor = Sub;
      Sub.component = Super.component;
      Sub.options = mergeOptions(Super.options, options);
      return Sub;
    };
  }

  function renderMixin(Vue) {
    Vue.prototype._c = function () {
      const vm = this;
      return createElement(vm, ...arguments);
    };

    Vue.prototype._s = function (val) {
      return val === null ? '' : typeof val === 'object' ? JSON.stringify(val) : val;
    };

    Vue.prototype._v = function (text) {
      const vm = this;
      return createTextVnode(vm, text);
    };

    Vue.prototype._render = function () {
      const vm = this;
      const render = vm.$options.render;
      const vnode = render.call(vm);
      return vnode;
    };
  }

  function createElement(vm, tag, data = {}, ...children) {
    if (!isReservedTag(tag)) {
      const Ctor = vm.$options.components[tag];
      return createComponent(vm, tag, data, data.key, children, Ctor);
    }

    return vnode(vm, tag, data, data.key, children);
  } // 创建组件vnode


  function createComponent(vm, tag, data, key, children, Ctor) {
    if (isObj(Ctor)) {
      Ctor = vm.$options._base.extend(Ctor);
    } // 给组件增加生命周期


    data.hook = {
      init(vnode) {
        const child = vnode.componentInstance = new vnode.componentOptions.Ctor({});
        child.$mount();
      }

    };
    return vnode(vm, `vue-component-${Ctor.cid}-${tag}`, data, key, undefined, undefined, {
      Ctor
    });
  }

  function createTextVnode(vm, text) {
    return vnode(vm, undefined, undefined, undefined, undefined, text);
  }

  function vnode(vm, tag, data, key, children, text, componentOptions) {
    return {
      vm,
      tag,
      data,
      key,
      children,
      text,
      componentOptions
    };
  }

  function isSameNode(oldNode, newNode) {
    if (oldNode.tag === newNode.tag && oldNode.key === newNode.key) return true;
    return false;
  }

  function patch(oldVnode, vnode) {
    if (!oldVnode) {
      return createEle(vnode);
    }

    const isRealEl = oldVnode.nodeType;

    if (isRealEl) {
      let el = createEle(vnode);
      let parentEl = oldVnode.parentNode;
      parentEl.insertBefore(el, oldVnode.nextSibling);
      parentEl.removeChild(oldVnode);
      return el;
    } else {
      // diff算法
      //1.标签类型不同 直接删除老的
      if (oldVnode.tag !== vnode.tag) {
        oldVnode.el.parentNode.replaceChild(createEle(vnode), oldVnode.el);
        return;
      } // 2.文本类型


      if (!oldVnode.tag) {
        if (oldVnode.text !== vnode.text) {
          oldVnode.el.textContent = vnode.text;
          return oldVnode.el;
        }
      } // 3.元素类型相同,复用老节点，并且更新属性


      let el = vnode.el = oldVnode.el;
      patchProps(vnode, oldVnode.data || {}); // 4. 更新儿子
      //  1. 老的有儿子新的也有儿子domdiff

      let oldChildren = oldVnode.children || [];
      let newChildren = vnode.children || [];

      if (oldChildren.length > 0 && newChildren.length > 0) {
        updateChildren(el, oldChildren, newChildren);
      } else if (oldChildren.length > 0) {
        //  2. 老的有儿子 新的没有儿子 =》删除老儿子
        el.innerHTML = '';
      } else {
        //  3. 新的有儿子 老的的没有儿子 =》老节点上直接增加儿子
        newChildren.forEach(child => el.appendChild(createEle(child)));
      }
    }
  }

  function updateChildren(parent, oldChildren, newChildren) {
    // 双指针比较法
    let oldStartIndex = 0; // 老的头索引

    let oldEndIndex = oldChildren.length - 1; // 老的尾索引

    let oldStartNode = oldChildren[0]; // 老的开始节点

    let oldEndNode = oldChildren[oldEndIndex]; // 老的结束节点

    let newStartIndex = 0; // 新的头索引

    let newEndIndex = newChildren.length - 1; // 新的尾索引

    let newStartNode = newChildren[0]; // 新的开始节点

    let newEndNode = newChildren[newEndIndex]; // 新的结束节点

    let keyToOldIndexMap = getKeyToOldIndexMap(oldChildren); // 旧子节点key与index的映射关系

    function getKeyToOldIndexMap(children) {
      let map = {};

      for (let i = 0; i < children.length; i++) {
        const child = children[i];
        map[child.key] = i;
      }

      return map;
    }

    while (oldStartIndex <= oldEndIndex && newStartIndex <= newEndIndex) {
      if (!oldStartNode) {
        oldStartNode = oldChildren[++oldStartIndex];
      } else if (!oldEndNode) {
        oldEndNode = oldChildren[--oldEndIndex];
      } else if (isSameNode(oldStartNode, newStartNode)) {
        //头比较
        patch(oldStartNode, newStartNode);
        oldStartNode = oldChildren[++oldStartIndex];
        newStartNode = newChildren[++newStartIndex];
      } else if (isSameNode(oldEndNode, newEndNode)) {
        //尾比较
        patch(oldEndNode, newEndNode);
        oldEndNode = oldChildren[--oldEndIndex];
        newEndNode = newChildren[--newEndIndex];
      } else if (isSameNode(oldStartNode, newEndNode)) {
        // 假设children刚好倒序，头尾比较
        patch(oldStartNode, newEndNode);
        parent.insertBefore(oldStartNode.el, oldEndNode.el.nextSibling);
        oldStartNode = oldChildren[++oldStartIndex];
        newEndNode = newChildren[--newEndIndex];
      } else if (isSameNode(oldEndNode, newStartNode)) {
        //尾头比较
        patch(oldEndNode, newStartNode);
        parent.insertBefore(oldEndNode.el, oldStartNode.el);
        oldEndNode = oldChildren[--oldEndIndex];
        newStartNode = newChildren[++newStartIndex];
      } else {
        // 乱序比较 a b c d f
        // n a c b e
        const moveIndex = keyToOldIndexMap[newStartNode.key];

        if (moveIndex === undefined) {
          // 如果新的在旧的没找到直接添加
          parent.insertBefore(createEle(newStartNode), oldStartNode.el);
        } else {
          const moveNode = oldChildren[moveIndex];
          oldChildren[moveIndex] = undefined;
          patch(moveNode, newStartNode);
          parent.insertBefore(moveNode.el, oldStartNode.el);
        }

        newStartNode = newChildren[++newStartIndex];
      }
    } // 新字节点有多余


    if (newStartIndex <= newEndIndex) {
      for (let i = newStartIndex; i <= newEndIndex; i++) {
        let ele = !newChildren[newEndIndex + 1] ? null : newChildren[newEndIndex + 1].el;
        parent.insertBefore(createEle(newChildren[i]), ele);
      }
    } // 旧子节点有多余


    if (oldStartIndex <= oldEndIndex) {
      for (let i = oldStartIndex; i <= oldEndIndex; i++) {
        if (oldChildren[i] !== undefined) {
          parent.removeChild(oldChildren[i].el);
        }
      }
    }
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
      if (createComponent$1(vnode)) {
        return vnode.componentInstance.$el;
      }

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

  function createComponent$1(vnode) {
    const {
      data
    } = vnode;
    let i;

    if ((i = data.hook) && (i = i.init)) {
      i(vnode); // 调用组件的初始化方法

      if (vnode.componentInstance) {
        return true;
      }
    }

    return false;
  }

  function patchProps(vnode, oldProps = {}) {
    const newProps = vnode.data || {};
    const el = vnode.el; //1. 老的属性有，新的没有，删除没有的

    for (let key in oldProps) {
      if (!newProps[key]) {
        el.removeAttribute(key);
      }
    } // style特殊处理


    let oldStyle = oldProps.style || {};
    let newStyle = newProps.style || {};

    for (let key in oldStyle) {
      if (!newStyle[key]) {
        el.style[key] = '';
      }
    } //2.老的属性没有，新的属性有，直接增加


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

  let id = 0;

  class Dep {
    constructor() {
      this.id = id++;
      this.subs = []; // 需要记住的watcher
    }

    depend() {
      Dep.target.addDep(this);
    }

    addSub(watcher) {
      this.subs.push(watcher);
      console.log(this.subs);
    }

    notify() {
      this.subs.forEach(watcher => {
        watcher.update();
      });
    }

  }

  Dep.target = null;
  function pushTarget(watcher) {
    Dep.target = watcher;
  }
  function popTarget() {
    Dep.target = null;
  }

  let queue = [];
  let has = {};
  let pending = false;

  function flushSchedular() {
    for (let i = 0; i < queue.length; i++) {
      const watcher = queue[i];
      watcher.run();
    }

    queue = [];
    has = {};
    pending = false;
  } // 多次调用queueWatcher， 如果watcher不是同一个也会重复调用nextTick


  function queueWatcher(watcher) {
    const id = watcher.id;

    if (has[id] == null) {
      queue.push(watcher);
      has[id] = true;

      if (!pending) {
        pending = true;
        nextTick(flushSchedular);
      }
    }
  }

  let id$1 = 0;
  class Watcher {
    constructor(vm, exprOrFn, cb, renderWatcher) {
      this.vm = vm;
      this.cb = cb;
      this.getter = exprOrFn;
      this.options = vm.options;
      this.id = id$1++;
      this.deps = [];
      this.depsId = new Set();
      this.get();
    } // 当属性取值时，需要记住这个watcher。数据再次变化，就去执行自己记住的这个watcher


    get() {
      // 这个方法会对属性进行取值
      pushTarget(this);
      this.getter();
      popTarget();
    }

    addDep(dep) {
      if (!this.depsId.has(dep.id)) {
        this.depsId.add(dep.id);
        this.deps.push(dep);
        dep.addSub(this);
      }
    }

    run() {
      this.get();
    }

    update() {
      queueWatcher(this); // this.get()
    }

  }

  function lifecycleMixin(Vue) {
    Vue.prototype._update = function (vnode) {
      const vm = this;
      const prev = vm._vnode;
      vm._vnode = vnode;

      if (!prev) {
        vm.$el = patch(vm.$el, vnode);
      } else {
        vm.$el = patch(prev, vnode);
      }

      console.log(vm.$el);
    };
  }
  function callHook(vm, key) {
    const handlers = vm.$options[key];
    handlers && handlers.forEach(handle => handle.call(vm));
  }
  function mountComponent(vm) {
    const updateComponent = () => {
      vm._update(vm._render());
    }; // true代表是渲染watcher


    new Watcher(vm, updateComponent, () => {}, true);
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

      this.__ob__.dep.notify();

      return result;
    };
  });

  class Observer {
    constructor(data) {
      this.dep = new Dep(); // 给数组和对象本身增加一个dep属性

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

  } // 让里层数组收集外层数组的依赖，这样修改里层数组也可以更新视图


  function dependArray(val) {
    for (let i = 0; i < val.length; i++) {
      const current = val[i];
      current.__ob__ && current.__ob__.dep.depend();

      if (Array.isArray(current)) {
        dependArray(current);
      }
    }
  }

  function defineReactive(data, key, val) {
    const childOb = observe(val);
    const dep = new Dep(); // 每次都会给属性创建一个dep

    Object.defineProperty(data, key, {
      get() {
        // console.log('获取值')
        if (Dep.target) {
          dep.depend(); // 让这个属性自己的dep记住这个watcher

          if (childOb) {
            childOb.dep.depend();

            if (Array.isArray(val)) {
              dependArray(val);
            }
          }
        }

        return val;
      },

      set(newVal) {
        // console.log('设置值')
        if (val === newVal) return;
        observe(newVal);
        val = newVal;
        dep.notify();
      }

    });
  }

  function observe(data) {
    if (typeof data !== 'object' || typeof data === null) {
      return;
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
      vm.$options = mergeOptions(vm.constructor.options, opts);
      console.log(vm.$options);
      callHook(vm, 'beforeCreate');
      initState(vm);
      callHook(vm, 'created');

      if (vm.$options.el) {
        vm.$mount(vm.$options.el);
      }
    };

    Vue.prototype.$nextTick = nextTick;

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

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);
  renderMixin(Vue);
  lifecycleMixin(Vue);
  initGlobalApi(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
