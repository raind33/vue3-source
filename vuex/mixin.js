export function  applyMixin(Vue) {
  Vue.mixin({
    beforeCreate () {
      const opts = this.$options
      // 给所有组件增加$store属性，指向我们创建的store实例
      if (opts.store) { // 根实例
        this.$store = opts.store
      } else if(opts.parent && opts.parent.$store) {
        this.$store = opts.parent.$store
      }
    }
  })
  
}