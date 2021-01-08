export function mapState (stateArr) {
  const obj = {}
  stateArr.forEach(stateName => {
    obj[stateName] = function () {
      return this.$store.state[stateName]
    }
  })
  return obj
}
export function mapGetters (gettersArr) {
  const obj = {}
  gettersArr.forEach(getterName => {
    obj[getterName] = function () {
      return this.$store.getters[getterName]
    }
  })
  return obj
}