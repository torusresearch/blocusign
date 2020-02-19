<template>
  <v-container fluid>
    <v-row class="fwfwf" justify="center" align="center">
      <v-col cols="12">
        <v-row justify="center" align="center">
          <div class="signature-container" :class="{ invalid: invalid, unvalidated: !validated }">
            <v-col class="no-margin-padding" cols="12" justify="center" align="center">
              <p id="signature-text">{{ name }}</p>
            </v-col>
            <v-col class="no-margin-padding" id="small-text" cols="12" justify="center" align="center">
              <v-row justify="center" align="center">
                <logo :verifier="verifier" :invalid="invalid" />
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
import Logo from './Logo.vue'
export default {
  data() {
    return {
      textSignature: null,
      image: null,
      name: 'anonymous',
      verifier: 'google',
      verifierid: 'unverified',
      invalid: false,
      validated: false
    }
  },
  components: {
    logo: Logo
  },
  props: {
    sig: Object, // untrusted, passed in
    sigmeta: Object, // trusted, from sigreq
    sigReqH: String // trusted, from sigreq
  },
  mounted() {
    // verify sig is correct
    this.name = this.sig.name
    if (Object.keys(this.sigmeta).length === 0) {
      this.invalid = true
      return
    }
    this.verifier = this.sigmeta.verifier
    this.verifierid = this.sigmeta.verifierId
    // check if sig matches meta
    var sigmetaAddr = this.sigmeta.address
    var sigData = JSON.parse(JSON.stringify(this.sig))
    delete sigData.signature
    var self = this
    var interval = setInterval(function() {
      if (window.web3) {
        clearInterval(interval)
      } else {
        return
      }
      window.web3.personal.ecRecover(JSON.stringify(sigData), self.sig.signature, function(err, res) {
        if (err) {
          self.invalid = true
          console.error('could not ecrecover, error:', err)
        } else if (res.toLowerCase() !== sigmetaAddr.toLowerCase()) {
          self.invalid = true
          console.error(`invalid signature, expected ${sigmetaAddr}, got ${res}`)
        } else {
          self.invalid = false
        }
        self.validated = true
        return
      })
    }, 50)
    // check if sigReqH matches sig
  }
}
</script>

<style scoped>
.unvalidated {
  border: solid gray 2px !important;
}
.signature-container.invalid {
  border: solid red 2px;
}
.signature-container {
  padding: 5px 5px 5px 5px;
  border: solid #1976d2 2px;
  border-radius: 10px;
  overflow: hidden;
  min-width: 100px;
}
#signature-text {
  font-family: 'Homemade Apple';
  margin-bottom: -10px;
  padding: 5px 5px 5px 5px;
  font-size: 20px;
}
#small-text {
  font-size: 8px;
}
.no-margin-padding {
  margin: 0 0 0 0;
  padding: 0 0 0 0;
}
@font-face {
  font-family: 'Homemade Apple';
  font-style: normal;
  font-weight: 400;
  src: local('Homemade Apple Regular'), local('HomemadeApple-Regular'),
    url(https://fonts.gstatic.com/s/homemadeapple/v10/Qw3EZQFXECDrI2q789EKQZJob0x6XHgOiJM6.woff2) format('woff2');
  unicode-range: U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212,
    U+2215, U+FEFF, U+FFFD;
}
</style>
