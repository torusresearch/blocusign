import Vue from "vue"
import VueRouter from "vue-router"
import Home from "../views/Home.vue"
import UploadPDF from "../views/UploadPDF.vue"
import DisplayPDF from "../views/DisplayPDF.vue"

Vue.use(VueRouter)

const routes = [
  {
    path: "/",
    name: "Home",
    component: Home
  },
  {
    path: "/upload",
    name: "UploadPDF",
    component: UploadPDF
  },
  {
    path: "/display",
    name: "DisplayPDF",
    component: DisplayPDF
  }
]

const router = new VueRouter({
  mode: "history",
  base: process.env.BASE_URL,
  routes
})

export default router
