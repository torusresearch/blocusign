<template>
  <div class="about">
        <!-- <iframe src="/Users/zhen/torus/blocusign/src/assets/sample.pdf" width="100%" height="500px" ></iframe>  -->
        <!-- <embed src="./sample.pdf" type="application/pdf" width="600" height="500" alt="pdf" pluginspage="http://www.adobe.com/products/acrobat/readstep2.html"> -->
  <!-- <pdf src="./sample.pdf"></pdf> -->

  <!-- <pdf :src="pdfLink" :page="1">
    <template slot="loading">
      loading content here...
    </template>
  </pdf> -->

   <!-- <file-upload
    ref="upload"
    v-model="files"
    post-action="/post.method"
    put-action="/put.method"
    @input-file="inputFile"
    @input-filter="inputFilter"
  >
  Upload file
  </file-upload>
  <button v-show="!$refs.upload || !$refs.upload.active" @click.prevent="$refs.upload.active = true" type="button">Start upload</button>
  <button v-show="$refs.upload && $refs.upload.active" @click.prevent="$refs.upload.active = false" type="button">Stop upload</button> -->


<!-- <div class="example-drag">
    <div class="upload">
      <ul v-if="files.length">
        <li v-for="(file) in files" :key="file.id">
          <span>{{file.name}}</span> -
          <span>{{file.size | formatSize}}</span> -
          <span v-if="file.error">{{file.error}}</span>
          <span v-else-if="file.success">success</span>
          <span v-else-if="file.active">active</span>
          <span v-else></span>
          <pdf :src="file.name" :page="1">
            <template slot="loading">
              loading content here...
            </template>
          </pdf>
        </li>
      </ul>
      <ul v-else>
        <td colspan="7">
          <div class="text-center p-5">
            <h4>Drop files anywhere to upload<br/>or</h4>
            <label for="file" class="btn btn-lg btn-primary">Select Files</label>
          </div>
        </td>
      </ul>

      <div v-show="$refs.upload && $refs.upload.dropActive" class="drop-active">
        <h3>Drop files to upload</h3>
      </div>

      <div class="example-btn">
        <file-upload
          class="btn btn-primary"
          post-action="/upload/post"
          :multiple="false"
          :drop="true"
          :drop-directory="true"
          v-model="files"
          :custom-action="hashAndSign"
          ref="upload"
          @input-filter="inputFilter">
          <i class="fa fa-plus"></i>
          Select files
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
  </div> -->

  <form action="/file-upload" class="dropzone">
    <div class="fallback">
      <input name="file" type="pdf" multiple />
    </div>
  </form>

  </div>
</template>

<script>
import pdf from 'pdfvuer'
import FileUpload from 'vue-upload-component'
import pdf2base64 from 'pdf-to-base64'
import sha256 from 'js-sha256'

export default {
  data() {
    var link = require('../assets/sample.pdf')
    pdf2base64(link)
    .then(
        (response) => {
            console.log("base64: " + response) //cGF0aC90by9maWxlLmpwZw==
    var hash = sha256.create()
   hash.update(response)
    console.log("sha256: " + hash.hex())
         
        }
    )
    .catch(
        (error) => {
            console.log(error) //Exepection error....
        }
    )


    return {
       pdfLink : link,
       files: []
    }
  },
  components: {
    pdf,
    FileUpload
  },
  methods: {
    /**
     * Has changed
     * @param  Object|undefined   newFile   Read only
     * @param  Object|undefined   oldFile   Read only
     * @return undefined
     */
    inputFile: function (newFile, oldFile) {
      if (newFile && oldFile && !newFile.active && oldFile.active) {
        // Get response data
        console.log('response', newFile.response)
        if (newFile.xhr) {
          //  Get the response status code
          console.log('status', newFile.xhr.status)
        }
      }
    },
    /**
     * Pretreatment
     * @param  Object|undefined   newFile   Read and write
     * @param  Object|undefined   oldFile   Read only
     * @param  Function           prevent   Prevent changing
     * @return undefined
     */
    inputFilter: function (newFile, oldFile, prevent) {
      if (newFile && !oldFile) {
        // Filter non-image file
        if (!/\.(pdf)$/i.test(newFile.name)) {
          return prevent()
        }
      }

      // Create a blob field
      newFile.blob = ''
      let URL = window.URL || window.webkitURL
      if (URL && URL.createObjectURL) {
        newFile.blob = URL.createObjectURL(newFile.file)
      }
    },
    hashAndSign: async function (file, component) {
      console.log(file.name)
    var serializedPDF = await pdf2base64(file.name)
    console.log("base64: " + serializedPDF) 
    var hash = sha256.create()
    hash.update(serializedPDF)
    console.log("sha256: " + hash.hex())
    // return await component.uploadPut(file)
    return await component.uploadHtml4(file)
    }
  }
}
</script>

<style>
.example-drag label.btn {
  margin-bottom: 0;
  margin-right: 1rem;
}
.example-drag .drop-active {
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
.example-drag .drop-active h3 {
  margin: -.5em 0 0;
  position: absolute;
  top: 50%;
  left: 0;
  right: 0;
  -webkit-transform: translateY(-50%);
  -ms-transform: translateY(-50%);
  transform: translateY(-50%);
  font-size: 40px;
  color: #fff;
  padding: 0;
}

</style>