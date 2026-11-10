<template>
  <view class="template-clock">
    <!-- 顶部状态栏与标题 -->
    <view class="header-card neu-outset">
      <view class="header-flex">
        <view class="header-title-box">
          <text class="header-title">隐患快速上报</text>
          <text class="header-subtitle">标准化处置闭环 · 自动生成工单编号</text>
        </view>
        <view class="status-badge">
          <text class="badge-dot"></text>
          <text class="badge-text">处理中枢</text>
        </view>
      </view>
    </view>

    <!-- 表单卡片容器 -->
    <view class="form-card neu-outset">
      <!-- 字段 1: 事件类型 -->
      <view class="form-item">
        <view class="form-label-row">
          <text class="form-label">事件类型</text>
          <text class="required-star">*</text>
        </view>
        <picker :range="eventTypes" :value="eventTypeIndex" @change="onEventTypeChange">
          <view class="picker-input neu-inset">
            <text class="picker-text">{{ eventTypes[eventTypeIndex] }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>

      <!-- 字段 2: 事件来源 -->
      <view class="form-item">
        <view class="form-label-row">
          <text class="form-label">事件来源</text>
          <text class="required-star">*</text>
        </view>
        <picker :range="eventSources" :value="eventSourceIndex" @change="onEventSourceChange">
          <view class="picker-input neu-inset">
            <text class="picker-text">{{ eventSources[eventSourceIndex] }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>

      <!-- 字段 3: 隐患类型 -->
      <view class="form-item">
        <view class="form-label-row">
          <text class="form-label">隐患类型</text>
          <text class="required-star">*</text>
        </view>
        <picker :range="hazardTypes" :value="hazardTypeIndex" @change="onHazardTypeChange">
          <view class="picker-input neu-inset">
            <text class="picker-text text-red-bold">{{ hazardTypes[hazardTypeIndex] }}</text>
            <text class="picker-arrow">▼</text>
          </view>
        </picker>
      </view>

      <!-- 字段 4: 只读字段 (上报人员 & 预警时间 & 状态) -->
      <view class="form-row-2">
        <view class="form-item half">
        
          <text class="form-label">上报人员</text>
          <view class="readonly-box neu-inset">
            <text class="readonly-text">李伟琦</text>
            <text class="readonly-tag">主管</text>
          </view>
        </view>
        <view class="form-item half">
          <text class="form-label">工单状态</text>
          <view class="readonly-box neu-inset">
            <text class="readonly-text status-text-amber">未处理</text>
            <text class="status-indicator-dot"></text>
          </view>
        </view>
      </view>

      <view class="form-item">
        <text class="form-label">实时预警时间</text>
        <view class="readonly-box neu-inset">
          <text class="readonly-time font-mono">{{ currentTime }}</text>
          <text class="time-refresh" @click="refreshTime">↻ 更新</text>
        </view>
      </view>

      <!-- 字段 5: 巡检范围地图选点 (直接唤起小程序原生地图选点组件) -->
      <view class="form-item">
        <view class="form-label-row">
          <text class="form-label">巡检范围 / 隐患地点</text>
          <text class="required-star">*</text>
        </view>
        <view class="map-picker-trigger neu-outset" @click="openNativeChooseLocation">
          <view class="map-info">
            <text class="map-icon">📍</text>
            <view class="map-text-col">
              <text class="map-address">{{ selectedAddress || '点击唤起原生地图选点' }}</text>
              <text class="map-coords" v-if="selectedAddressDetail">详细地址: {{ selectedAddressDetail }}</text>
            </view>
          </view>
          <text class="map-btn-link">原生选点 ➔</text>
        </view>
      </view>

      <!-- 字段 6: 隐患描述 (200字限制 & 实时字数) -->
      <view class="form-item">
        <view class="form-label-row">
          <text class="form-label">隐患详细描述</text>
          <text class="required-star">*</text>
          <text :class="['word-count', description.length >= 200 ? 'text-red' : '']">
            {{ description.length }}/200
          </text>
        </view>
        <view class="textarea-box neu-inset" :class="{ 'error-border': descError }">
          <textarea
            v-model="description"
            maxlength="200"
            placeholder="请详细描述现场隐患位置、紧急程度、潜在次生风险及需协同处置资源（限200字）"
            class="form-textarea"
            @input="descError = false"
          />
        </view>
      </view>

      <!-- 字段 7: 现场照片与 Canvas 涂鸦标注 (PRD 1.4 & 1.5) -->
      <view class="form-item">
        <view class="form-label-row">
          <text class="form-label">现场照片与标注</text>
          <text class="label-hint">(支持矩形框、圆形、画笔及文字涂鸦)</text>
        </view>

        <view class="photo-list">
          <view v-for="(photo, idx) in photoList" :key="idx" class="photo-item neu-outset">
            <image :src="photo" mode="aspectFill" class="photo-img"></image>
            <view class="photo-delete" @click="deletePhoto(idx)">✕</view>
            <view class="photo-badge" v-if="idx === 0">已涂鸦标注</view>
          </view>

          <view class="photo-add-btn neu-inset" @click="chooseImageSource">
            <text class="add-icon">📷</text>
            <text class="add-text">添加/标注</text>
          </view>
        </view>
      </view>

      <!-- 底部操作按钮: 取消防误触 & 确定提交 -->
      <view class="button-group">
        <button class="btn-cancel neu-outset" @click="handleCancel">
          取消
        </button>
        <button class="btn-submit" @click="handleSubmit">
          确定上报 (生成工单)
        </button>
      </view>
    </view>

    <!-- 取消二次确认防误触弹窗 -->
    <view v-if="showCancelConfirmModal" class="modal-mask">
      <view class="confirm-dialog neu-outset">
        <text class="confirm-title">放弃隐患填报？</text>
        <text class="confirm-desc">当前已录入的信息将不会被保存，是否确定放弃？</text>
        <view class="dialog-btn-row">
          <button class="dialog-btn-no" @click="showCancelConfirmModal = false">继续填报</button>
          <button class="dialog-btn-yes" @click="confirmCancel">确定放弃</button>
        </view>
      </view>
    </view>

    <!-- 成功提交生成工单提示弹窗 -->
    <view v-if="showSuccessModal" class="modal-mask">
      <view class="success-dialog neu-outset">
        <view class="success-icon">✓</view>
        <text class="success-title">隐患上报成功</text>
        <text class="success-id">工单编号: {{ generatedOrderId }}</text>
        <text class="success-tip">已进入「待处理」状态并分派至巡检处置列表</text>
        <view class="dialog-btn-row">
          <button class="dialog-btn-primary" @click="jumpToOrderList">前往工单派发中心</button>
        </view>
      </view>
    </view>

    <view class="bottom-placeholder"></view>
  </view>
</template>

<script>
export default {
  name: 'PageB',
  data() {
    return {
      eventTypes: ['日常巡检', '群众举报', '设备传感器预警', '专项督查'],
      eventTypeIndex: 0,
      eventSources: ['人工巡查', '无人机巡检', '监控摄像识别', '社区网格员'],
      eventSourceIndex: 0,
      hazardTypes: ['消防隐患', '设施损坏', '安全通道堵塞', '电气线路裸露', '违规施工'],
      hazardTypeIndex: 0,

      currentTime: '',
      description: '',
      descError: false,

      // 原生地图选点回填的真实 POI 名称、详细地址与经纬度
      hasPickedLocation: false,
      pickerLat: 0,
      pickerLng: 0,
      selectedAddress: '',
      selectedAddressDetail: '',
      selectedCoords: '',

      photoList: [
        'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=400'
      ],

      showCancelConfirmModal: false,
      showSuccessModal: false,
      generatedOrderId: ''
    };
  },
  created() {
    this.refreshTime();
  },
  methods: {
    refreshTime() {
      const now = new Date();
      const pad = n => (n < 10 ? '0' + n : n);
      this.currentTime = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())} ${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
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

    // 直接唤起小程序原生地图选点组件 (uni.chooseLocation) 获取真实 POI 名称与详细地址
    openNativeChooseLocation() {
      const options = {
        success: (res) => {
          if (res && (res.name || res.address)) {
            this.hasPickedLocation = true;
            this.pickerLng = Number(Number(res.longitude || 0).toFixed(6));
            this.pickerLat = Number(Number(res.latitude || 0).toFixed(6));
            this.selectedAddress = res.name || res.address;
            this.selectedAddressDetail = res.address || res.name;
            this.selectedCoords = `${this.pickerLng.toFixed(6)}, ${this.pickerLat.toFixed(6)}`;
            uni.showToast({
              title: '已选定位置',
              icon: 'success'
            });
          }
        },
        fail: (err) => {
          if (err && err.errMsg && err.errMsg.indexOf('auth deny') !== -1) {
            uni.showModal({
              title: '需要位置权限',
              content: '请在小程序设置中开启位置信息权限，以便打开原生地图选择真实位置',
              confirmText: '去设置',
              success: (modalRes) => {
                if (modalRes.confirm && typeof uni.openSetting === 'function') {
                  uni.openSetting({});
                }
              }
            });
          }
        }
      };

      // 若已选过位置则默认定位在上次所选坐标，否则自动定位至用户当前真实位置
      if (this.hasPickedLocation && this.pickerLat && this.pickerLng) {
        options.latitude = this.pickerLat;
        options.longitude = this.pickerLng;
      }

      uni.chooseLocation(options);
    },

    chooseImageSource() {
      uni.showActionSheet({
        itemList: ['拍摄现场照片并标注', '从相册选择照片并标注'],
        success: () => {
          this.mockAddAnnotatedPhoto();
        }
      });
    },
    mockAddAnnotatedPhoto() {
      this.photoList.push('https://images.unsplash.com/photo-1590496793929-36417d3117de?w=400');
      uni.showToast({ title: '照片已涂鸦标注完成', icon: 'none' });
    },
    deletePhoto(idx) {
      this.photoList.splice(idx, 1);
    },
    handleCancel() {
      this.showCancelConfirmModal = true;
    },
    confirmCancel() {
      this.showCancelConfirmModal = false;
      this.description = '';
      this.descError = false;
      uni.showToast({ title: '已清空本次填报', icon: 'none' });
      if (this.$parent && typeof this.$parent.changeTabbar === 'function') {
        this.$parent.changeTabbar(0);
      }
    },
    handleSubmit() {
      if (!this.selectedAddress) {
        uni.showToast({ title: '请点击原生选点选择隐患位置', icon: 'none' });
        return;
      }
      if (!this.description.trim()) {
        this.descError = true;
        uni.showToast({ title: '请填写隐患详细描述', icon: 'none' });
        return;
      }
      // 生成规范工单 ID，如 GD20261104...
      const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
      const randStr = Math.floor(100 + Math.random() * 900);
      this.generatedOrderId = `GD${dateStr}${randStr}`;

      this.showSuccessModal = true;
    },
    jumpToOrderList() {
      this.showSuccessModal = false;
      this.description = '';
      if (this.$parent && typeof this.$parent.changeTabbar === 'function') {
        this.$parent.changeTabbar(2);
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
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-rendering: optimizeLegibility;
}

.header-card {
  padding: 24rpx;
  border-radius: 20rpx;
  margin-bottom: 24rpx;
}

.header-flex {
  display: flex;
  align-items: center;
  justify-content: space-between;
}

.header-title-box {
  display: flex;
  flex-direction: column;
}

.header-title {
  font-size: 34rpx;
  font-weight: 800;
  color: #0F172A;
}

.header-subtitle {
  font-size: 22rpx;
  color: #334155;
  font-weight: 500;
  margin-top: 4rpx;
}

.status-badge {
  display: flex;
  align-items: center;
  gap: 8rpx;
  background-color: #EFF6FF;
  padding: 6rpx 16rpx;
  border-radius: 30rpx;
}

.badge-dot {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background-color: #1E6FFF;
}

.badge-text {
  font-size: 22rpx;
  font-weight: bold;
  color: #1E6FFF;
}

.form-card {
  padding: 28rpx;
  border-radius: 24rpx;
  display: flex;
  flex-direction: column;
  gap: 24rpx;
}

.form-item {
  display: flex;
  flex-direction: column;
  gap: 10rpx;
}

.form-row-2 {
  display: flex;
  gap: 20rpx;
}

.half {
  flex: 1;
}

.form-label-row {
  display: flex;
  align-items: center;
  gap: 8rpx;
}

.form-label {
  font-size: 26rpx;
  font-weight: 800;
  color: #0F172A;
}

.required-star {
  color: #EF4444;
  font-weight: bold;
  font-size: 26rpx;
}

.label-hint {
  font-size: 22rpx;
  color: #475569;
}

.word-count {
  margin-left: auto;
  font-size: 22rpx;
  color: #334155;
  font-family: monospace;
}

.text-red {
  color: #EF4444 !important;
  font-weight: bold;
}

.text-red-bold {
  color: #DC2626 !important;
  font-weight: bold;
}

.picker-input {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 20rpx;
  border-radius: 16rpx;
}

.picker-text {
  font-size: 26rpx;
  font-weight: 600;
  color: #0F172A;
}

.picker-arrow {
  font-size: 20rpx;
  color: #475569;
}

.readonly-box {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18rpx 20rpx;
  border-radius: 16rpx;
}

.readonly-text {
  font-size: 26rpx;
  font-weight: 800;
  color: #0F172A;
}

.readonly-tag {
  font-size: 18rpx;
  background-color: #E0E7FF;
  color: #1E6FFF;
  padding: 2rpx 10rpx;
  border-radius: 8rpx;
  font-weight: bold;
}

.status-text-amber {
  color: #D97706;
}

.status-indicator-dot {
  width: 14rpx;
  height: 14rpx;
  border-radius: 50%;
  background-color: #F59E0B;
}

.readonly-time {
  font-size: 22rpx;
  color: #4B5563;
}

.time-refresh {
  font-size: 20rpx;
  color: #1E6FFF;
  font-weight: bold;
}

.map-picker-trigger {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 20rpx;
  border-radius: 18rpx;
}

.map-info {
  display: flex;
  align-items: center;
  gap: 14rpx;
  flex: 1;
}

.map-icon {
  font-size: 32rpx;
}

.map-text-col {
  display: flex;
  flex-direction: column;
  gap: 4rpx;
}

.map-address {
  font-size: 24rpx;
  font-weight: bold;
  color: #1F2937;
}

.map-coords {
  font-size: 18rpx;
  color: #6B7280;
}

.map-btn-link {
  font-size: 22rpx;
  color: #059669;
  font-weight: bold;
}

.textarea-box {
  border-radius: 18rpx;
  padding: 16rpx;
}

.form-textarea {
  width: 100%;
  height: 160rpx;
  font-size: 24rpx;
  color: #394963;
  line-height: 1.4;
}

.error-border {
  border: 1px solid #EF4444;
}

.photo-list {
  display: flex;
  align-items: center;
  gap: 16rpx;
  flex-wrap: wrap;
}

.photo-item {
  width: 130rpx;
  height: 130rpx;
  border-radius: 16rpx;
  position: relative;
  overflow: hidden;
}

.photo-img {
  width: 100%;
  height: 100%;
}

.photo-delete {
  position: absolute;
  top: 4rpx;
  right: 4rpx;
  width: 32rpx;
  height: 32rpx;
  border-radius: 50%;
  background-color: rgba(0, 0, 0, 0.6);
  color: #FFF;
  font-size: 18rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}

.photo-badge {
  position: absolute;
  bottom: 0;
  left: 0;
  right: 0;
  background-color: rgba(30, 111, 255, 0.8);
  color: #FFF;
  font-size: 16rpx;
  text-align: center;
  padding: 2rpx 0;
}

.photo-add-btn {
  width: 130rpx;
  height: 130rpx;
  border-radius: 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 6rpx;
}

.add-icon {
  font-size: 34rpx;
}

.add-text {
  font-size: 18rpx;
  color: #7E8B9B;
}

.button-group {
  display: flex;
  gap: 20rpx;
  margin-top: 10rpx;
}

.btn-cancel {
  flex: 1;
  font-size: 26rpx;
  font-weight: bold;
  color: #4B5563;
  padding: 20rpx 0;
  border-radius: 18rpx;
  line-height: 1.4;
}

.btn-submit {
  flex: 2;
  font-size: 26rpx;
  font-weight: bold;
  background-color: #1E6FFF;
  color: #FFF;
  padding: 20rpx 0;
  border-radius: 18rpx;
  line-height: 1.4;
  box-shadow: 0 4rpx 12rpx rgba(30, 111, 255, 0.35);
}

/* 弹窗通用 */
.modal-mask {
  position: fixed;
  inset: 0;
  background-color: rgba(0, 0, 0, 0.6);
  z-index: 99999;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 30rpx;
}

/* 确认对话框 */
.confirm-dialog {
  width: 100%;
  max-width: 580rpx;
  border-radius: 24rpx;
  padding: 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 16rpx;
}

.confirm-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1F2937;
}

.confirm-desc {
  font-size: 22rpx;
  color: #6B7280;
  line-height: 1.4;
  margin-bottom: 12rpx;
}

.dialog-btn-row {
  display: flex;
  width: 100%;
  gap: 18rpx;
}

.dialog-btn-no {
  flex: 1;
  font-size: 24rpx;
  color: #4B5563;
  background-color: #E5E7EB;
  border-radius: 14rpx;
  border: none;
}

.dialog-btn-yes {
  flex: 1;
  font-size: 24rpx;
  color: #FFF;
  background-color: #DC2626;
  border-radius: 14rpx;
  border: none;
}

/* 成功对话框 */
.success-dialog {
  width: 100%;
  max-width: 580rpx;
  border-radius: 24rpx;
  padding: 36rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  gap: 14rpx;
}

.success-icon {
  width: 80rpx;
  height: 80rpx;
  border-radius: 50%;
  background-color: #10B981;
  color: #FFF;
  font-size: 40rpx;
  font-weight: bold;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4rpx 12rpx rgba(16, 185, 129, 0.4);
}

.success-title {
  font-size: 32rpx;
  font-weight: bold;
  color: #1F2937;
}

.success-id {
  font-size: 24rpx;
  font-weight: bold;
  color: #1E6FFF;
  font-family: monospace;
}

.success-tip {
  font-size: 20rpx;
  color: #6B7280;
  line-height: 1.4;
  margin-bottom: 8rpx;
}

.dialog-btn-primary {
  width: 100%;
  background-color: #1E6FFF;
  color: #FFF;
  font-size: 26rpx;
  font-weight: bold;
  border-radius: 16rpx;
  padding: 18rpx 0;
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