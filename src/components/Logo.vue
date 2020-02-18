<template>
  <img class="logo" :class="{'invalid': invalid}" :src="require(`../../public/img/logos/${verifier}.svg`)" />
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
.logo.invalid {
  filter: grayscale(100%);
}
.logo {
  width: 12px;
  padding-right: 2px;
}
</style>