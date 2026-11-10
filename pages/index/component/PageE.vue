<template>
  <view class="template-clock">
    <!-- 用户信息卡片 (GET /intoclouds/mobile/staff/profile) -->
    <view class="profile-card neu-outset">
      <view class="avatar-ring neu-outset">
        <view class="avatar-circle">
          <text class="avatar-char">{{ (profile.nickname || '咸').slice(0, 1) }}</text>
        </view>
      </view>

      <view class="profile-info">
        <view class="name-row">
          <text class="user-real-name">{{ profile.nickname || '咸宁巡检01' }}</text>
          <text class="role-tag">现场处置员</text>
        </view>
        <text class="dept-title">租户: {{ profile.tenantName }} (tenantId: {{ profile.tenantId }})</text>
        <text class="job-id font-mono">
          用户ID: {{ profile.userId }} | 项目ID: {{ (profile.projectIds || []).join(', ') || '全部' }}
        </text>
      </view>
    </view>

    <!-- 3.1 我的信息 + 待办角标 (todoCount / overdueCount / unreadCount) -->
    <view class="kpi-grid">
      <view class="kpi-card neu-outset" @click="goToTickets">
        <text class="kpi-val text-blue font-mono">{{ profile.todoCount }}</text>
        <text class="kpi-lbl">待办工单(1/2/3/5)</text>
      </view>
      <view class="kpi-card neu-outset" @click="goToTickets">
        <text class="kpi-val text-red font-mono">{{ profile.overdueCount }}</text>
        <text class="kpi-lbl">已超期数量</text>
      </view>
      <view class="kpi-card neu-outset">
        <text class="kpi-val text-indigo font-mono">{{ profile.unreadCount }}</text>
        <text class="kpi-lbl">未读站内消息</text>
      </view>
    </view>

    <!-- 现场处置接口配置与状态菜单 -->
    <view class="menu-card neu-outset">
      <view class="menu-item" @click="openLoginModal">
        <view class="menu-left">
          <text class="menu-icon">🔐</text>
          <text class="menu-label">两步登录切换 (prelogin → login)</text>
        </view>
        <view class="menu-right">
          <text class="menu-val text-blue">{{ profile.tenantName }}</text>
          <text class="menu-arrow">➔</text>
        </view>
      </view>

      <view class="menu-item" @click="refreshProfile">
        <view class="menu-left">
          <text class="menu-icon">🔄</text>
          <text class="menu-label">刷新个人档案与待办角标 (profile)</text>
        </view>
        <view class="menu-right">
          <text class="menu-val text-emerald">点击同步</text>
          <text class="menu-arrow">➔</text>
        </view>
      </view>

      <view class="menu-item" @click="toggleNotice">
        <view class="menu-left">
          <text class="menu-icon">🔔</text>
          <text class="menu-label">超期工单与退回工单强提醒</text>
        </view>
        <view class="menu-right">
          <switch :checked="noticeEnabled" color="#1E6FFF" @change="onNoticeChange" />
        </view>
      </view>

      <view class="menu-item" @click="viewApiSpec">
        <view class="menu-left">
          <text class="menu-icon">📑</text>
          <text class="menu-label">现场处置 · 手机端接口规范</text>
        </view>
        <view class="menu-right">
          <text class="menu-val">D162 + D164</text>
          <text class="menu-arrow">➔</text>
        </view>
      </view>
    </view>

    <!-- 退出登录 / 切换账号按钮 -->
    <view class="logout-box">
      <button class="btn-logout neu-outset" @click="openLoginModal">
        切换账号 / 重新执行两步登录 (prelogin → login)
      </button>
    </view>

    <!-- 两步登录弹窗 (§1.1 prelogin 换出租户列表 -> §1.2 login 携带 tenant-id) -->
    <view v-if="showLoginModal" class="modal-mask">
      <view class="login-dialog neu-outset">
        <view class="dialog-head">
          <text class="dialog-title">现场处置 · 两步登录验证</text>
          <text class="dialog-close" @click="showLoginModal = false">✕</text>
        </view>

        <view class="form-item">
          <text class="form-lbl">登录账号 (username):</text>
          <view class="input-box neu-inset">
            <input
              type="text"
              v-model="loginForm.username"
              placeholder="输入 xianning01 (单租户) 或 multi01 (多租户)"
              class="login-input"
            />
          </view>
        </view>

        <view class="form-item">
          <text class="form-lbl">登录密码 (password):</text>
          <view class="input-box neu-inset">
            <input
              type="password"
              v-model="loginForm.password"
              placeholder="请输入密码"
              class="login-input"
            />
          </view>
        </view>

        <!-- 当 prelogin 返回多条租户时展示选择列表；单条时自动选中 -->
        <view v-if="tenantList.length > 0" class="tenant-section">
          <text class="form-lbl">
            选择所属租户 (prelogin 返回 {{ tenantList.length }} 个租户):
          </text>
          <view class="tenant-list">
            <view
              v-for="t in tenantList"
              :key="t.tenantId"
              :class="['tenant-item', selectedTenantId === t.tenantId ? 'tenant-active' : 'neu-inset']"
              @click="selectedTenantId = t.tenantId"
            >
              <text class="t-name">{{ t.tenantName }}</text>
              <text class="t-id">tenant-id: {{ t.tenantId }}</text>
            </view>
          </view>
        </view>

        <view class="login-btn-row">
          <button class="btn-prelogin neu-outset" @click="handleStep1Prelogin">
            1. 预登录 (prelogin)
          </button>
          <button class="btn-dologin" @click="handleFullTwoStepLogin">
            {{ tenantList.length > 1 ? '2. 确认租户并登录' : '一键两步登录' }}
          </button>
        </view>
      </view>
    </view>

    <view class="bottom-placeholder"></view>
  </view>
</template>

<script>
import api from '@/api/index.js';

export default {
  name: 'PageE',
  data() {
    return {
      noticeEnabled: true,
      profile: {
        userId: null,
        nickname: '',
        mobile: '',
        tenantId: null,
        tenantName: '',
        projectIds: [],
        todoCount: 0,
        overdueCount: 0,
        unreadCount: 0
      },
      showLoginModal: false,
      loginForm: {
        username: '',
        password: ''
      },
      tenantList: [],
      selectedTenantId: null
    };
  },
  mounted() {
    this.refreshProfile();
    uni.$on('profileUpdated', (prof) => {
      if (prof) this.profile = prof;
    });
  },
  methods: {
    async refreshProfile() {
      try {
        const res = await api.getStaffProfile();
        if (res && res.code === 0 && res.data) {
          this.profile = res.data;
          uni.$emit('profileUpdated', res.data);
        }
      } catch (e) {
        console.error(e);
      }
    },
    goToTickets() {
      uni.$emit('changeTabbar', 2);
    },
    toggleNotice() {
      this.noticeEnabled = !this.noticeEnabled;
      uni.showToast({
        title: this.noticeEnabled ? '已开启超期与退回强提醒' : '已关闭提醒',
        icon: 'none'
      });
    },
    onNoticeChange(e) {
      this.noticeEnabled = e.detail.value;
    },
    viewApiSpec() {
      uni.showModal({
        title: '现场处置接口规范 (D162+D164)',
        content: '包含两步登录 (prelogin/login) 及 6 个手机端接口：profile、ticket/page、ticket/get、ticket/accept、ticket/process（含处置三件套+1~9张现场照片）、ticket/log。',
        showCancel: false,
        confirmText: '确定'
      });
    },
    openLoginModal() {
      this.tenantList = [];
      this.showLoginModal = true;
    },
    async handleStep1Prelogin() {
      const res = await api.prelogin({
        username: this.loginForm.username,
        password: this.loginForm.password
      });
      if (res && res.code === 0 && Array.isArray(res.data)) {
        this.tenantList = res.data;
        if (res.data.length === 1) {
          // 只有 1 条时直接选中它，不需要手填企业编码
          this.selectedTenantId = res.data[0].tenantId;
          uni.showToast({
            title: `单租户自动选中: ${res.data[0].tenantName} (${res.data[0].tenantId})`,
            icon: 'none'
          });
        } else if (res.data.length > 1) {
          this.selectedTenantId = res.data[0].tenantId;
          uni.showToast({
            title: `检测到 ${res.data.length} 个租户，请选择`,
            icon: 'none'
          });
        }
        return res.data;
      }
      return null;
    },
    async handleFullTwoStepLogin() {
      let tenants = this.tenantList;
      if (!tenants || tenants.length === 0) {
        tenants = await this.handleStep1Prelogin();
        if (!tenants || tenants.length === 0) return;
        if (tenants.length > 1) {
          // 多租户时让用户确认选择
          return;
        }
      }

      const loginRes = await api.staffLogin(
        {
          username: this.loginForm.username,
          password: this.loginForm.password
        },
        this.selectedTenantId
      );

      if (loginRes && loginRes.code === 0 && loginRes.data) {
        uni.setStorageSync('accessToken', loginRes.data.accessToken);
        uni.setStorageSync('token', loginRes.data.accessToken);
        uni.setStorageSync('refreshToken', loginRes.data.refreshToken);
        uni.setStorageSync('tenantId', this.selectedTenantId);
        uni.setStorageSync('userId', loginRes.data.userId);

        this.showLoginModal = false;
        uni.showToast({ title: '登录成功，已绑定租户与Token', icon: 'success' });
        await this.refreshProfile();
        uni.$emit('refreshTickets');
      }
    }
  }
};
</script>

<style lang="scss" scoped>
.template-clock {
  min-height: 100vh;
  width: 100%;
  background-color: #EBECF0;
  box-sizing: border-box;
  padding: 24rpx;
  font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
}

.profile-card {
  padding: 28rpx;
  border-radius: 24rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
}

.avatar-ring {
  width: 110rpx;
  height: 110rpx;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
}

.avatar-circle {
  width: 90rpx;
  height: 90rpx;
  border-radius: 50%;
  background-color: #1E6FFF;
  display: flex;
  align-items: center;
  justify-content: center;
}

.avatar-char {
  color: #FFF;
  font-size: 42rpx;
  font-weight: 800;
}

.profile-info {
  display: flex;
  flex-direction: column;
  gap: 6rpx;
}

.name-row {
  display: flex;
  align-items: center;
  gap: 12rpx;
}

.user-real-name {
  font-size: 36rpx;
  font-weight: 800;
  color: #0F172A;
}

.role-tag {
  font-size: 22rpx;
  font-weight: bold;
  background-color: #DBEAFE;
  color: #1E6FFF;
  padding: 2rpx 14rpx;
  border-radius: 20rpx;
}

.dept-title {
  font-size: 24rpx;
  color: #1E293B;
  font-weight: 700;
}

.job-id {
  font-size: 22rpx;
  color: #334155;
  font-weight: 600;
}

.kpi-grid {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 18rpx;
  margin-bottom: 24rpx;
}

.kpi-card {
  padding: 24rpx 12rpx;
  border-radius: 20rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.kpi-val {
  font-size: 36rpx;
  font-weight: 800;
}

.kpi-lbl {
  font-size: 21rpx;
  color: #334155;
  font-weight: 700;
}

.text-blue { color: #1E6FFF; }
.text-emerald { color: #059669; }
.text-indigo { color: #4F46E5; }
.text-red { color: #DC2626; }

.menu-card {
  border-radius: 24rpx;
  padding: 10rpx 20rpx;
  display: flex;
  flex-direction: column;
  margin-bottom: 30rpx;
}

.menu-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 26rpx 10rpx;
  border-bottom: 1px solid rgba(186, 190, 204, 0.35);

  &:last-child {
    border-bottom: none;
  }
}

.menu-left {
  display: flex;
  align-items: center;
  gap: 16rpx;
}

.menu-icon {
  font-size: 32rpx;
}

.menu-label {
  font-size: 26rpx;
  font-weight: 700;
  color: #0F172A;
}

.menu-right {
  display: flex;
  align-items: center;
  gap: 10rpx;
}

.menu-val {
  font-size: 24rpx;
  color: #334155;
  font-weight: 700;
}

.menu-arrow {
  font-size: 22rpx;
  color: #64748B;
}

.logout-box {
  margin-top: 10rpx;
}

.btn-logout {
  width: 100%;
  padding: 22rpx 0;
  border-radius: 20rpx;
  color: #1E6FFF;
  font-size: 26rpx;
  font-weight: bold;
  border: none;
  line-height: 1.4;
}

.modal-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(15, 23, 42, 0.65);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
}

.login-dialog {
  width: 100%;
  max-width: 620rpx;
  border-radius: 28rpx;
  padding: 28rpx;
  display: flex;
  flex-direction: column;
  gap: 18rpx;
}

.dialog-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.dialog-title {
  font-size: 28rpx;
  font-weight: 900;
  color: #0F172A;
}

.dialog-close {
  font-size: 32rpx;
  color: #475569;
  font-weight: bold;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 8rpx;
}

.form-lbl {
  font-size: 22rpx;
  font-weight: 800;
  color: #334155;
}

.input-box {
  padding: 14rpx 18rpx;
  border-radius: 14rpx;
}

.login-input {
  font-size: 24rpx;
  color: #0F172A;
}

.tenant-section {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.tenant-list {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.tenant-item {
  padding: 16rpx;
  border-radius: 14rpx;
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.tenant-active {
  background-color: #1E6FFF;
  color: #FFF;
}

.t-name {
  font-size: 24rpx;
  font-weight: 800;
}

.t-id {
  font-size: 20rpx;
  font-family: monospace;
}

.login-btn-row {
  display: flex;
  gap: 14rpx;
  margin-top: 8rpx;
}

.btn-prelogin {
  flex: 1;
  font-size: 22rpx;
  font-weight: bold;
  color: #1E293B;
  border-radius: 14rpx;
  padding: 16rpx 0;
  border: none;
}

.btn-dologin {
  flex: 1.3;
  font-size: 23rpx;
  font-weight: bold;
  background-color: #1E6FFF;
  color: #FFF;
  border-radius: 14rpx;
  padding: 16rpx 0;
  border: none;
}

.neu-outset {
  background-color: #EBECF0;
  box-shadow: -3px -3px 7px #FFFFFF, 3px 3px 7px #BABECC;
}

.neu-inset {
  background-color: #EBECF0;
  box-shadow: inset -2px -2px 5px #FFFFFF, inset 2px 2px 5px #BABECC;
}

.bottom-placeholder {
  height: 140rpx;
}
</style>