<template>
  <v-container fluid class="display-pdf">
    <v-row justify="center" align="center" wrap>
      <v-col v-for="sig in sigs" :key="JSON.stringify(sig)" cols="3" justify="center" align="center">
        <signature :sigReqH="sigReqH" :sigmeta="getSigMetadata(sig)" :sig="sig"></signature>
      </v-col>
    </v-row>
    <v-row justify="center" align="center" wrap>
      <v-col align="center" cols="10">
        <canvas id="pdfViewer"></canvas>
      </v-col>
    </v-row>
    <v-row align="center" justify="center" wrap>
      <v-col cols="4" justify="center" align="center">
        <v-btn :hidden="!initialLoad"  v-on:click="prevPage()">&lt;</v-btn>
      </v-col>
      <v-col cols="4" justify="center" align="center">
        <h4 :hidden="!initialLoad"  id="page-num" >{{pageNum}}</h4>
      </v-col>
      <v-col cols="4" justify="center" align="center">
        <v-btn :hidden="!initialLoad" v-on:click="nextPage()">&gt;</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>
<script>
import Signature from '../components/Signature.vue'
import pdfjsLib from "pdfjs-dist"
export default {
  data() {
    return {
      pdfH: '',
      pdfURL: '',
      initialLoad: false,
      verifier: "facebook",
      verifierid: "23423231",
      name: "Leonard Tan",
      sigReq: {},
      sigReqH: "",
      sigs: [],
      sigsH: [""],
      pdfDoc: null,
      pageNum: 1,
      pageRendering: false,
      pageNumPending: null,
      scale: 1.0,
      canvas: null,
      ctx: null,
    }
  },
  components: {
    signature: Signature,
  },
  mounted() {
    window.FF = this
    this.canvas = document.getElementById("pdfViewer")
    this.ctx = this.canvas.getContext("2d")
    this.sigReqH = this.$route.query.sigReqH || this.sigReqH
    if (this.sigReqH !== "") {
      var self = this
      fetch("https://ipfs.io/ipfs/" + this.sigReqH).then(resp => resp.json())
      .then(json => {
        self.sigReq = json
        if (json.documentHash) {
          self.pdfH = json.documentHash
        }
      })
    }
    this.sigsH = this.$route.query.sigsH ? this.$route.query.sigsH.split(",").filter(sig => sig !== "") : this.sigsH
    if (this.sigsH.length > 0) {
      for (var i = 0; i < this.sigsH.length; i++) {
        (function(i) {
          fetch("https://ipfs.io/ipfs/" + self.sigsH[i]).then(resp => resp.json())
          .then(json => {
            self.sigs[i] = json
          })
        })(i)
      }
    }
  },
  watch: {
    pdfH: {
      handler(pdfH) {
        var self = this
        fetch("https://ipfs.io/ipfs/" + pdfH).then(resp => resp.blob())
        .then(blob => {
          self.pdfURL = URL.createObjectURL(blob)
        })
      }
    },
    pdfURL: {
      handler(pdfURL) {
        var self = this
        pdfjsLib.getDocument(pdfURL).then(pdf => {
            self.updatePDF(pdf)
            console.log("the pdf has ", pdf.numPages, "page(s).")
            self.renderPage(self.pageNum, true)
          })
      }
    }
  },
  methods: {
    getSigMetadata(sig) {
      if (this.sigReq.recipients === undefined || this.sigReq.recipients.length === 0) {
        return {}
      }
      if (!sig.address) {
        return {}
      }
      var foundSigMetadata = {}
      this.sigReq.recipients.map(recipient => {
        if (recipient.address.toLowerCase() === sig.address.toLowerCase()) {
          foundSigMetadata = recipient
        }
      })
      return foundSigMetadata
    },
    /**
     * Update pdf to Viewer data
     */
    updatePDF(pdfDoc) {
      this.pdfDoc = pdfDoc
    },
    /**
     * Get page info from document, resize canvas accordingly, and render page.
     * @param num Page number.
     */
    renderPage(num, initial) {
      this.pageRendering = true
      // Using promise to fetch the page
      this.pdfDoc.getPage(num).then(page => {
        var viewport = page.getViewport({ scale: this.scale })
        this.canvas.height = viewport.height
        this.canvas.width = viewport.width

        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: this.ctx,
          viewport: viewport
        }
        var renderTask = page.render(renderContext)

        // Wait for rendering to finish
        renderTask.promise.then(() => {
          if (initial) {
            this.initialLoad = true
          }
          this.pageRendering = false
          if (this.pageNumPending !== null) {
            // New page rendering is pending
            this.renderPage(this.pageNumPending)
            this.pageNumPending = null
          }
        })
      })

      // Update page counters
      document.getElementById("page-num").textContent = num
    },
    /**
     * If another page rendering in progress, waits until the rendering is
     * finised. Otherwise, executes rendering immediately.
     */
    queueRenderPage(num) {
      if (this.pageRendering) {
        this.pageNumPending = num
      } else {
        this.renderPage(num)
      }
    },
    /**
     * Displays previous page.
     */
    prevPage() {
      if (this.pageNum <= 1) {
        return
      }
      this.pageNum--
      this.queueRenderPage(this.pageNum)
    },
    /**
     * Displays next page.
     */
    nextPage() {
      if (this.pageNum >= this.pdfDoc.numPages) {
        return
      }
      this.pageNum++
      this.queueRenderPage(this.pageNum)
    },
  }
}
</script>

<style>
#pdfViewer {
  width: 100%;
  height: 100%;
}
</style>