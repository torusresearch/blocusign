<template>
  <v-container fluid class="about">
    <v-row justify="center" class="upload">
      <template v-if="files.length">
        <v-col cols="12" v-for="file in files" :key="file.id" align="center">
          <span>{{ file.name }}</span> - <span>{{ file.size }}</span> -
          <span v-if="file.error">{{ file.error }}</span>
          <span v-else-if="file.success">success</span>
          <span v-else-if="file.active">active</span>
        </v-col>
      </template>
      <template v-else>
        <v-col cols="12" align="center">
          <h4>Drop files anywhere to upload, or...</h4>
        </v-col>
      </template>
    </v-row>

    <v-row justify="center" wrap>
      <v-col cols="12" align="center">
        <file-upload
          post-action="/upload/post"
          :multiple="false"
          :drop="true"
          :drop-directory="true"
          v-model="files"
          ref="upload"
        >
          <v-btn type="button"
          name="contract"
          extensions="pdf"
          class="btn btn-success">
            Select Files
          </v-btn>
        </file-upload>
      </v-col>
    </v-row>
    <v-row align="center">
      <canvas id="pdfViewer"></canvas>
    </v-row>
    <v-row align="center">
      <v-col sm="4" align="center">
        <v-btn v-on:click="prevPage()">&lt;</v-btn>
      </v-col>
      <v-col sm="4" align="center">
        <h4 id="page-num">0</h4>
      </v-col>
      <v-col sm="4" align="center">
        <v-btn v-on:click="nextPage()">&gt;</v-btn>
      </v-col>
    </v-row>
    <v-row class="upload">
      <v-col align="center">
        <v-btn
          type="button"
          class="btn btn-success"
          v-if="!$refs.upload || !$refs.upload.active"
          @click.prevent="$refs.upload.active = true"
        >
          <i class="fa fa-arrow-up" aria-hidden="true"></i>
          Start Upload
        </v-btn>
        <v-btn
          type="button"
          class="btn btn-danger"
          v-else
          @click.prevent="$refs.upload.active = false"
        >
          <i class="fa fa-stop" aria-hidden="true"></i>
          Stop Upload
        </v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import pdfjsLib from "pdfjs-dist"
import FileUpload from "vue-upload-component"

export default {
  data() {
    return {
      files: [],
      pdfDoc: null,
      pageNum: 1,
      pageRendering: false,
      pageNumPending: null,
      scale: 1.0,
      canvas: null,
      ctx: null
    }
  },
  components: {
    FileUpload
  },
  mounted() {
    this.canvas = document.getElementById("pdfViewer")
    this.ctx = this.canvas.getContext("2d")
  },
  watch: {
    files: {
      handler(fileUploaderFiles) {
        var file = fileUploaderFiles[0].file
        var fileReader = new FileReader()
        var self = this
        fileReader.onload = function() {
          var typedarray = new Uint8Array(this.result)
          pdfjsLib.getDocument(typedarray).then(pdf => {
            self.updatePDF(pdf)
            console.log("the pdf has ", pdf.numPages, "page(s).")
            // pdf.getData().then((data) => {
            //   console.log(data.length)
            //   // var hash = web3.sha3('0x'+Buffer.from(data).toString('hex'))
            //   // console.log('hash', hash)
            //   // web3.eth.sign(web3.eth.accounts[0], hash, console.log)
            // })
            self.queueRenderPage(self.pageNum)
          })
        }

        fileReader.readAsArrayBuffer(file)
        return
      },
      deep: true
    }
  },
  methods: {
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
    renderPage(num) {
      this.pageRendering = true
      console.log(this.canvas)
      // Using promise to fetch the page
      this.pdfDoc.getPage(num).then(page => {
        var viewport = page.getViewport({ scale: this.scale })
        this.canvas.height = viewport.height
        console.log("WT2F")
        this.canvas.width = viewport.width

        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: this.ctx,
          viewport: viewport
        }
        var renderTask = page.render(renderContext)

        // Wait for rendering to finish
        renderTask.promise.then(() => {
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
    }
  }
}
</script>
