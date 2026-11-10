import App from './App'
import store from './store'
import api from "./api/index.js";
import Vue from 'vue'
import bw from './libs/components/bw'
import zpMixins from './uni_modules/zp-mixins/index.js';
import { addPermisionInterceptor, removePermisionInterceptor } from './uni_modules/x-perm-apply-instr/js_sdk/index.js'
addPermisionInterceptor('chooseImage', '为了修改个人头像和发布信息图片视频等, 我们需要申请您设备的相机和存储权限')
addPermisionInterceptor('chooseVideo', '为了发布信息图片视频等, 我们需要申请您设备的相机和存储权限')
addPermisionInterceptor('saveImageToPhotosAlbum', '为了保存推广海报到手机相册, 我们需要申请您设备的存储权限')
addPermisionInterceptor('getLocation', '为了根据您的位置展示信息, 我们需要申请您设备的位置权限')
addPermisionInterceptor('makePhoneCall', '为了联系客服/用户/咨询等, 我们需要申请您设备的拨打电话权限')
addPermisionInterceptor('getRecorderManager', '为了使用语言消息功能等, 我们需要申请您设备的麦克风权限')
addPermisionInterceptor('startLocationUpdate', '为了根据您的位置展示信息, 我们需要申请您设备的位置权限')
addPermisionInterceptor('scanCode', '为了识别二维码信息, 我们需要申请您设备的相机权限')
Vue.use(bw)
Vue.config.productionTip = false
App.mpType = 'app'

// 引入全局TuniaoUI
import TuniaoUI from 'tuniao-ui'
Vue.use(TuniaoUI)
Vue.use(zpMixins);
Vue.prototype.$api = api;
Vue.prototype.$baseUrl = "https://www.ytxy.skysoph.com";
//Vue.prototype.$baseUrl = "http://192.168.1.77:10010";
// 引入TuniaoUI提供的vuex简写方法
let vuexStore = require('@/store/$t.mixin.js')
Vue.mixin(vuexStore)

// 引入TuniaoUI对小程序分享的mixin封装
let mpShare = require('tuniao-ui/libs/mixin/mpShare.js')
Vue.mixin(mpShare)
const app = new Vue({
  store,
zpMixins,
  ...App
})

app.$mount()