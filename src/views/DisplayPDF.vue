<template>
  <v-container fluid class="display-pdf">
    <v-row justify="center" align="center">
      <v-col cols="12" justify="center" align="center">
        <v-input v-model="pdfipfs"/><v-btn v-on:click="showPDF()">load PDF</v-btn><hr>
      </v-col>
      <v-col cols="12" justify="center" align="center">
        <v-btn v-on:click="showSig()">sosig</v-btn><hr>
      </v-col>
      <v-col v-if="sigDisplay" cols="12" justify="center" align="center">
        <signature :verifier="verifier" :verifierid="verifierid" :name="name"></signature>
      </v-col>
      <v-col cols="12" justify="center" align="center">
        <canvas id="pdfViewer"></canvas>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
const pdfjs = require('pdfjs-dist')
import Signature from '../components/Signature.vue'
export default {
  data() {
    return {
      pdfipfs: 'QmbbLW8EPukkpmXiyt8EfrVHKsKJSvbVsaNAewRrdiv82D',
      sigDisplay: false,
      verifier: "facebook",
      verifierid: "23423231",
      name: "Leonard Tan"
    }
  },
  components: {
    signature: Signature,
  },
  methods: {
    showSig: function() {
      this.sigDisplay = !this.sigDisplay
    },
    showPDF: function() {
      console.log(this.pdfipfs)
      fetch("https://ipfs.io/ipfs/" + this.pdfipfs).then(resp => resp.blob())
      .then(blob => {
        var objectURL = URL.createObjectURL(blob)
        pdfjs.getDocument(objectURL).then(pdf => {
          console.log("the pdf has ", pdf.numPages, " pages")
          return pdf.getPage(1)
        }).then(page => {
          var viewport = page.getViewport(2.0)
            var canvas = document.getElementById("pdfViewer")
            console.log(viewport)
            canvas.height = viewport.height
            canvas.width = viewport.width

            page.render({
              canvasContext: canvas.getContext('2d'),
              viewport: viewport
            })
        })
      })
      .catch(console.error)
    }
  }
}
</script>