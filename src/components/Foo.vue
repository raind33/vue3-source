<template>
  <div @click="handle">
    {{$store.state.name}}
  </div>
</template>

<script>
  export default {
    methods: {
      handle () {
        alert(23)
      }
    },
    asyncData (store) { // 只有页面级组件才有这个方法
      return store.dispatch('changeName')
    },
    // mounted () {
    //   this.$store.dispatch('changeName')
    // }
  }
</script>

<style  scoped>
div{
  color: red;
}
</style>