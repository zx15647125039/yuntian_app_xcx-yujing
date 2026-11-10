<template>
  <view class="container">
    <!-- 顶部操作栏 -->
    <view class="map-nav-bar">
      <view class="nav-btn cancel-btn" @click="handleCancel">
        <text class="btn-text">取消</text>
      </view>
      <view class="search-input-wrap">
        <text class="search-icon">🔍</text>
        <input
          v-model="searchKeyword"
          type="text"
          placeholder="搜索地点名称或道路"
          class="search-input"
          @confirm="onSearch"
        />
      </view>
      <view class="nav-btn confirm-btn" @click="handleConfirm">
        <text class="btn-text">确认</text>
      </view>
    </view>

    <!-- 地图视口区域 -->
    <view class="map-container">
      <map
        id="reportMap"
        class="main-map"
        :latitude="latitude"
        :longitude="longitude"
        :scale="16"
        :show-location="true"
        @regionchange="onRegionChange"
      >
      </map>

      <!-- 地图中心绿色定位标记 (PRD 1.3 核心要求) -->
      <view class="center-pin">
        <view class="pin-icon">
          <text class="pin-symbol">📍</text>
        </view>
        <view class="pin-shadow"></view>
      </view>
    </view>

    <!-- 底部选中点位信息回填卡片 -->
    <view class="bottom-info-card">
      <view class="info-title-row">
        <text class="badge-dot"></text>
        <text class="info-name">{{ currentPlaceName }}</text>
      </view>
      <text class="info-detail">{{ currentAddress }}</text>
      <text class="info-coords">经纬度坐标: {{ longitude.toFixed(6) }}, {{ latitude.toFixed(6) }}</text>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      latitude: 39.909230,
      longitude: 116.397428,
      searchKeyword: '',
      currentPlaceName: '观天下产业科技园C区3号楼配电房',
      currentAddress: '北京市海淀区科技创新园西路8号',
    };
  },
  onLoad() {
    // 自动获取当前用户坐标
    uni.getLocation({
      type: 'gcj02',
      success: (res) => {
        if (res.latitude && res.longitude) {
          this.latitude = res.latitude;
          this.longitude = res.longitude;
        }
      }
    });
  },
  methods: {
    onRegionChange(e) {
      if (e.type === 'end' || e.causedBy === 'drag') {
        const mapCtx = uni.createMapContext('reportMap', this);
        mapCtx.getCenterLocation({
          success: (res) => {
            this.latitude = res.latitude;
            this.longitude = res.longitude;
            this.currentPlaceName = "观天下科技园巡检网格点";
            this.currentAddress = `巡检网格坐标：${res.longitude.toFixed(6)}, ${res.latitude.toFixed(6)}`;
          }
        });
      }
    },
    onSearch() {
      if (!this.searchKeyword) return;
      this.currentPlaceName = this.searchKeyword;
      this.currentAddress = `观天下园区周边检索地点：${this.searchKeyword}`;
      uni.showToast({ title: '已定位至目标区域', icon: 'none' });
    },
    handleCancel() {
      // PRD 1.3: 左上角【取消】：返回表单页面，不保存点位信息
      uni.navigateBack({ delta: 1 });
    },
    handleConfirm() {
      // PRD 1.3: 顶部【确认】按钮：选中点位后，回填地址
      uni.$emit('onLocationPicked', {
        address: this.currentPlaceName,
        latitude: this.latitude,
        longitude: this.longitude
      });
      uni.navigateBack({ delta: 1 });
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  position: relative;
}

.map-nav-bar {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx 24rpx;
  background-color: #FFFFFF;
  border-bottom: 1rpx solid #E5E6EB;
  z-index: 10;

  .nav-btn {
    padding: 10rpx 20rpx;
    border-radius: 12rpx;
    font-size: 26rpx;
    font-weight: bold;
    &.cancel-btn {
      color: #86909C;
      background-color: #F2F3F5;
    }
    &.confirm-btn {
      color: #FFFFFF;
      background-color: #00B578;
    }
  }

  .search-input-wrap {
    flex: 1;
    margin: 0 16rpx;
    background-color: #F7F8FA;
    border-radius: 14rpx;
    display: flex;
    align-items: center;
    padding: 10rpx 20rpx;

    .search-icon {
      font-size: 24rpx;
      margin-right: 12rpx;
    }
    .search-input {
      flex: 1;
      font-size: 24rpx;
      color: #1D2129;
    }
  }
}

.map-container {
  flex: 1;
  position: relative;
  width: 100%;

  .main-map {
    width: 100%;
    height: 100%;
  }

  .center-pin {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -100%);
    display: flex;
    flex-direction: column;
    align-items: center;
    pointer-events: none;

    .pin-icon {
      width: 60rpx;
      height: 60rpx;
      border-radius: 50%;
      background-color: #00B578;
      border: 3rpx solid #FFFFFF;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 6rpx 16rpx rgba(0, 181, 120, 0.4);
      .pin-symbol {
        font-size: 32rpx;
      }
    }
    .pin-shadow {
      width: 16rpx;
      height: 8rpx;
      border-radius: 50%;
      background-color: rgba(0, 0, 0, 0.3);
      margin-top: 4rpx;
    }
  }
}

.bottom-info-card {
  padding: 30rpx 32rpx;
  background-color: #FFFFFF;
  border-top-left-radius: 24rpx;
  border-top-right-radius: 24rpx;
  box-shadow: 0 -4rpx 16rpx rgba(0, 0, 0, 0.05);

  .info-title-row {
    display: flex;
    align-items: center;
    gap: 12rpx;
    margin-bottom: 8rpx;
    .badge-dot {
      width: 14rpx;
      height: 14rpx;
      border-radius: 50%;
      background-color: #00B578;
    }
    .info-name {
      font-size: 28rpx;
      font-weight: bold;
      color: #1D2129;
    }
  }

  .info-detail {
    font-size: 22rpx;
    color: #4E5969;
    margin-bottom: 8rpx;
    display: block;
  }
  .info-coords {
    font-size: 20rpx;
    color: #86909C;
    display: block;
  }
}
</style>
