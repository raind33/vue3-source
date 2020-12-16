<template>
  <div @click="handle">
    foo
  </div>
</template>

<script>
  export default {
    methods: {
      handle () {
        alert(23)
      }
    },
  }
</script>

<style  scoped>
div{
  color: red;
}
</style>