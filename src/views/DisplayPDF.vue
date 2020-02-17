<template>
  <div class="display-pdf">
    <input v-model="pdfipfs"/><button v-on:click="showPDF()">load PDF</button><hr>
    <canvas id="pdfViewer"></canvas>
  </div>
</template>
<script>
const pdfjs = require('pdfjs-dist')
export default {
  data() {
    return {
      pdfipfs: 'QmbbLW8EPukkpmXiyt8EfrVHKsKJSvbVsaNAewRrdiv82D',
    }
  },
  methods: {
    showPDF: function() {
      console.log(this.pdfipfs)
      fetch("https://ipfs.io/ipfs/" + this.pdfipfs).then(resp => resp.blob())
      .then(blob => {
        var objectURL = URL.createObjectURL(blob)
        pdfjs.getDocument(objectURL).then(pdf => {
          console.log("the pdf has ", pdf.numPages, " pages")
          window.pdf = pdf
          return pdf.getPage(1)
        }).then(page => {
          var viewport = page.getViewport(2.0)
            var canvas = document.getElementById("pdfViewer")
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