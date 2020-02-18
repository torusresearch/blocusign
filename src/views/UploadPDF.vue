<template>
  <div class="about">

<div class="drag">
    <div class="upload">
      <div v-if="files.length">
        <div v-for="(file) in files" :key="file.id">
          <span>{{file.name}}</span> -
          <span>{{file.size}}</span> -
          <span v-if="file.error">{{file.error}}</span>
          <span v-else-if="file.success">success</span>
          <span v-else-if="file.active">active</span>
        </div>
      </div>
      <div v-else>
        <td colspan="7">
          <div class="text-center p-5">
            <h4>Drop files anywhere to upload<br/>or</h4>
            <button for="file" class="btn btn-lg btn-primary">Select Files</button>
          </div>
        </td>
      </div>

      <div v-show="$refs.upload && $refs.upload.dropActive" class="drop-active">
        <h3>Drop files to upload</h3>
      </div>

      <canvas id="pdfViewer"></canvas>
      <div id="page-num"></div>

      <div class="upload-btn">
        <file-upload
          class="btn btn-primary"
          post-action="/upload/post"
          :multiple="false"
          :drop="true"
          :drop-directory="true"
          v-model="files"
          ref="upload"
          name="contract">
        </file-upload>
        <button type="button" class="btn btn-success" v-if="!$refs.upload || !$refs.upload.active" @click.prevent="$refs.upload.active = true">
          <i class="fa fa-arrow-up" aria-hidden="true"></i>
          Start Upload
        </button>
        <button type="button" class="btn btn-danger"  v-else @click.prevent="$refs.upload.active = false">
          <i class="fa fa-stop" aria-hidden="true"></i>
          Stop Upload
        </button>
      </div>
    </div>
  </div>

  </div>
</template>

<script>
import pdfjsLib from "pdfjs-dist"
import FileUpload from 'vue-upload-component'


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
      ctx: null,
    }
  },
  components: {
    FileUpload
  },
  mounted() {
    this.canvas = document.getElementById('pdfViewer')
    this.ctx = this.canvas.getContext('2d')
    console.log('MOUNTED', this.canvas, this.ctx)
  },
  watch: {
    files: {
      handler(fileUploaderFiles) {
        var file = fileUploaderFiles[0].file
        var fileReader = new FileReader()
        var self = this
        fileReader.onload = function() {
          var typedarray = new Uint8Array(this.result)
          pdfjsLib.getDocument(typedarray)
          .then(pdf => {
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
        var viewport = page.getViewport({ scale: this.scale, })
        this.canvas.height = viewport.height
        console.log('WT2F')
        this.canvas.width = viewport.width

        // Render PDF page into canvas context
        var renderContext = {
          canvasContext: this.ctx,
          viewport: viewport,
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
      document.getElementById('page-num').textContent = num
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
    onPrevPage() {
      if (this.pageNum <= 1) {
        return
      }
      this.pageNum--
      this.queueRenderPage(this.pageNum)
    },
    /**
     * Displays next page.
     */
    onNextPage() {
      if (this.pageNum >= this.pdfDoc.numPages) {
        return
      }
      this.pageNum++
      this.queueRenderPage(this.pageNum)
    }
  }
}
</script>

<style>
.drag label.btn {
  margin-bottom: 0;
  margin-right: 1rem;
}
.drag .drop-active {
  top: 0;
  bottom: 0;
  right: 0;
  left: 0;
  position: fixed;
  z-index: 9999;
  opacity: .6;
  text-align: center;
  background: #000;
}
.drag .drop-active h3 {
  margin: -.5em 0 0;
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  font-size: 40px;
  color: #fff;
  padding: 0;
}

</style>