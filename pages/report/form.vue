<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="nav-bar" :style="{ paddingTop: (statusBarHeight || 20) + 'px' }">
      <view class="nav-content">
        <view class="back-btn" @click="handleCancel">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">隐患上报</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <scroll-view scroll-y class="form-scroll">
      <view class="form-card">
        <!-- 事件类型 (必填) -->
        <view class="form-item">
          <view class="item-label">
            <text class="label-text">事件类型</text>
            <text class="required">*</text>
          </view>
          <picker :range="eventTypes" :value="eventTypeIndex" @change="onEventTypeChange">
            <view class="picker-box">
              <text class="picker-value">{{ eventTypes[eventTypeIndex] }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <!-- 事件来源 (必填) -->
        <view class="form-item">
          <view class="item-label">
            <text class="label-text">事件来源</text>
            <text class="required">*</text>
          </view>
          <picker :range="eventSources" :value="eventSourceIndex" @change="onEventSourceChange">
            <view class="picker-box">
              <text class="picker-value">{{ eventSources[eventSourceIndex] }}</text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <!-- 隐患类型 (必填) -->
        <view class="form-item">
          <view class="item-label">
            <text class="label-text">隐患类型</text>
            <text class="required">*</text>
          </view>
          <picker :range="hazardTypes" :value="hazardTypeIndex" @change="onHazardTypeChange">
            <view class="picker-box">
              <text :class="['picker-value', hazardTypeIndex === 0 ? 'placeholder' : '']">
                {{ hazardTypes[hazardTypeIndex] }}
              </text>
              <text class="picker-arrow">›</text>
            </view>
          </picker>
        </view>

        <!-- 隐患描述 (最大200字符，必填，带 0/200 统计) -->
        <view class="form-item no-border">
          <view class="item-label space-between">
            <view class="label-left">
              <text class="label-text">隐患描述</text>
              <text class="required">*</text>
            </view>
            <text class="char-count">{{ description.length }}/200</text>
          </view>
          <textarea
            v-model="description"
            class="textarea-box"
            maxlength="200"
            placeholder="请详细描述隐患现场情况、严重等级及影响范围（最多200字）"
          ></textarea>
        </view>

        <!-- 事件状态 (只读未处理，必填) -->
        <view class="form-item">
          <view class="item-label">
            <text class="label-text">事件状态</text>
            <text class="required">*</text>
          </view>
          <input type="text" value="未处理" disabled class="input-disabled" />
        </view>

        <!-- 上报人 (默认填充当前登录账号) -->
        <view class="form-item">
          <view class="item-label">
            <text class="label-text">上报人</text>
          </view>
          <input type="text" :value="reporter" disabled class="input-disabled" />
        </view>

        <!-- 预警时间 (年月日时分秒，必填) -->
        <view class="form-item">
          <view class="item-label">
            <text class="label-text">预警时间</text>
            <text class="required">*</text>
          </view>
          <input type="text" v-model="warningTime" class="input-box" />
        </view>

        <!-- 巡检范围 / 地图选点 (PRD 1.3) -->
        <view class="form-item">
          <view class="item-label">
            <text class="label-text">巡检范围标记 (隐患位置)</text>
            <text class="required">*</text>
          </view>
          <view class="location-box" @click="goToMapPicker">
            <view class="loc-left">
              <text class="loc-icon">📍</text>
              <view class="loc-info">
                <text class="loc-address">{{ pickedLocation.address }}</text>
                <text class="loc-coords">坐标: {{ pickedLocation.longitude }}, {{ pickedLocation.latitude }}</text>
              </view>
            </view>
            <text class="loc-action">选点定位 ›</text>
          </view>
        </view>

        <!-- 事件图片 (上传并涂鸦标记，PRD 1.4 & 1.5) -->
        <view class="form-item no-border">
          <view class="item-label">
            <text class="label-text">事件图片 (上传并涂鸦标记)</text>
          </view>
          <view class="images-grid">
            <block v-for="(img, idx) in imageList" :key="idx">
              <view class="img-preview">
                <image :src="img" mode="aspectFill" class="img-thumb"></image>
                <text class="img-tag">已标注</text>
                <view class="img-del" @click="removeImage(idx)">×</view>
              </view>
            </block>

            <view class="img-upload-btn" @click="showImageChoice">
              <text class="upload-icon">📷</text>
              <text class="upload-text">添加标注</text>
            </view>
          </view>
          <text class="img-hint">支持使用矩形框、圆形、画笔与文字 T 进行现场隐患涂鸦标记</text>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮 (取消 / 确定) -->
    <view class="bottom-bar">
      <button class="btn btn-cancel" @click="handleCancel">取消</button>
      <button class="btn btn-submit" @click="handleSubmit">确定</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 24,
      eventTypes: ['上报事件', '巡检预警', '安全督查'],
      eventTypeIndex: 0,
      eventSources: ['主动上报', '监控识别', '群众反映'],
      eventSourceIndex: 0,
      hazardTypes: ['请选择隐患类型', '火情隐患', '违章建筑', '设备损毁', '管网泄漏', '道路损毁', '乱堆乱放'],
      hazardTypeIndex: 1, // 默认火情隐患
      description: '',
      reporter: '李伟琦',
      warningTime: '',
      pickedLocation: {
        address: '观天下产业科技园C区3号楼配电房',
        latitude: 39.909230,
        longitude: 116.397428
      },
      imageList: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=600'
      ]
    };
  },
  onLoad() {
    const sys = uni.getSystemInfoSync();
    if (sys && sys.statusBarHeight) {
      this.statusBarHeight = sys.statusBarHeight;
    }
    this.initTime();

    // 监听地图选点回传
    uni.$on('onLocationPicked', (loc) => {
      if (loc) this.pickedLocation = loc;
    });

    // 监听涂鸦完成回传
    uni.$on('onDoodleSaved', (img) => {
      if (img) this.imageList = [img];
    });
  },
  onUnload() {
    uni.$off('onLocationPicked');
    uni.$off('onDoodleSaved');
  },
  methods: {
    initTime() {
      const now = new Date();
      const pad = n => n < 10 ? '0' + n : n;
      this.warningTime = `${now.getFullYear()}-${pad(now.getMonth()+1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
    },
    onEventTypeChange(e) {
      this.eventTypeIndex = e.detail.value;
    },
    onEventSourceChange(e) {
      this.eventSourceIndex = e.detail.value;
    },
    onHazardTypeChange(e) {
      this.hazardTypeIndex = e.detail.value;
    },
    goToMapPicker() {
      uni.navigateTo({
        url: '/pages/report/mapPicker'
      });
    },
    showImageChoice() {
      // PRD 1.4 图片选择弹窗 (相册/拍照/取消)
      uni.showActionSheet({
        itemList: ['从相册选择', '拍照'],
        success: (res) => {
          uni.navigateTo({
            url: '/pages/report/doodle'
          });
        }
      });
    },
    removeImage(idx) {
      this.imageList.splice(idx, 1);
    },
    handleCancel() {
      // PRD 1.2: 弹窗提示 “是否取消填写内容？”，确认返回首页；取消停留在当前页面
      uni.showModal({
        title: '提示',
        content: '是否取消填写内容？确认后将放弃已录入信息并返回首页。',
        confirmText: '确定',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            uni.navigateBack({ delta: 1 });
          }
        }
      });
    },
    handleSubmit() {
      // 触发表单校验
      if (this.hazardTypeIndex === 0) {
        uni.showToast({ title: '请选择隐患类型', icon: 'none' });
        return;
      }
      if (!this.description.trim()) {
        uni.showToast({ title: '请输入隐患描述', icon: 'none' });
        return;
      }
      if (!this.warningTime) {
        uni.showToast({ title: '请确认预警时间', icon: 'none' });
        return;
      }

      uni.showLoading({ title: '正在提交隐患...' });

      const newOrder = {
        id: "GD" + Date.now().toString().slice(-9),
        eventType: this.eventTypes[this.eventTypeIndex],
        eventSource: this.eventSources[this.eventSourceIndex],
        hazardType: this.hazardTypes[this.hazardTypeIndex],
        description: this.description.trim(),
        status: "未处理",
        reporter: this.reporter,
        handler: this.reporter,
        warningTime: this.warningTime,
        location: this.pickedLocation,
        images: this.imageList,
        progress: {
          currentStep: 1,
          step1Status: "doing",
          step2Status: "waiting",
          step3Status: "waiting",
          percentage: 20
        }
      };

      // 存储工单并同步
      let orders = uni.getStorageSync('gt_work_orders') || [];
      orders.unshift(newOrder);
      uni.setStorageSync('gt_work_orders', orders);

      setTimeout(() => {
        uni.hideLoading();
        // PRD 1.6: 1. 后端生成隐患事件并自动创建工单; 2. 前端提示「隐患上报成功」; 3. 返回小程序首页
        uni.showModal({
          title: '上报成功',
          content: `隐患上报成功！已自动创建工单：${newOrder.id}`,
          showCancel: false,
          confirmText: '返回首页',
          success: () => {
            uni.navigateBack({ delta: 1 });
          }
        });
      }, 600);
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

.form-scroll {
  flex: 1;
  padding: 24rpx;
  box-sizing: border-box;
  padding-bottom: 160rpx;
}

.form-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 24rpx 32rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);
}

.form-item {
  padding: 24rpx 0;
  border-bottom: 1rpx solid #F2F3F5;

  &.no-border {
    border-bottom: none;
  }

  .item-label {
    display: flex;
    align-items: center;
    margin-bottom: 12rpx;

    &.space-between {
      justify-content: space-between;
    }

    .label-left {
      display: flex;
      align-items: center;
    }

    .label-text {
      font-size: 26rpx;
      font-weight: bold;
      color: #1D2129;
    }
    .required {
      color: #F53F3F;
      margin-left: 6rpx;
      font-size: 26rpx;
    }
    .char-count {
      font-size: 22rpx;
      color: #86909C;
    }
  }

  .picker-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 16rpx 20rpx;
    background-color: #F7F8FA;
    border-radius: 12rpx;

    .picker-value {
      font-size: 26rpx;
      color: #1D2129;
      &.placeholder {
        color: #86909C;
      }
    }
    .picker-arrow {
      font-size: 28rpx;
      color: #C9CDD4;
    }
  }

  .textarea-box {
    width: 100%;
    height: 160rpx;
    padding: 16rpx;
    background-color: #F7F8FA;
    border-radius: 12rpx;
    font-size: 24rpx;
    color: #1D2129;
    box-sizing: border-box;
  }

  .input-box {
    width: 100%;
    padding: 14rpx 20rpx;
    background-color: #F7F8FA;
    border-radius: 12rpx;
    font-size: 26rpx;
    color: #1D2129;
    box-sizing: border-box;
  }

  .input-disabled {
    width: 100%;
    padding: 14rpx 20rpx;
    background-color: #F2F3F5;
    border-radius: 12rpx;
    font-size: 26rpx;
    color: #86909C;
    box-sizing: border-box;
  }

  .location-box {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 18rpx 20rpx;
    background-color: #F7F8FA;
    border: 1rpx dashed #BEDBFF;
    border-radius: 14rpx;

    .loc-left {
      display: flex;
      align-items: center;
      gap: 12rpx;
      flex: 1;

      .loc-icon {
        font-size: 32rpx;
      }
      .loc-info {
        display: flex;
        flex-direction: column;
        max-width: 440rpx;
        .loc-address {
          font-size: 24rpx;
          font-weight: bold;
          color: #1D2129;
          white-space: nowrap;
          overflow: hidden;
          text-overflow: ellipsis;
        }
        .loc-coords {
          font-size: 18rpx;
          color: #86909C;
          margin-top: 4rpx;
        }
      }
    }

    .loc-action {
      font-size: 22rpx;
      color: #1E6FFF;
      font-weight: bold;
      white-space: nowrap;
    }
  }

  .images-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 12rpx;

    .img-preview {
      width: 140rpx;
      height: 140rpx;
      border-radius: 16rpx;
      position: relative;
      overflow: hidden;

      .img-thumb {
        width: 100%;
        height: 100%;
      }
      .img-tag {
        position: absolute;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: rgba(0, 0, 0, 0.5);
        color: #FFFFFF;
        font-size: 16rpx;
        text-align: center;
        padding: 2rpx 0;
      }
      .img-del {
        position: absolute;
        top: 6rpx;
        right: 6rpx;
        width: 32rpx;
        height: 32rpx;
        background-color: rgba(0, 0, 0, 0.6);
        color: #FFFFFF;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 24rpx;
      }
    }

    .img-upload-btn {
      width: 140rpx;
      height: 140rpx;
      border-radius: 16rpx;
      border: 2rpx dashed #C9CDD4;
      background-color: #F7F8FA;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .upload-icon {
        font-size: 38rpx;
      }
      .upload-text {
        font-size: 18rpx;
        color: #86909C;
        margin-top: 6rpx;
      }
    }
  }

  .img-hint {
    font-size: 20rpx;
    color: #86909C;
    margin-top: 12rpx;
    display: block;
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

    &.btn-cancel {
      background-color: #F2F3F5;
      color: #4E5969;
      margin-right: 20rpx;
    }
    &.btn-submit {
      background-color: #1E6FFF;
      color: #FFFFFF;
    }
  }
}
</style>
