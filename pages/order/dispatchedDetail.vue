<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="nav-bar" :style="{ paddingTop: (statusBarHeight || 20) + 'px' }">
      <view class="nav-content">
        <view class="back-btn" @click="handleBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">我派发的工单 (进度追踪)</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <scroll-view scroll-y class="detail-scroll">
      <!-- 1. 隐患基础信息 (PRD 2.4 只读) -->
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
            <text class="info-val">{{ order.reporter }} (发起人)</text>
          </view>
          <view class="info-item">
            <text class="info-label">预警时间：</text>
            <text class="info-val">{{ order.warningTime }}</text>
          </view>
          <view class="info-item">
            <text class="info-label">隐患位置：</text>
            <text class="info-val">{{ order.location ? order.location.address : '园区核心巡检区域' }}</text>
          </view>
        </view>

        <view class="desc-box">
          <text class="desc-label">隐患描述：</text>
          <text class="desc-content">{{ order.description }}</text>
        </view>
      </view>

      <!-- 2. 原始事件图片与巡检范围地图 (PRD 2.4) -->
      <view class="detail-card">
        <view class="card-title">现场隐患与巡检范围</view>
        <view class="img-wrap">
          <image
            :src="order.images && order.images.length ? order.images[0] : 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=600'"
            mode="aspectFill"
            class="site-img"
          ></image>
        </view>
      </view>

      <!-- 3. 工单进度流程图 (PRD 2.4) -->
      <view class="detail-card">
        <view class="card-title">全生命周期进度节点</view>
        <view class="timeline-row">
          <view class="time-step">
            <text class="step-icon done">✓</text>
            <text class="step-txt done">1. 上报发起</text>
          </view>
          <view class="time-line done"></view>
          <view class="time-step">
            <text :class="['step-icon', order.status !== '未处理' ? 'done' : 'doing']">
              {{ order.status !== '未处理' ? '✓' : '2' }}
            </text>
            <text :class="['step-txt', order.status !== '未处理' ? 'done' : 'doing']">2. 派工处置</text>
          </view>
          <view class="time-line" :class="order.status === '已完成' ? 'done' : ''"></view>
          <view class="time-step">
            <text :class="['step-icon', order.status === '已完成' ? 'done' : 'waiting']">
              {{ order.status === '已完成' ? '✓' : '3' }}
            </text>
            <text :class="['step-txt', order.status === '已完成' ? 'done' : 'waiting']">3. 完结归档</text>
          </view>
        </view>
      </view>

      <!-- 4. 处置措施、处置前后对比图、隐患处置结论、处置人、处置时间 (点击完成工单后才展示，PRD 2.4) -->
      <view v-if="order.status === '已完成' && order.handling" class="detail-card finish-card">
        <view class="card-title">现场处置记录 (已归档)</view>
        <view class="record-list">
          <view class="record-item">
            <text class="rec-label">处置人员：</text>
            <text class="rec-val font-bold">{{ order.handler || '李伟琦' }}</text>
          </view>
          <view class="record-item">
            <text class="rec-label">完结时间：</text>
            <text class="rec-val">{{ order.finishTime || '2026-07-30 16:45:30' }}</text>
          </view>
          <view class="record-item">
            <text class="rec-label">处置措施：</text>
            <text class="rec-val">{{ order.handling.action }}</text>
          </view>
          <view class="record-item">
            <text class="rec-label">处置结论：</text>
            <text class="rec-val text-green font-bold">{{ order.handling.conclusion }}</text>
          </view>
        </view>

        <!-- 处置前后对比图 -->
        <view class="comparison-section">
          <text class="comp-title">现场处置前后对比照片：</text>
          <view class="comp-grid">
            <view class="comp-box">
              <text class="comp-label">处置前</text>
              <image
                :src="(order.handling.beforeImages && order.handling.beforeImages[0]) || order.images[0]"
                mode="aspectFill"
                class="comp-img"
              ></image>
            </view>
            <view class="comp-box">
              <text class="comp-label">处置后</text>
              <image
                :src="(order.handling.afterImages && order.handling.afterImages[0]) || 'https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600'"
                mode="aspectFill"
                class="comp-img"
              ></image>
            </view>
          </view>
        </view>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 24,
      order: {
        id: "GD20260730008",
        eventType: "上报事件",
        eventSource: "群众反映",
        hazardType: "道路损毁",
        description: "园区主干道与2号路交汇处沥青路面沉降塌陷形成深坑，雨天积水易引发车辆爆胎与行人跌倒事故。",
        status: "已完成",
        reporter: "李伟琦",
        handler: "李伟琦",
        warningTime: "2026-07-30 14:02:18",
        finishTime: "2026-07-30 16:45:30",
        location: { address: "观天下大道与迎宾路十字路口东50米", latitude: 39.897451, longitude: 116.388123 },
        images: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600"],
        handling: {
          action: "已调派沥青冷补料与市政工程养护车，完成路基夯实回填与沥青摊铺压实，平整度符合安全通行标准。",
          beforeImages: ["https://images.unsplash.com/photo-1515162816999-a0c47dc192f7?w=600"],
          afterImages: ["https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600"],
          conclusion: "现场深坑隐患彻底填平压实，防撞反光警示锥撤除，主干道恢复正常双向顺畅通行。"
        }
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

  .card-title {
    font-size: 26rpx;
    font-weight: bold;
    color: #1D2129;
    margin-bottom: 16rpx;
  }

  .info-list {
    padding: 16rpx 0;
    .info-item {
      display: flex;
      font-size: 24rpx;
      margin-bottom: 8rpx;
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

  .img-wrap {
    width: 100%;
    height: 260rpx;
    border-radius: 16rpx;
    overflow: hidden;
    background-color: #F2F3F5;
    .site-img {
      width: 100%;
      height: 100%;
    }
  }

  .timeline-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 10rpx 20rpx;

    .time-step {
      display: flex;
      flex-direction: column;
      align-items: center;
      .step-icon {
        width: 48rpx;
        height: 48rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
        font-weight: bold;
        margin-bottom: 8rpx;

        &.done { background-color: #00B578; color: #FFFFFF; }
        &.doing { background-color: #1E6FFF; color: #FFFFFF; }
        &.waiting { background-color: #F2F3F5; color: #86909C; }
      }
      .step-txt {
        font-size: 20rpx;
        color: #86909C;
        &.done { color: #00B578; font-weight: bold; }
        &.doing { color: #1E6FFF; font-weight: bold; }
      }
    }

    .time-line {
      flex: 1;
      height: 4rpx;
      background-color: #E5E6EB;
      margin: 0 12rpx -24rpx;
      &.done {
        background-color: #00B578;
      }
    }
  }
}

.finish-card {
  border: 1rpx solid #E8FFEA;

  .record-list {
    padding: 8rpx 0;
    .record-item {
      display: flex;
      font-size: 24rpx;
      margin-bottom: 8rpx;
      .rec-label {
        color: #86909C;
        width: 140rpx;
      }
      .rec-val {
        color: #1D2129;
        flex: 1;
        &.text-green { color: #00B578; }
        &.font-bold { font-weight: bold; }
      }
    }
  }

  .comparison-section {
    margin-top: 16rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid #F2F3F5;

    .comp-title {
      font-size: 22rpx;
      color: #86909C;
      display: block;
      margin-bottom: 12rpx;
    }
    .comp-grid {
      display: flex;
      gap: 16rpx;

      .comp-box {
        flex: 1;
        display: flex;
        flex-direction: column;
        .comp-label {
          font-size: 20rpx;
          color: #4E5969;
          font-weight: bold;
          margin-bottom: 6rpx;
        }
        .comp-img {
          width: 100%;
          height: 180rpx;
          border-radius: 12rpx;
          background-color: #F2F3F5;
        }
      }
    }
  }
}
</style>
