<template>
  <v-container fluid class="about">
    <v-stepper>
      <template>
        <v-stepper-header>
          <template v-for="step in steps">
            <v-stepper-step
              :key="`${step}`"
              :complete="currentStep >= steps.indexOf(step)"
              :editable="currentStep == steps.indexOf(step)"
              :step="steps.indexOf(step) + 1"
            >
              {{ step }}
            </v-stepper-step>
            <v-divider :key="`${step}-divider`"></v-divider>
          </template>
        </v-stepper-header>
      </template>
    </v-stepper>
    <v-row justify="center" class="upload">
      <template v-if="files.length">
        <v-col cols="12" v-for="file in files" :key="file.id" align="center">
          <span>{{ file.name }}</span> - <span>{{ responseIPFSHash }}</span> -
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
          name="contract"
          extensions="pdf"
        >
          <v-btn
            v-if="
              typeof responseIPFSHash === 'string' &&
                responseIPFSHash.length === 0
            "
            type="button"
            name="contract"
            extensions="pdf"
            class="btn btn-success"
          >
            Select Files
          </v-btn>
        </file-upload>
      </v-col>
    </v-row>
    <v-row class="upload" v-if="files.length > 0 && this.currentStep === 0">
      <v-col align="center" cols="12">
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
          Stop Upload
        </v-btn>
      </v-col>
    </v-row>
    <v-row justify="center" align="center" wrap v-if="currentStep === 1">
      <v-col cols="4" align="center">
        <v-text-field
          align="center"
          v-on:keyup.enter="setRecipient(email)"
          v-model="email"
          placeholder="Enter recipient email e.g. hello@tor.us"
        />
      </v-col>
      <v-col cols="2" align="center">
        <v-btn
          align="center"
          type="button"
          class="btn btn-success"
          v-on:click="setRecipient(email)"
        >
          Submit
        </v-btn>
        <v-btn
          type="button"
          class="btn btn-success"
          v-on:click="signAndRequest()"
        >
          <i class="fa fa-arrow-up" aria-hidden="true"></i>
          Sign
        </v-btn>
      </v-col>
    </v-row>
    <v-row justify="center" align="center" v-if="currentStep === 0">
      <v-col align="center" sm="10">
        <canvas id="pdfViewer"></canvas>
      </v-col>
    </v-row>
    <v-row align="center" v-if="currentStep === 0">
      <v-col sm="4" align="center">
        <v-btn :hidden="files.length === 0" v-on:click="prevPage()">&lt;</v-btn>
      </v-col>
      <v-col sm="4" align="center">
        <h4 id="page-num" :hidden="files.length === 0">0</h4>
      </v-col>
      <v-col sm="4" align="center">
        <v-btn :hidden="files.length === 0" v-on:click="nextPage()">&gt;</v-btn>
      </v-col>
    </v-row>
  </v-container>
</template>

<script>
import pdfjsLib from "pdfjs-dist"
import FileUpload from "vue-upload-component"
import * as Promise from "bluebird"
var personalSign = Promise.promisify(window.torus.web3.personal.sign)

export default {
  data() {
    return {
      email: "",
      steps: ["Upload", "Send", "Sign", "Verify"],
      currentStep: 0,
      previousFileSize: 0,
      responseIPFSHash: "",
      files: [],
      pdfDoc: null,
      pageNum: 1,
      pageRendering: false,
      pageNumPending: null,
      scale: 1.0,
      canvas: null,
      ctx: null,
      recipient: ""
    }
  },
  components: {
    FileUpload
  },
  mounted() {
    this.canvas = document.getElementById("pdfViewer")
    this.ctx = this.canvas.getContext("2d")
    window.ASDF = this
  },
  watch: {
    files: {
      handler(fileUploaderFiles) {
        if (fileUploaderFiles.length === 0) {
          return
        }
        var fileUpload = fileUploaderFiles[0]
        var file = fileUpload.file
        this.responseIPFSHash = fileUpload.response
        var self = this
        if (typeof fileUpload.response === "string") {
          self.currentStep = self.steps.indexOf("Send")
        }
        var fileReader = new FileReader()
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
        if (this.previousFileSize === file.size) {
          return
        }
        this.previousFileSize = file.size
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
    /**
     * Signs and request based on the hash
     */
    signAndRequest: async function() {
      console.log("this is ", this)
      // validation checks
      if (this.responseIPFSHash == "") {
        console.log("error, cant sign and request, no responseIPFSHash")
        return
      }

      if (this.recipient == "") {
        console.log("error, cant sign and request, no recipeient")
        return
      }

      // get sender details
      var myHeaders = new Headers()
      var senderInfo = await window.torus.getUserInfo()
      myHeaders.append("Content-Type", "application/json")
      var raw = JSON.stringify({
        jsonrpc: "2.0",
        method: "VerifierLookupRequest",
        id: 10,
        params: {
          verifier: senderInfo.verifier,
          verifier_id: senderInfo.verifierId
        }
      })
      var requestOptions = {
        method: "POST",
        headers: myHeaders,
        body: raw,
        redirect: "follow"
      }
      var response = await fetch(
        "https://torus-18.torusnode.com/jrpc",
        requestOptions
      )
      var jsonText = await response.text()
      var senderDetails = JSON.parse(jsonText)

      // get recipient details
      await window.torus.getPublicAddress({
        verifier: "google",
        verifierId: this.recipient
      })
      var raw2 = JSON.stringify({
        jsonrpc: "2.0",
        method: "VerifierLookupRequest",
        id: 10,
        params: { verifier: "google", verifier_id: this.recipient }
      })
      var requestOptions2 = {
        method: "POST",
        headers: myHeaders,
        body: raw2,
        redirect: "follow"
      }
      var response2 = await fetch(
        "https://torus-18.torusnode.com/jrpc",
        requestOptions2
      )
      var jsonText2 = await response2.text()
      var recipientDetails = JSON.parse(jsonText2)
      // create signing request object
      var signingRequest = {
        timeRequested: Date.Now,
        documentHash: this.responseIPFSHash,
        recipients: [
          {
            address: senderDetails.result.keys[0].address,
            verifierId: senderInfo.verifierId,
            verifier: senderInfo.verifier
          },
          {
            address: recipientDetails.result.keys[0].address,
            verifierId: this.recipient,
            verifier: "google"
          }
        ]
      }
      console.log(signingRequest)
  
      var signature = await personalSign(
        JSON.stringify(signingRequest),
        window.torus.web3.eth.accounts[0],
        )

      console.log(signature)

      //submit to ipfs here

    },
    /**
     * Get receipient
     */
    setRecipient(val) {
      this.recipient = val
    }
  }
}
</script>

<style>
#pdfViewer {
  width: 100%;
  height: 100%;
}
</style>
