<template>
  <div>
    <img  v-if="!invalid" class="logo" :src="require(`../../public/img/logos/${verifier}.svg`)" />
    <img v-else class="invalid logo" :src="require('../../public/img/icons/cross.png')" />
  </div>
</template>

<script>
export default {
  props: {
    verifier: String,
    invalid: Boolean
  }
}
</script>

<style scoped>
.invalid.logo {
  filter: grayscale(100%);
}
.logo {
  width: 12px;
  padding-right: 2px;
}
</style>