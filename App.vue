<script>
import Vue from "vue";
import store from "./store/index.js";
import updateCustomBarInfo from "./tuniao-ui/libs/function/updateCustomBarInfo.js";

export default {
  data() {
    return {
      screenHeight: 0,
      screenWidth: 0,
    };
  },

  onLaunch(options) {
    // --- 1. 推广解析：仅解析并存入缓存 ---
    this.handlePromotionParse(options);
    // --- 推广解析逻辑结束 ---

    // 原逻辑：重置体验计时
    uni.removeStorageSync('first_visit_time');
    
    // 原逻辑：获取自定义导航高度
    updateCustomBarInfo()
      .then((res) => {
        store.commit("$tStore", { name: "vuex_status_bar_height", value: res.statusBarHeight });
        store.commit("$tStore", { name: "vuex_custom_bar_height", value: res.customBarHeight });
      })
      .catch((err) => {
        console.warn("updateCustomBarInfo 失败", err);
      });
  },

  methods: {
    /**
     * 解析扫码推广参数
     * 职责：把二维码里的推荐人ID解析出来，存到缓存里给 login.vue 用
     */
    handlePromotionParse(options) {
      let scene = options.query?.scene;
	  
      if (scene) {
        scene = decodeURIComponent(scene);
        
        let finalId = '';
        // 兼容 r=123, u=123 或直接 123
        if (scene.includes('=')) {
          const params = {};
          scene.split('&').forEach(item => {
            const [key, value] = item.split('=');
            params[key] = value;
          });
          finalId = params.r || params.u || params.referrerUserId;
        } else {
          finalId = scene;
        }

        if (finalId) {
          // 统一存入 tempReferrerId，login.vue 会去这里取
          uni.setStorageSync('tempReferrerId', finalId);
        }
      }
    }
  }
};
</script>

<style lang="scss">
@import "./tuniao-ui/index.scss";
@import "./tuniao-ui/iconfont.css";
@import "./tuniao-ui/TnDouble.css";

page {
  background-color: #ebecf0;
  max-width: 750rpx;
  margin: 0 auto;
  overflow-x: hidden;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", "WenQuanYi Micro Hei", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.uni-toast {
  width: 200px;
}

.tn-icon-color {
  color: #ff7043;
}
</style>