(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = typeof globalThis !== 'undefined' ? globalThis : global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  class Observer {
    constructor(data) {
      this.walk(data);
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
      return;
    }

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
