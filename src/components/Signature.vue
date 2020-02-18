<template>
  <v-container fluid>
    <v-row justify="center" align="center">
      <v-col cols="3">
        <v-row justify="center" align="center">
          <div class="signature-container">
          <v-col
            class="no-margin-padding"
            cols="12"
            justify="center"
            align="center"
          >
            <p id="signature-text">{{ name }}</p>
          </v-col>
          <v-col
            class="no-margin-padding"
            id="small-text"
            cols="12"
            justify="center"
            align="center"
          >
            <v-row justify="center" align="center">
                <logo :verifier="verifier" />
                {{ verifierid }}
            </v-row>
          </v-col>
          </div>
        </v-row>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import Logo from "./Logo.vue"
export default {
  data() {
    return {
      textSignature: null,
      image: null
    }
  },
  components: {
    logo: Logo
  },
  props: {
    verifier: String,
    verifierid: String,
    name: String
  },
}
</script>

<style scoped>
.signature-container {
  padding: 5px 5px 5px 5px;
  border: solid #1976d2 2px;
  border-radius: 10px;
  overflow: hidden;
  min-width: 100px;
}
#signature-text {
  font-family: "Homemade Apple";
  margin-bottom: -10px;
  padding: 5px 5px 5px 5px;
  font-size: 20px;
}
#small-text {
  font-size: 12px;
}
.no-margin-padding {
  margin: 0 0 0 0;
  padding: 0 0 0 0;
}
@font-face {
  font-family: "Homemade Apple";
  font-style: normal;
  font-weight: 400;
  src: local("Homemade Apple Regular"), local("HomemadeApple-Regular"),
    url(https://fonts.gstatic.com/s/homemadeapple/v10/Qw3EZQFXECDrI2q789EKQZJob0x6XHgOiJM6.woff2)
      format("woff2");
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA,
    U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215,
    U+FEFF, U+FFFD;
}
</style>
