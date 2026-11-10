<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="nav-bar" :style="{ paddingTop: (statusBarHeight || 20) + 'px' }">
      <view class="nav-content">
        <view class="back-btn" @click="handleBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">工单详情</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <scroll-view scroll-y class="detail-scroll">
      <!-- 基础信息区域 (PRD 2.2 只读回填) -->
      <view class="detail-card">
        <view class="card-header">
          <text class="order-no">{{ order.id }}</text>
          <text :class="['status-tag', getStatusClass(order.status)]">{{ order.status }}</text>
        </view>

        <view class="info-list">
          <view class="info-item">
            <text class="info-label">事件类型：</text>
            <text class="info-val">{{ order.eventType }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">事件来源：</text>
            <text class="info-val">{{ order.eventSource }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">隐患类型：</text>
            <text class="info-val text-red">{{ order.hazardType }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">上报人员：</text>
            <text class="info-val">{{ order.reporter }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">预警时间：</text>
            <text class="info-val">{{ order.warningTime }}</text>
          </view>
        </view>

        <view class="desc-box">
          <text class="desc-label">隐患描述：</text>
          <text class="desc-content">{{ order.description }}</text>
        </view>
      </view>

      <!-- 巡检范围模块 (地图点位，右侧【导航】按钮，PRD 2.2) -->
      <view class="detail-card">
        <view class="loc-card-header">
          <view class="loc-title">
            <text class="loc-icon">📍</text>
            <text class="loc-heading">巡检范围与定位</text>
          </view>
          <button class="btn-navigate" @click="handleNavigate">
            <text class="nav-icon">🧭</text>
            <text>导航</text>
          </button>
        </view>

        <view class="loc-address-box">
          <text class="loc-name">{{ order.location ? order.location.address : '园区核心巡检区域' }}</text>
          <text class="loc-coords">
            目标坐标: {{ order.location ? order.location.longitude : '116.397428' }}, {{ order.location ? order.location.latitude : '39.909230' }}
          </text>
        </view>
      </view>

      <!-- 事件图片区域 (展示上报时带标注原图，PRD 2.2) -->
      <view class="detail-card">
        <view class="img-header">
          <text class="img-title">现场隐患标注图片</text>
        </view>
        <view class="img-list">
          <block v-for="(img, idx) in (order.images || [])" :key="idx">
            <view class="img-item" @click="previewImage(img)">
              <image :src="img" mode="aspectFill" class="img-thumb"></image>
              <text class="img-badge">带标注原图</text>
            </view>
          </block>
        </view>
      </view>
    </scroll-view>

    <!-- 底部功能按钮 (【取消工单】、【开始工单】，PRD 2.2) -->
    <view v-if="order.status === '未处理'" class="bottom-bar">
      <button class="btn btn-cancel-order" @click="promptCancelOrder">取消工单</button>
      <button class="btn btn-start-order" @click="startOrder">开始工单</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 24,
      order: {
        id: "GD20260731001",
        eventType: "上报事件",
        eventSource: "主动上报",
        hazardType: "火情隐患",
        description: "西侧产业园区3号仓库外围堆放大量易燃木质包装材料，临近高压变电箱，存在严重夏季火情隐患。",
        status: "未处理",
        reporter: "李伟琦",
        warningTime: "2026-07-31 09:25:10",
        location: { address: "观天下产业科技园C区3号楼配电房旁", latitude: 39.90923, longitude: 116.397428 },
        images: ["https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=600"]
      }
    };
  },
  onLoad(options) {
    const sys = uni.getSystemInfoSync();
    if (sys && sys.statusBarHeight) {
      this.statusBarHeight = sys.statusBarHeight;
    }

    if (options && options.id) {
      const orders = uni.getStorageSync('gt_work_orders') || [];
      const found = orders.find(o => o.id === options.id);
      if (found) {
        this.order = found;
      }
    }
  },
  methods: {
    handleBack() {
      uni.navigateBack({ delta: 1 });
    },
    getStatusClass(st) {
      if (st === '未处理') return 'tag-orange';
      if (st === '已派工') return 'tag-blue';
      if (st === '已完成') return 'tag-green';
      return 'tag-gray';
    },
    handleNavigate() {
      // PRD 2.2: 导航交互 -> 弹出选择弹窗：奥维地图 / 高德地图
      uni.showActionSheet({
        itemList: ['奥维互动地图 (专业卫星)', '高德地图 (实时车行导航)'],
        success: (res) => {
          const names = ['奥维互动地图', '高德地图'];
          uni.showModal({
            title: '正在唤起导航',
            content: `已调起【${names[res.tapIndex]}】\n导航终点：${this.order.location ? this.order.location.address : '现场'}\n坐标：${this.order.location ? this.order.location.longitude : '116.397428'}, ${this.order.location ? this.order.location.latitude : '39.90923'}`,
            showCancel: false
          });
        }
      });
    },
    previewImage(url) {
      uni.previewImage({
        urls: this.order.images || [url]
      });
    },
    promptCancelOrder() {
      // PRD 2.2: 点击【取消工单】：弹出二次确认弹窗「是否取消工单」；确认后更新工单状态，返回列表
      uni.showModal({
        title: '提示',
        content: '是否取消工单？确认后该工单将终止处置流转。',
        confirmText: '确定取消',
        cancelText: '暂不取消',
        success: (res) => {
          if (res.confirm) {
            this.order.status = '已取消';
            this.updateLocalStorage();
            uni.showToast({ title: '工单已取消', icon: 'none' });
            setTimeout(() => {
              uni.navigateBack({ delta: 1 });
            }, 600);
          }
        }
      });
    },
    startOrder() {
      // PRD 2.2: 点击【开始工单】：工单状态变更为【已派工】，跳转至【查看工单（处置页面）】
      this.order.status = '已派工';
      if (!this.order.progress) {
        this.order.progress = {
          currentStep: 2,
          step1Status: "done",
          step2Status: "doing",
          step3Status: "waiting",
          percentage: 66
        };
      } else {
        this.order.progress.currentStep = 2;
        this.order.progress.step1Status = "done";
        this.order.progress.step2Status = "doing";
        this.order.progress.percentage = 66;
      }
      this.updateLocalStorage();

      uni.redirectTo({
        url: `/pages/order/handle?id=${this.order.id}`
      });
    },
    updateLocalStorage() {
      let orders = uni.getStorageSync('gt_work_orders') || [];
      const idx = orders.findIndex(o => o.id === this.order.id);
      if (idx !== -1) {
        orders[idx] = this.order;
      } else {
        orders.unshift(this.order);
      }
      uni.setStorageSync('gt_work_orders', orders);
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

.detail-scroll {
  flex: 1;
  padding: 24rpx;
  box-sizing: border-box;
  padding-bottom: 160rpx;
}

.detail-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #F2F3F5;

    .order-no {
      font-size: 28rpx;
      font-weight: bold;
      color: #1D2129;
    }
    .status-tag {
      font-size: 20rpx;
      font-weight: bold;
      padding: 4rpx 14rpx;
      border-radius: 16rpx;
      &.tag-orange { background-color: #FFF7E8; color: #FA8C16; }
      &.tag-blue { background-color: #E8F3FF; color: #1E6FFF; }
      &.tag-green { background-color: #E8FFEA; color: #00B578; }
      &.tag-gray { background-color: #F2F3F5; color: #86909C; }
    }
  }

  .info-list {
    padding: 16rpx 0;
    .info-item {
      display: flex;
      font-size: 24rpx;
      margin-bottom: 10rpx;
      .info-label {
        color: #86909C;
        width: 140rpx;
      }
      .info-val {
        color: #1D2129;
        flex: 1;
        &.text-red { color: #F53F3F; font-weight: bold; }
      }
    }
  }

  .desc-box {
    background-color: #F7F8FA;
    padding: 16rpx;
    border-radius: 12rpx;
    .desc-label {
      font-size: 22rpx;
      color: #86909C;
      display: block;
      margin-bottom: 6rpx;
    }
    .desc-content {
      font-size: 24rpx;
      color: #1D2129;
      line-height: 1.5;
    }
  }

  .loc-card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 16rpx;

    .loc-title {
      display: flex;
      align-items: center;
      gap: 8rpx;
      .loc-icon { font-size: 30rpx; }
      .loc-heading {
        font-size: 26rpx;
        font-weight: bold;
        color: #1D2129;
      }
    }

    .btn-navigate {
      margin: 0;
      height: 56rpx;
      line-height: 56rpx;
      background: linear-gradient(135deg, #1E6FFF, #3056D3);
      color: #FFFFFF;
      font-size: 22rpx;
      font-weight: bold;
      border-radius: 12rpx;
      padding: 0 24rpx;
      display: flex;
      align-items: center;
      gap: 6rpx;
      .nav-icon { font-size: 24rpx; }
    }
  }

  .loc-address-box {
    background-color: #F7F8FA;
    padding: 16rpx;
    border-radius: 12rpx;
    .loc-name {
      font-size: 24rpx;
      font-weight: bold;
      color: #1D2129;
      display: block;
    }
    .loc-coords {
      font-size: 20rpx;
      color: #86909C;
      margin-top: 6rpx;
      display: block;
    }
  }

  .img-header {
    margin-bottom: 16rpx;
    .img-title {
      font-size: 26rpx;
      font-weight: bold;
      color: #1D2129;
    }
  }

  .img-list {
    display: flex;
    gap: 16rpx;
    .img-item {
      width: 200rpx;
      height: 200rpx;
      border-radius: 16rpx;
      overflow: hidden;
      position: relative;
      background-color: #F2F3F5;

      .img-thumb {
        width: 100%;
        height: 100%;
      }
      .img-badge {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.5);
        color: #FFFFFF;
        font-size: 16rpx;
        text-align: center;
        padding: 4rpx 0;
      }
    }
  }
}

.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 120rpx;
  background-color: #FFFFFF;
  border-top: 1rpx solid #E5E6EB;
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 32rpx;
  box-sizing: border-box;
  z-index: 100;

  .btn {
    flex: 1;
    height: 76rpx;
    line-height: 76rpx;
    font-size: 28rpx;
    font-weight: bold;
    border-radius: 16rpx;
    text-align: center;

    &.btn-cancel-order {
      background-color: #F2F3F5;
      color: #4E5969;
      margin-right: 20rpx;
    }
    &.btn-start-order {
      background-color: #1E6FFF;
      color: #FFFFFF;
    }
  }
}
</style>
