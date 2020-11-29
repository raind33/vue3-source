(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

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

  class Observer {
    constructor(data) {
      Object.defineProperty(data, '__ob__', {
        enumerable: false,
        configurable: false,
        value: this
      });

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
    observe(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (opts) {
      const vm = this;
      vm.$options = opts;
      initState(vm);
    };
  }

  function Vue(options) {
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
