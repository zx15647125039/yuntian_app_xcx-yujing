<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="nav-bar" :style="{ paddingTop: (statusBarHeight || 20) + 'px' }">
      <view class="nav-content">
        <view class="back-btn" @click="handleBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">个人中心</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <scroll-view scroll-y class="mine-scroll">
      <!-- 个人信息卡片 -->
      <view class="user-card">
        <view class="avatar-wrap">
          <text class="avatar-txt">李</text>
        </view>
        <view class="user-info">
          <text class="user-name">李伟琦</text>
          <text class="user-role">观天下综合巡检大队 · 现场处置主管</text>
          <text class="user-id">账号工号: GT20260731 | 权限: 发起/处置/审核</text>
        </view>
      </view>

      <!-- 快捷统计 -->
      <view class="stat-card">
        <view class="stat-col">
          <text class="stat-val">18</text>
          <text class="stat-sub">本月上报</text>
        </view>
        <view class="stat-col">
          <text class="stat-val text-blue">24</text>
          <text class="stat-sub">本月处置</text>
        </view>
        <view class="stat-col">
          <text class="stat-val text-green">100%</text>
          <text class="stat-sub">按期办结率</text>
        </view>
      </view>

      <!-- 系统设置与说明菜单 -->
      <view class="menu-card">
        <view class="menu-item" @click="goToOrders">
          <view class="menu-left">
            <text class="menu-icon">📋</text>
            <text class="menu-label">我派发的工单记录</text>
          </view>
          <text class="arrow">›</text>
        </view>

        <view class="menu-item" @click="openOfflineMap">
          <view class="menu-left">
            <text class="menu-icon">🗺️</text>
            <text class="menu-label">离线地图包配置 (奥维 / 高德)</text>
          </view>
          <text class="menu-extra">已就绪 ›</text>
        </view>

        <view class="menu-item" @click="showVersionInfo">
          <view class="menu-left">
            <text class="menu-icon">ℹ️</text>
            <text class="menu-label">PRD 版本与产品信息</text>
          </view>
          <text class="menu-extra">V1.1 (2026.7.31) ›</text>
        </view>
      </view>

      <!-- 退出登录按钮 -->
      <view class="logout-wrap">
        <button class="btn-logout" @click="handleLogout">退出登录</button>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 24
    };
  },
  onLoad() {
    const sys = uni.getSystemInfoSync();
    if (sys && sys.statusBarHeight) {
      this.statusBarHeight = sys.statusBarHeight;
    }
  },
  methods: {
    handleBack() {
      uni.navigateBack({ delta: 1 });
    },
    goToOrders() {
      uni.navigateTo({
        url: '/pages/order/list'
      });
    },
    openOfflineMap() {
      uni.showToast({ title: '已加载离线高清卫星切片', icon: 'none' });
    },
    showVersionInfo() {
      uni.showModal({
        title: '版本说明',
        content: '观天下小程序-派单 PRD V1.1\n作者：李伟琦\n修订日期：2026.7.31\n实现全流程隐患上报、地图选点、涂鸦标注、派单调度与工单闭环。',
        showCancel: false
      });
    },
    handleLogout() {
      uni.showModal({
        title: '退出确认',
        content: '确定退出当前账号登录？',
        success: (res) => {
          if (res.confirm) {
            uni.reLaunch({
              url: '/pages/index/index'
            });
          }
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  min-height: 100vh;
  background-color: #F5F7FA;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  background-color: #FFFFFF;
  border-bottom: 1rpx solid #E5E6EB;
  .nav-content {
    height: 88rpx;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24rpx;
    .back-btn {
      width: 60rpx;
      height: 60rpx;
      display: flex;
      align-items: center;
      .back-arrow {
        font-size: 48rpx;
        color: #1D2129;
      }
    }
    .nav-title {
      font-size: 32rpx;
      font-weight: bold;
      color: #1D2129;
    }
    .nav-placeholder {
      width: 60rpx;
    }
  }
}

.mine-scroll {
  flex: 1;
  padding: 24rpx;
  box-sizing: border-box;
}

.user-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 32rpx;
  display: flex;
  align-items: center;
  gap: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

  .avatar-wrap {
    width: 100rpx;
    height: 100rpx;
    border-radius: 50%;
    background-color: #1E6FFF;
    color: #FFFFFF;
    font-size: 40rpx;
    font-weight: bold;
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: 0 4rpx 12rpx rgba(30, 111, 255, 0.3);
  }

  .user-info {
    display: flex;
    flex-direction: column;
    .user-name {
      font-size: 32rpx;
      font-weight: bold;
      color: #1D2129;
    }
    .user-role {
      font-size: 22rpx;
      color: #1E6FFF;
      margin-top: 6rpx;
    }
    .user-id {
      font-size: 20rpx;
      color: #86909C;
      margin-top: 8rpx;
    }
  }
}

.stat-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  display: flex;
  justify-content: space-around;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

  .stat-col {
    display: flex;
    flex-direction: column;
    align-items: center;
    .stat-val {
      font-size: 36rpx;
      font-weight: bold;
      color: #1D2129;
      &.text-blue { color: #1E6FFF; }
      &.text-green { color: #00B578; }
    }
    .stat-sub {
      font-size: 20rpx;
      color: #86909C;
      margin-top: 6rpx;
    }
  }
}

.menu-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  overflow: hidden;
  margin-bottom: 36rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

  .menu-item {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 30rpx 28rpx;
    border-bottom: 1rpx solid #F2F3F5;

    &:last-child {
      border-bottom: none;
    }

    .menu-left {
      display: flex;
      align-items: center;
      gap: 16rpx;
      .menu-icon { font-size: 30rpx; }
      .menu-label {
        font-size: 26rpx;
        color: #1D2129;
      }
    }

    .arrow {
      font-size: 32rpx;
      color: #C9CDD4;
    }
    .menu-extra {
      font-size: 22rpx;
      color: #86909C;
    }
  }
}

.logout-wrap {
  padding: 0 16rpx;
  .btn-logout {
    background-color: #F2F3F5;
    color: #F53F3F;
    font-size: 28rpx;
    font-weight: bold;
    border-radius: 16rpx;
    height: 80rpx;
    line-height: 80rpx;
  }
}
</style>