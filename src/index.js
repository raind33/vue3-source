import { reactive, effect, computed, ref } from './reactivity'


const state = reactive({name: 'rain', age: 22})

const newAge = computed(() => {
  console.log('newage')
  return state.age * 10
})
// effect(() => {
//   console.log(newAge.value)
// })
newAge.value;
// newAge.value;
// state.age = 20