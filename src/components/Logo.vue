<template>
  <img id="logo" :src="require(`../../public/img/logos/${verifier}.svg`)" />
</template>

<script>
export default {
  props: {
    verifier: String,
  }
}
</script>

<style scoped>
#logo {
  width: 12px;
  padding-right: 2px;
}
</style>