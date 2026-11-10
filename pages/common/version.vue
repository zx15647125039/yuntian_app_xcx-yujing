<template>
  <view class="template-version">
    <tn-nav-bar 
      fixed 
      customBack 
      backgroundColor="transparent" 
      :bottomShadow="false"
      :border="false"
    >
      <view slot="back" class='tn-custom-nav-bar__back' @click="goBack">
        <text class='tn-icon-left'></text>
      </view>
    </tn-nav-bar>

    <view class="container">
      <view class="brand-wrapper tn-flex-direction-column tn-flex-col-center">
        <view class="brand-info tn-text-center">
          <view class="brand-title">云天学院</view>
        </view>

        <view class="logo-outer-circle tn-margin-top-xl">
          <view class="logo-mid-circle">
            <view class="logo-inner-slot">
              <image 
                src='https://ytzy-college-img.oss-cn-wulanchabu.aliyuncs.com/wximg/index/log1.jpg' 
                mode='aspectFill' 
                class="logo-img"
              ></image>
            </view>
          </view>
        </view>

        <view class="ver-status-badge tn-margin-top-xl">
          <view class="pulse-dot"></view>
          <text>当前版本 v{{ currentVersion }}</text>
        </view>
      </view>

      <view class="log-section tn-margin-top-xl animate-fade-up">
        <view class="section-title tn-flex tn-flex-col-center tn-margin-bottom-lg">
          <view class="title-bar"></view>
          <text class="tn-text-bold tn-text-lg tn-margin-left-sm">最新动态</text>
          <text class="update-time tn-margin-left-auto">{{ versionData.createTime }}</text>
        </view>

        <view class="neu-card-content">
          <view class="card-header tn-flex tn-flex-row-between tn-flex-col-center">
            <view class="ver-label">
              <text class="v-text">v</text>
              <text class="n-text">{{ versionData.version || '---' }}</text>
            </view>
            <view class="tag-new">LATEST</view>
          </view>
          
          <view class="divider-line"></view>
          
          <view class="log-body">
            <text class="log-text" style="white-space: pre-wrap; display: block;">{{ versionData.content || '正在加载更新内容...' }}</text>
          </view>
        </view>
      </view>

      <view class="footer-section tn-text-center">
        <view class="slogan">让低空飞行更简单</view>
        <view class="copyright">Copyright © 2026 All Rights Reserved</view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentVersion: '', // 存储本机安装的版本
      versionData: {
        version: '', // 存储服务器返回的最新版本
        content: '',
        createTime: ''
      }
    }
  },
  onLoad() {
    this.getSystemVersion(); // 获取本机版本
    this.fetchLatestInfo();  // 获取线上版本
  },
  methods: {
    /**
     * 获取当前 App 安装的版本号
     */
    getSystemVersion() {
      // #ifdef APP-PLUS
      // 仅在 App 环境下有效
      this.currentVersion = plus.runtime.version;
      // #endif
      
      // 如果是在开发工具或其他环境，尝试 uniapp 标准 API
      if (!this.currentVersion) {
        const res = uni.getAppBaseInfo ? uni.getAppBaseInfo() : uni.getSystemInfoSync();
        this.currentVersion = res.appVersion || '1.0.0';
      }
    },

    /**
     * 获取服务器上的最新版本信息
     */
    async fetchLatestInfo() {
      try {
        const params = {
          appId: 'wx0485359fffbe84b6',
          current: 1,
          size: 1
        };
        const res = await this.$api.getAppVersionList(params); 
        if (res?.data?.code === 200 && res.data.data.records?.length > 0) {
          const latest = res.data.data.records[0];
          this.versionData = {
            version: latest.versionNumber,
            content: this.formatUpdateContent(latest.updateContent),
            createTime: latest.releaseDate ? latest.releaseDate.split(' ')[0] : ''
          };
        }
      } catch (e) {
        console.error("加载失败", e);
      }
    },

    /**
     * 清洗 HTML 标签
     */
    formatUpdateContent(htmlStr) {
      if (!htmlStr) return "";
      let text = htmlStr
        .replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"')
        .replace(/&amp;/g, '&').replace(/&nbsp;/g, ' ');
      text = text.replace(/style\s*=\s*".*?"/gi, '');
      text = text.replace(/<\/div>/g, '\n').replace(/<\/li>/g, '\n').replace(/<br\s*\/?>/g, '\n');
      text = text.replace(/<[^>]+>/g, '');
      return text.trim().replace(/\n\s*\n/g, '\n');
    },

    goBack() {
      uni.navigateBack();
    }
  }
}
</script>

<style lang="scss" scoped>
.template-version {
  background-color: #EBECF0;
  min-height: 100vh;
  color: #394963;
}

.container { 
  padding: 160rpx 50rpx 60rpx; 
}

/* 回退按钮：拟态圆形风格 */
.tn-custom-nav-bar__back {
  width: 70rpx; 
  height: 70rpx; 
  background-color: #EBECF0; 
  border-radius: 50%;
  display: flex; 
  align-items: center; 
  justify-content: center;
  box-shadow: -4rpx -4rpx 8rpx #FFFFFF, 4rpx 4rpx 8rpx #BABECC;
  margin-left: 30rpx;
  margin-top: 10rpx;
}

.brand-wrapper { 
  display: flex;
  flex-direction: column;
  align-items: center;
}

.brand-title {
  font-size: 52rpx; font-weight: 900; color: #333;
  letter-spacing: 6rpx; text-shadow: 2rpx 2rpx 4rpx rgba(0,0,0,0.05);
}

.brand-subtitle {
  font-size: 18rpx; color: #BABECC; letter-spacing: 8rpx;
  text-transform: uppercase; margin-top: 4rpx;
}

.logo-outer-circle {
  width: 240rpx; height: 240rpx;
  background-color: #EBECF0;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 18rpx 18rpx 36rpx #BABECC, -18rpx -18rpx 36rpx #FFFFFF;
}

.logo-mid-circle {
  width: 180rpx; height: 180rpx;
  background-color: #EBECF0;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: 6rpx 6rpx 12rpx #BABECC, -6rpx -6rpx 12rpx #FFFFFF;
}

.logo-inner-slot {
  width: 130rpx; height: 130rpx;
  background-color: #EBECF0;
  border-radius: 50%;
  display: flex; align-items: center; justify-content: center;
  box-shadow: inset 8rpx 8rpx 16rpx #BABECC, inset -8rpx -8rpx 16rpx #FFFFFF;
  
  .logo-img {
    width: 110rpx; height: 110rpx;
    border-radius: 50%;
  }
}

.ver-status-badge {
  display: inline-flex; align-items: center;
  padding: 12rpx 36rpx; border-radius: 40rpx;
  background-color: #EBECF0;
  box-shadow: inset 4rpx 4rpx 8rpx #BABECC, inset -4rpx -4rpx 8rpx #FFFFFF;
  font-size: 24rpx; color: #888;
  
  .pulse-dot {
    width: 12rpx; height: 12rpx; border-radius: 50%;
    background-color: #07c160; margin-right: 14rpx;
    animation: pulse 2s infinite;
  }
}

.section-title {
  .title-bar { width: 10rpx; height: 32rpx; background-color: #2979FF; border-radius: 10rpx; }
  .update-time { font-size: 24rpx; color: #BABECC; }
}

.neu-card-content {
  background-color: #EBECF0;
  padding: 40rpx; border-radius: 50rpx;
  box-shadow: 12rpx 12rpx 24rpx #BABECC, -12rpx -12rpx 24rpx #FFFFFF;
  
  .card-header {
    .ver-label {
      display: flex; align-items: baseline;
      .v-text { font-size: 28rpx; color: #2979FF; font-weight: bold; }
      .n-text { font-size: 42rpx; color: #2979FF; font-weight: bold; margin-left: 4rpx; }
    }
    .tag-new {
      font-size: 18rpx; background: #2979FF; color: #fff;
      padding: 4rpx 14rpx; border-radius: 8rpx; font-weight: bold;
    }
  }
  
  .divider-line { height: 2rpx; background: rgba(0,0,0,0.05); margin: 30rpx 0; }
  .log-text { line-height: 1.8; font-size: 28rpx; color: #555; }
}

.footer-section {
  position: fixed; bottom: 80rpx; left: 0; width: 100%;
  .slogan { font-size: 26rpx; font-weight: bold; color: #BABECC; letter-spacing: 2rpx; }
  .copyright { font-size: 20rpx; color: #D1D9E6; margin-top: 10rpx; }
}

@keyframes pulse {
  0% { transform: scale(0.9); opacity: 0.7; }
  50% { transform: scale(1.1); opacity: 1; }
  100% { transform: scale(0.9); opacity: 0.7; }
}

.animate-fade-up { animation: fadeUp 0.8s ease-out; }
@keyframes fadeUp {
  from { opacity: 0; transform: translateY(40rpx); }
  to { opacity: 1; transform: translateY(0); }
}
</style>