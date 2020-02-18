import Vue from "vue"
import VueRouter from "vue-router"
import UploadPDF from "../views/UploadPDF.vue"

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    name: "UploadPDF",
    component: UploadPDF
  }
]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
})

export default router
