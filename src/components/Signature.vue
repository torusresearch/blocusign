<template>
  <v-container fluid>
    <v-row justify="center" align="center">
      <v-col cols="2" justify="center" align="center">
        <v-img v-if="image" :src="image"></v-img>
        {{ verifier }} | {{ verifierid }} | {{ name }}
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
const TextSignature = require("text-signature")
const defaultOpts = {
  width: 300,
  height: 300,
  paddingX: 100,
  paddingY: 100,
  canvasTargetDom: ".js-canvasTargetDom",
  font: ["50px", "'Homemade Apple'"],
  color: "blue",
  textString: "Your Text HERE",
  customFont: {
    name: "'Homemade Apple'",
    url: "https://fonts.googleapis.com/css?family=Homemade+Apple"
  }
}

export default {
  data() {
    return {
      textSignature: null,
      image: null,
    }
  },
  props: {
    verifier: String,
    verifierid: String,
    name: String,
  },
  mounted() {
    window.SSS = this
    this.textSignature = new TextSignature({
      ...defaultOpts,
      ...{
        textString: this.name
      }
    })
    this.image = this.textSignature.getImageData()
  }
}
</script>
