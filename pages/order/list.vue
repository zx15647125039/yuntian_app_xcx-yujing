<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="nav-bar" :style="{ paddingTop: (statusBarHeight || 20) + 'px' }">
      <view class="nav-content">
        <view class="back-btn" @click="handleBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">工单派发</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <!-- 顶部 Tab 栏 (PRD 2.1: Tab1 我收到的工单, Tab2 我派发的工单) -->
    <view class="tab-header">
      <view
        :class="['tab-btn', currentTab === 'received' ? 'active' : '']"
        @click="switchTab('received')"
      >
        <text class="tab-label">我收到的工单</text>
      </view>
      <view
        :class="['tab-btn', currentTab === 'dispatched' ? 'active' : '']"
        @click="switchTab('dispatched')"
      >
        <text class="tab-label">我派发的工单</text>
      </view>
    </view>

    <!-- 筛选控件 (PRD 2.1: 左侧预警类型, 右侧工单状态) -->
    <view class="filter-bar">
      <!-- 左侧下拉：预警类型 -->
      <picker :range="hazardTypeList" :value="hazardTypeIndex" @change="onHazardTypeChange" class="filter-picker">
        <view class="picker-inner">
          <text class="picker-text">{{ hazardTypeList[hazardTypeIndex] }}</text>
          <text class="arrow-down">▾</text>
        </view>
      </picker>

      <!-- 右侧下拉：工单状态 -->
      <picker :range="statusList" :value="statusIndex" @change="onStatusChange" class="filter-picker">
        <view class="picker-inner">
          <text class="picker-text">{{ statusList[statusIndex] }}</text>
          <text class="arrow-down">▾</text>
        </view>
      </picker>
    </view>

    <!-- 工单卡片列表 -->
    <scroll-view scroll-y class="orders-scroll">
      <block v-for="order in filteredOrders" :key="order.id">
        <view class="order-card">
          <!-- 头部卡片信息 -->
          <view class="card-header">
            <text class="order-no">{{ order.id }}</text>
            <text :class="['status-tag', getStatusClass(order.status)]">{{ order.status }}</text>
          </view>

          <!-- 字段内容 (工单编号、事件类型、事件来源、隐患类型、预警时间) -->
          <view class="card-body">
            <view class="field-row">
              <text class="field-label">事件类型：</text>
              <text class="field-value">{{ order.eventType }}</text>
            </view>
            <view class="field-row">
              <text class="field-label">事件来源：</text>
              <text class="field-value">{{ order.eventSource }}</text>
            </view>
            <view class="field-row">
              <text class="field-label">隐患类型：</text>
              <text class="field-value text-red">{{ order.hazardType }}</text>
            </view>
            <view class="field-row">
              <text class="field-label">预警时间：</text>
              <text class="field-value">{{ order.warningTime }}</text>
            </view>
            <view class="field-row">
              <text class="field-label">隐患位置：</text>
              <text class="field-value text-ellipsis">{{ order.location ? order.location.address : '园区核心巡检区域' }}</text>
            </view>
          </view>

          <!-- 描述摘要 -->
          <view class="card-desc">
            {{ order.description }}
          </view>

          <!-- 卡片按钮规则 (PRD 2.1) -->
          <view class="card-footer">
            <block v-if="currentTab === 'dispatched'">
              <button class="action-btn btn-view" @click="goToDispatchedDetail(order)">
                查看工单追踪
              </button>
            </block>
            <block v-else>
              <!-- 1. 状态【未处理】：显示【开始工单】按钮 -->
              <button
                v-if="order.status === '未处理'"
                class="action-btn btn-start"
                @click="goToDetail(order)"
              >
                开始工单
              </button>

              <!-- 2. 状态【已派工】：显示【更换设备】、【查看工单】按钮 -->
              <block v-if="order.status === '已派工'">
                <button class="action-btn btn-device" @click="changeDevice(order)">
                  更换设备
                </button>
                <button class="action-btn btn-view" @click="goToHandle(order)">
                  查看工单
                </button>
              </block>

              <!-- 3. 状态【已完成】：仅显示【查看工单】按钮 -->
              <button
                v-if="order.status === '已完成'"
                class="action-btn btn-finish-view"
                @click="goToDispatchedDetail(order)"
              >
                查看工单
              </button>
            </block>
          </view>
        </view>
      </block>

      <view v-if="!filteredOrders.length" class="empty-box">
        <text class="empty-icon">📂</text>
        <text class="empty-text">暂无符合条件的工单</text>
      </view>
    </scroll-view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 24,
      currentTab: 'received', // received | dispatched
      hazardTypeList: ['预警类型 (全部)', '火情隐患', '违章建筑', '设备损毁', '管网泄漏', '道路损毁', '乱堆乱放'],
      hazardTypeIndex: 0,
      statusList: ['工单状态 (全部)', '未处理', '已派工', '已完成'],
      statusIndex: 0,
      allOrders: [
        {
          id: "GD20260731001",
          eventType: "上报事件",
          eventSource: "主动上报",
          hazardType: "火情隐患",
          description: "西侧产业园区3号仓库外围堆放大量易燃木质包装材料，临近高压变电箱，存在严重夏季火情隐患。",
          status: "未处理",
          reporter: "李伟琦",
          warningTime: "2026-07-31 09:25:10",
          location: { address: "观天下产业科技园C区3号楼配电房旁", latitude: 39.90923, longitude: 116.397428 }
        },
        {
          id: "GD20260731002",
          eventType: "巡检预警",
          eventSource: "监控识别",
          hazardType: "违章建筑",
          description: "无人机日常航拍巡检发现东区施工红线外存在擅自搭建彩钢板房，占用消防应急救援通道。",
          status: "已派工",
          reporter: "王巡检员",
          warningTime: "2026-07-31 10:14:32",
          location: { address: "滨江生态示范区东段沿江绿道7号岗亭旁", latitude: 39.918231, longitude: 116.412845 }
        },
        {
          id: "GD20260730008",
          eventType: "上报事件",
          eventSource: "群众反映",
          hazardType: "道路损毁",
          description: "园区主干道与2号路交汇处沥青路面沉降塌陷形成深坑，雨天积水易引发车辆爆胎与行人跌倒事故。",
          status: "已完成",
          reporter: "李伟琦",
          warningTime: "2026-07-30 14:02:18",
          finishTime: "2026-07-30 16:45:30",
          location: { address: "观天下大道与迎宾路十字路口东50米", latitude: 39.897451, longitude: 116.388123 },
          handling: {
            action: "已调派沥青冷补料与市政工程养护车，完成路基夯实与沥青摊铺压实。",
            conclusion: "现场隐患彻底清除，交通警示锥撤除，恢复双向通行。"
          }
        }
      ]
    };
  },
  computed: {
    filteredOrders() {
      let list = [...this.allOrders];

      // 区分 我收到的工单 / 我派发的工单
      if (this.currentTab === 'dispatched') {
        list = list.filter(o => o.reporter === '李伟琦');
      }

      // 预警类型筛选
      if (this.hazardTypeIndex > 0) {
        const type = this.hazardTypeList[this.hazardTypeIndex];
        list = list.filter(o => o.hazardType === type);
      }

      // 工单状态筛选
      if (this.statusIndex > 0) {
        const st = this.statusList[this.statusIndex];
        list = list.filter(o => o.status === st);
      }

      return list;
    }
  },
  onLoad(options) {
    const sys = uni.getSystemInfoSync();
    if (sys && sys.statusBarHeight) {
      this.statusBarHeight = sys.statusBarHeight;
    }
    if (options) {
      if (options.tab) {
        this.currentTab = options.tab;
      }
      if (options.status) {
        const decodedStatus = decodeURIComponent(options.status);
        const idx = this.statusList.indexOf(decodedStatus);
        if (idx >= 0) {
          this.statusIndex = idx;
        }
      }
    }
  },
  onShow() {
    this.syncStorageOrders();
  },
  methods: {
    syncStorageOrders() {
      const stored = uni.getStorageSync('gt_work_orders');
      if (stored && stored.length) {
        this.allOrders = stored;
      } else {
        uni.setStorageSync('gt_work_orders', this.allOrders);
      }
    },
    switchTab(tab) {
      this.currentTab = tab;
    },
    onHazardTypeChange(e) {
      this.hazardTypeIndex = e.detail.value;
    },
    onStatusChange(e) {
      this.statusIndex = e.detail.value;
    },
    getStatusClass(st) {
      if (st === '未处理') return 'tag-orange';
      if (st === '已派工') return 'tag-blue';
      if (st === '已完成') return 'tag-green';
      return 'tag-gray';
    },
    handleBack() {
      uni.navigateBack({ delta: 1 });
    },
    goToDetail(order) {
      // 1. 点击【开始工单】：跳转至【工单详情页面】
      uni.navigateTo({
        url: `/pages/order/detail?id=${order.id}`
      });
    },
    goToHandle(order) {
      // 2. 点击【查看工单】：跳转至【工单处置填写页面】
      uni.navigateTo({
        url: `/pages/order/handle?id=${order.id}`
      });
    },
    goToDispatchedDetail(order) {
      uni.navigateTo({
        url: `/pages/order/dispatchedDetail?id=${order.id}`
      });
    },
    changeDevice(order) {
      // 点击【更换设备】
      uni.showActionSheet({
        itemList: ['大疆 M350 RTK (红外云台)', '大疆 Mavic 3 行业版', '防爆智能手持巡检仪 GT-08'],
        success: (res) => {
          const devs = ['大疆 M350 RTK', '大疆 Mavic 3 行业版', '防爆智能手持巡检仪 GT-08'];
          uni.showToast({
            title: `设备已更换为: ${devs[res.tapIndex]}`,
            icon: 'none'
          });
        }
      });
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
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

.tab-header {
  display: flex;
  background-color: #FFFFFF;
  padding: 16rpx 32rpx;
  border-bottom: 1rpx solid #F2F3F5;

  .tab-btn {
    flex: 1;
    text-align: center;
    padding: 14rpx 0;
    font-size: 26rpx;
    color: #4E5969;
    background-color: #F2F3F5;
    border-radius: 12rpx;
    margin: 0 8rpx;

    &.active {
      background-color: #1E6FFF;
      color: #FFFFFF;
      font-weight: bold;
    }
  }
}

.filter-bar {
  display: flex;
  gap: 16rpx;
  padding: 16rpx 24rpx;
  background-color: #FFFFFF;
  border-bottom: 1rpx solid #E5E6EB;

  .filter-picker {
    flex: 1;
    .picker-inner {
      display: flex;
      align-items: center;
      justify-content: space-between;
      background-color: #F7F8FA;
      padding: 12rpx 20rpx;
      border-radius: 12rpx;
      .picker-text {
        font-size: 22rpx;
        color: #4E5969;
      }
      .arrow-down {
        font-size: 20rpx;
        color: #86909C;
      }
    }
  }
}

.orders-scroll {
  flex: 1;
  padding: 24rpx;
  box-sizing: border-box;
}

.order-card {
  background-color: #FFFFFF;
  border-radius: 20rpx;
  padding: 24rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

  .card-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding-bottom: 16rpx;
    border-bottom: 1rpx solid #F2F3F5;

    .order-no {
      font-size: 26rpx;
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

  .card-body {
    padding: 16rpx 0;
    .field-row {
      display: flex;
      font-size: 24rpx;
      margin-bottom: 8rpx;
      .field-label {
        color: #86909C;
        width: 140rpx;
      }
      .field-value {
        color: #1D2129;
        flex: 1;
        &.text-red { color: #F53F3F; font-weight: bold; }
        &.text-ellipsis {
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
      }
    }
  }

  .card-desc {
    font-size: 22rpx;
    color: #4E5969;
    background-color: #F7F8FA;
    padding: 16rpx;
    border-radius: 12rpx;
    margin-bottom: 16rpx;
    line-height: 1.5;
  }

  .card-footer {
    display: flex;
    justify-content: flex-end;
    gap: 16rpx;
    border-top: 1rpx solid #F2F3F5;
    padding-top: 16rpx;

    .action-btn {
      margin: 0;
      height: 60rpx;
      line-height: 60rpx;
      font-size: 24rpx;
      font-weight: bold;
      padding: 0 28rpx;
      border-radius: 12rpx;

      &.btn-start {
        background-color: #1E6FFF;
        color: #FFFFFF;
      }
      &.btn-device {
        background-color: #F2F3F5;
        color: #4E5969;
      }
      &.btn-view {
        background-color: #1E6FFF;
        color: #FFFFFF;
      }
      &.btn-finish-view {
        background-color: #00B578;
        color: #FFFFFF;
      }
    }
  }
}

.empty-box {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  padding: 80rpx 0;

  .empty-icon {
    font-size: 64rpx;
    margin-bottom: 16rpx;
  }
  .empty-text {
    font-size: 26rpx;
    color: #86909C;
  }
}
</style>
