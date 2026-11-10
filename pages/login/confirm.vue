<template>
  <view class="template-confirm" :class="['theme-' + currentTheme]">
    <view class="container">
      
      <view class="auth-card neu-outset animate-fade-up">
        <view class="icon-section">
          <view class="icon-circle neu-inset">
            <text class="tn-icon-computer-fill theme-color-text"></text>
          </view>
        </view>
        <view class="text-section">
          <view class="title">调度终端登录确认</view>
          <view class="subtitle">观天下巡检调度指挥管理系统</view>
        </view>
      </view>

      <view class="info-card neu-outset animate-fade-up" style="animation-delay: 0.1s;">
        <view class="info-item tn-flex tn-flex-col-center">
          <text class="tn-icon-success-circle-fill tn-color-green"></text>
          <text class="tn-margin-left-sm">授权后将同步您的巡检处置主管执勤身份</text>
        </view>
        <view class="info-item tn-flex tn-flex-col-center tn-margin-top-sm">
          <text class="tn-icon-success-circle-fill tn-color-green"></text>
          <text class="tn-margin-left-sm">支持在线接收紧急工单与多源路径规划</text>
        </view>
      </view>

      <view class="action-section animate-fade-up" style="animation-delay: 0.2s;">
        <block v-if="isLoggedIn">
          <button class="confirm-btn theme-color-bg tn-color-white" @click="handleConfirm">
            确认授权登录
          </button>
          <view class="cancel-btn neu-outset" @click="handleCancel">
            取消
          </view>
        </block>
        <block v-else>
          <button class="confirm-btn theme-color-bg tn-color-white" @click="goToLogin">
            请先登录账号
          </button>
          <view class="tips-text">您尚未登录小程序，请登录后授权</view>
        </block>
      </view>

    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTheme: 'blue',
      scene: '', // PC端生成的UUID标识
      isLoggedIn: false
    }
  },
  onLoad(options) {
    // 1. 获取扫码传入的参数
    if (options.scene) {
      this.scene = decodeURIComponent(options.scene);
      console.log('[授权页] 收到场景值:', this.scene);
    }
  },
  onShow() {
    // 2. 每次回到页面时检查本地是否有 Token
    this.checkLoginStatus();
  },
  methods: {
    checkLoginStatus() {
      const token = uni.getStorageSync('token');
      this.isLoggedIn = !!token;
    },
    
    goToLogin() {
      uni.navigateTo({ url: '/pages/login/login' });
    },

    // confirm.vue
    
   async handleConfirm() {
     if (!this.scene) {
       uni.showToast({ title: '场景值已失效，请重新扫码', icon: 'none' });
       return;
     }
   
     uni.showLoading({ title: '安全授权中...', mask: true });
   
     try {
       // 1. 获取微信临时登录 code (必须在授权前获取)
       const [loginErr, loginRes] = await uni.login({
         provider: 'weixin'
       });
       
       if (loginErr || !loginRes.code) {
         throw new Error('获取微信凭证失败，请重试');
       }
   
       // 2. 调用后端绑定接口
       // 传入 PC 端扫码拿到的 sessionId 和 微信 code
       const res = await this.$api.bindWebLogin({
         sessionId: this.scene,
         code: loginRes.code
       });
   
       // 【关键调试】打印出原始返回，确认层级
       console.log('[授权返回数据调试]', res);
   
       // 3. 多层级数据解析逻辑
       // 兼容情况 A: res 直接就是业务数据 {code: 200, ...}
       // 兼容情况 B: res 是 UniApp 原始对象 {data: {code: 200, ...}, statusCode: 200}
       const result = (res && res.data) ? res.data : res;
   
       // 判断成功的条件：
       // 1. 业务 code 为 200 
       // 2. 或者 success 字段为 true
       // 3. 或者返回了“操作成功”的提示
       const isSuccess = result && (
         result.code === 200 || 
         result.success === true || 
         result.msg === '操作成功'
       );
   
       if (isSuccess) {
         // 4. 成功反馈与跳转
         uni.showToast({
           title: '电脑端登录成功',
           icon: 'success',
           duration: 1500
         });
         
         // 延迟跳转，让用户看清成功提示
         setTimeout(() => {
           uni.reLaunch({
             url: '/pages/index/index'
           });
         }, 1500);
         
       } else {
         // 5. 业务逻辑错误（如：场景值过期、code被占用）
         const errorMsg = result.msg || '授权解析失败，请重新扫码';
         throw new Error(errorMsg);
       }
   
     } catch (err) {
       // 6. 统一错误捕获
       console.error('[授权报错详情]', err);
       
       uni.showModal({
         title: '授权提示',
         content: err.message || '系统响应异常，请联系管理员',
         showCancel: false,
         confirmText: '我知道了',
         confirmColor: '#2979FF'
       });
     } finally {
       // 无论成功失败，都关闭 Loading
       uni.hideLoading();
     }
   },
    handleCancel() {
      uni.reLaunch({ url: '/pages/index/index' });
    }
  }
}
</script>

<style lang="scss" scoped>
.template-confirm {
  background-color: #EBECF0;
  min-height: 100vh;
  .container { padding: 60rpx; }
}

.theme-blue { --theme-color: #2979FF; }
.theme-color-text { color: var(--theme-color); }
.theme-color-bg { background-color: var(--theme-color); }

/* 拟态卡片共通 */
.neu-outset {
  background-color: #EBECF0;
  border-radius: 40rpx;
  box-shadow: 10rpx 10rpx 20rpx #BABECC, -10rpx -10rpx 20rpx #FFFFFF;
}
.neu-inset {
  background-color: #EBECF0;
  border-radius: 50%;
  box-shadow: inset 6rpx 6rpx 12rpx #BABECC, inset -6rpx -6rpx 12rpx #FFFFFF;
}

/* 授权主卡片 */
.auth-card {
  margin-top: 100rpx;
  padding: 80rpx 40rpx;
  text-align: center;
  .icon-section {
    display: flex; justify-content: center; margin-bottom: 40rpx;
    .icon-circle {
      width: 160rpx; height: 160rpx;
      display: flex; align-items: center; justify-content: center;
      font-size: 80rpx;
    }
  }
  .title { font-size: 40rpx; font-weight: bold; color: #394963; }
  .subtitle { font-size: 28rpx; color: #777; margin-top: 10rpx; }
}

/* 详情卡片 */
.info-card {
  margin-top: 50rpx;
  padding: 40rpx;
  .info-item { font-size: 26rpx; color: #666; }
}

/* 按钮区域 */
.action-section {
  margin-top: 80rpx;
  .confirm-btn {
    width: 100%; height: 110rpx; border-radius: 55rpx;
    display: flex; align-items: center; justify-content: center;
    font-size: 32rpx; font-weight: bold; border: none;
    box-shadow: 0 10rpx 20rpx rgba(41, 121, 255, 0.2);
    &:active { transform: scale(0.96); opacity: 0.9; }
  }
  .cancel-btn {
    margin-top: 40rpx; width: 100%; height: 110rpx; border-radius: 55rpx;
    display: flex; align-items: center; justify-content: center;
    font-size: 30rpx; color: #777;
    &:active { box-shadow: inset 4rpx 4rpx 8rpx #BABECC, inset -4rpx -4rpx 8rpx #FFFFFF; }
  }
  .tips-text { text-align: center; color: #999; font-size: 24rpx; margin-top: 30rpx; }
}

/* 动画 */
.animate-fade-up { animation: fadeUp 0.6s ease-out both; }
@keyframes fadeUp { from { opacity: 0; transform: translateY(40rpx); } to { opacity: 1; transform: translateY(0); } }
</style>