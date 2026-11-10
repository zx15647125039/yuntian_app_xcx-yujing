<template>
  <view class="template-login">
    <view class="nav-back-action" @click="handleCancel">
      <text class="tn-icon-left">‹</text>
    </view>

    <view class="login-container">
      <view class="logo-section">
        <view class="clock-neu">
          <image src="/static/images/home.png" mode="aspectFit" class="logo-img"></image>
        </view>
        <view class="brand-name">观天下 · 现场处置端</view>
        <view class="brand-slogan">D162 + D164 · 必须复核 · 处置三件套</view>
      </view>

      <!-- 两步登录卡片 (1. prelogin 换出租户列表 -> 2. login 携带 tenant-id) -->
      <view class="login-card neu-outset">
        <view class="field-item">
          <text class="field-label">登录账号 (username)</text>
          <view class="input-wrap neu-inset">
            <input
              type="text"
              v-model="username"
              placeholder="请输入账号 (如 xianning01)"
              class="login-input"
            />
          </view>
        </view>

        <view class="field-item">
          <text class="field-label">登录密码 (password)</text>
          <view class="input-wrap neu-inset">
            <input
              type="password"
              v-model="password"
              placeholder="请输入密码"
              class="login-input"
            />
          </view>
        </view>

        <!-- 当 prelogin 返回多个租户时显示租户选择器；只有1条时自动选中 -->
        <view v-if="tenants.length > 0" class="field-item">
          <text class="field-label">所属租户 (tenant-id)</text>
          <view class="tenant-chips">
            <view
              v-for="item in tenants"
              :key="item.tenantId"
              :class="['tenant-chip', selectedTenantId === item.tenantId ? 'tenant-chip-active' : 'neu-inset']"
              @click="selectedTenantId = item.tenantId"
            >
              <text class="t-name">{{ item.tenantName }}</text>
              <text class="t-id">#{{ item.tenantId }}</text>
            </view>
          </view>
        </view>

        <button class="primary-login-btn" @click="handleTwoStepLogin">
          {{ tenants.length > 1 ? '确认租户并登录' : '登录现场处置系统' }}
        </button>

        <view class="cancel-text-btn" @click="handleCancel">返回工作台首页</view>
      </view>
    </view>
  </view>
</template>

<script>
import api from '@/api/index.js';

export default {
  data() {
    return {
      username: 'xianning01',
      password: '123456',
      tenants: [],
      selectedTenantId: 164
    };
  },
  methods: {
    handleCancel() {
      const pages = getCurrentPages();
      if (pages.length > 1) {
        uni.navigateBack({ delta: 1 });
      } else {
        uni.reLaunch({ url: '/pages/index/index' });
      }
    },

    async handleTwoStepLogin() {
      if (!this.username.trim() || !this.password.trim()) {
        uni.showToast({ title: '请输入登录账号和密码', icon: 'none' });
        return;
      }

      uni.showLoading({ title: '正在验证...', mask: true });
      try {
        // 第一步：POST /system/auth/prelogin 换出租户列表
        if (this.tenants.length === 0) {
          const preRes = await api.prelogin({
            username: this.username.trim(),
            password: this.password.trim()
          });
          if (!preRes || preRes.code !== 0 || !Array.isArray(preRes.data) || preRes.data.length === 0) {
            uni.hideLoading();
            uni.showToast({ title: (preRes && preRes.msg) || '账号或密码不正确', icon: 'none' });
            return;
          }
          this.tenants = preRes.data;
          this.selectedTenantId = preRes.data[0].tenantId;

          // 若同一账号属于多个租户，暂停并让用户选择租户
          if (preRes.data.length > 1) {
            uni.hideLoading();
            uni.showToast({ title: '请选择要进入的租户', icon: 'none' });
            return;
          }
        }

        // 第二步：POST /system/auth/login (Header: tenant-id)
        const loginRes = await api.staffLogin(
          {
            username: this.username.trim(),
            password: this.password.trim()
          },
          this.selectedTenantId
        );
        uni.hideLoading();

        if (loginRes && loginRes.code === 0 && loginRes.data) {
          uni.setStorageSync('accessToken', loginRes.data.accessToken);
          uni.setStorageSync('token', loginRes.data.accessToken);
          uni.setStorageSync('refreshToken', loginRes.data.refreshToken);
          uni.setStorageSync('tenantId', this.selectedTenantId);
          uni.setStorageSync('userId', loginRes.data.userId);

          uni.showToast({ title: '登录成功', icon: 'success' });
          setTimeout(() => {
            uni.reLaunch({ url: '/pages/index/index' });
          }, 500);
        } else {
          uni.showToast({ title: (loginRes && loginRes.msg) || '登录失败', icon: 'none' });
        }
      } catch (e) {
        uni.hideLoading();
        uni.showToast({ title: '登录请求异常', icon: 'none' });
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.template-login {
  background-color: #EBECF0;
  min-height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.nav-back-action {
  position: absolute;
  left: 30rpx;
  top: 80rpx;
  width: 70rpx;
  height: 70rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: #EBECF0;
  border-radius: 50%;
  box-shadow: 6rpx 6rpx 12rpx #BABECC, -6rpx -6rpx 12rpx #FFFFFF;
  color: #0F172A;
  font-size: 42rpx;
  font-weight: bold;
  z-index: 10;
}

.login-container {
  padding: 0 48rpx;
}

.logo-section {
  margin-top: 140rpx;
  text-align: center;
  .clock-neu {
    width: 170rpx;
    height: 170rpx;
    background-color: #EBECF0;
    margin: 0 auto 30rpx;
    border-radius: 50%;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 10rpx 10rpx 20rpx #BABECC, -10rpx -10rpx 20rpx #FFFFFF;
    .logo-img {
      width: 100rpx;
      height: 100rpx;
    }
  }
  .brand-name {
    font-size: 42rpx;
    font-weight: 900;
    color: #0F172A;
  }
  .brand-slogan {
    font-size: 24rpx;
    color: #475569;
    font-weight: 600;
    margin-top: 12rpx;
  }
}

.login-card {
  margin-top: 50rpx;
  padding: 36rpx 30rpx;
  border-radius: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.field-item {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.field-label {
  font-size: 24rpx;
  font-weight: 800;
  color: #1E293B;
}

.input-wrap {
  padding: 18rpx 22rpx;
  border-radius: 16rpx;
}

.login-input {
  font-size: 26rpx;
  color: #0F172A;
}

.tenant-chips {
  display: flex;
  flex-direction: column;
  gap: 12rpx;
}

.tenant-chip {
  padding: 18rpx 20rpx;
  border-radius: 16rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tenant-chip-active {
  background-color: #1E6FFF;
  color: #FFF;
}

.t-name {
  font-size: 25rpx;
  font-weight: 800;
}

.t-id {
  font-size: 22rpx;
  font-family: monospace;
}

.primary-login-btn {
  width: 100%;
  height: 92rpx;
  background-color: #1E6FFF;
  color: #FFF;
  border-radius: 20rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 28rpx;
  font-weight: 800;
  margin-top: 12rpx;
  border: none;
}

.cancel-text-btn {
  text-align: center;
  font-size: 24rpx;
  color: #64748B;
  font-weight: 600;
  padding: 8rpx;
}

.neu-outset {
  background-color: #EBECF0;
  box-shadow: -4px -4px 10px #FFFFFF, 4px 4px 10px #BABECC;
}

.neu-inset {
  background-color: #EBECF0;
  box-shadow: inset -2px -2px 5px #FFFFFF, inset 2px 2px 5px #BABECC;
}
</style>
