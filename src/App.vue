<template>
  <div id="app">
    <router-link to="/foo">foo</router-link>
    <router-link to="/bar">bar</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
import Foo from './components/Foo'
import Bar from './components/Bar'
  export default {
    components: {
      Foo,
      Bar
    }
  }
</script>

<style  scoped>

</style>