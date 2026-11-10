<template>
  <view class="container">
    <!-- 顶部导航 -->
    <view class="nav-bar" :style="{ paddingTop: (statusBarHeight || 20) + 'px' }">
      <view class="nav-content">
        <view class="back-btn" @click="handleBack">
          <text class="back-arrow">‹</text>
        </view>
        <text class="nav-title">查看工单 (处置填写)</text>
        <view class="nav-placeholder"></view>
      </view>
    </view>

    <scroll-view scroll-y class="handle-scroll">
      <!-- 1) 顶部信息：原始事件图片 (带标注，PRD 2.3) -->
      <view class="handle-card">
        <view class="card-header space-between">
          <text class="header-title">原始事件图片 (带标注)</text>
          <text class="exception-btn" @click="openExceptionDialog">⚠️ 异常录入</text>
        </view>
        <view class="origin-img-wrap">
          <image
            :src="order.images && order.images.length ? order.images[0] : 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=600'"
            mode="aspectFill"
            class="origin-img"
          ></image>
          <text class="origin-tag">现场隐患标注原图</text>
        </view>
      </view>

      <!-- 2) 工单进度流程图 (接单 → 执行中 → 结束，PRD 2.3) -->
      <view class="handle-card">
        <view class="progress-header">
          <text class="header-title">工单进度流程</text>
          <text class="progress-percent">{{ progressPercentage }}%</text>
        </view>

        <view class="steps-row">
          <!-- 阶段 1: 接单 (已完成) -->
          <view class="step-node">
            <view class="node-circle done">
              <text class="node-symbol">✓</text>
            </view>
            <text class="node-title done">1. 接单</text>
          </view>

          <view class="step-line done"></view>

          <!-- 阶段 2: 执行中 -->
          <view class="step-node">
            <view :class="['node-circle', isException ? 'error' : 'doing']">
              <text class="node-symbol">{{ isException ? '✗' : '2' }}</text>
            </view>
            <text :class="['node-title', isException ? 'error' : 'doing']">
              {{ isException ? '2. 异常待处' : '2. 执行中' }}
            </text>
          </view>

          <view class="step-line"></view>

          <!-- 阶段 3: 结束 -->
          <view class="step-node">
            <view class="node-circle waiting">
              <text class="node-symbol">3</text>
            </view>
            <text class="node-title">3. 结束</text>
          </view>
        </view>
        <text class="step-hint">注：上一步阶段勾选完成才可以进行下一步阶段处置</text>
      </view>

      <!-- 3) 处置表单字段 (PRD 2.3) -->
      <view class="handle-card">
        <!-- 处置措施 (必填) -->
        <view class="form-item">
          <view class="item-label">
            <text class="label-text">处置措施</text>
            <text class="required">*</text>
          </view>
          <input
            v-model="action"
            type="text"
            placeholder="请输入现场采取的处置措施或整改动作"
            class="input-box"
          />
        </view>

        <!-- 处置前图片 (支持多张上传) -->
        <view class="form-item">
          <view class="item-label">
            <text class="label-text">处置前图片 (多张)</text>
          </view>
          <view class="images-grid">
            <block v-for="(img, idx) in beforeImages" :key="'before-' + idx">
              <view class="img-thumb-box">
                <image :src="img" mode="aspectFill" class="thumb-img"></image>
                <view class="img-del" @click="removeBeforeImg(idx)">×</view>
              </view>
            </block>
            <view class="upload-btn" @click="uploadBeforeImg">
              <text class="upload-icon">+</text>
              <text class="upload-label">上传前图</text>
            </view>
          </view>
        </view>

        <!-- 处置后图片 (支持多张上传) -->
        <view class="form-item">
          <view class="item-label">
            <text class="label-text">处置后图片 (多张对比图)</text>
          </view>
          <view class="images-grid">
            <block v-for="(img, idx) in afterImages" :key="'after-' + idx">
              <view class="img-thumb-box">
                <image :src="img" mode="aspectFill" class="thumb-img"></image>
                <view class="img-del" @click="removeAfterImg(idx)">×</view>
              </view>
            </block>
            <view class="upload-btn" @click="uploadAfterImg">
              <text class="upload-icon">+</text>
              <text class="upload-label">上传后图</text>
            </view>
          </view>
        </view>

        <!-- 隐患处置结论 (最多 200 字符，必填，带 0/200 统计) -->
        <view class="form-item no-border">
          <view class="item-label space-between">
            <view class="label-left">
              <text class="label-text">隐患处置结论</text>
              <text class="required">*</text>
            </view>
            <text class="char-count">{{ conclusion.length }}/200</text>
          </view>
          <textarea
            v-model="conclusion"
            maxlength="200"
            class="textarea-box"
            placeholder="请输入最终隐患处置结论与现场验收情况（最多200字）"
          ></textarea>
        </view>
      </view>
    </scroll-view>

    <!-- 底部按钮【完成工单】(PRD 2.3) -->
    <view class="bottom-bar">
      <button class="btn btn-complete" @click="promptCompleteOrder">完成工单</button>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      statusBarHeight: 24,
      order: {
        id: "GD20260731002",
        eventType: "巡检预警",
        hazardType: "违章建筑",
        images: ["https://images.unsplash.com/photo-1590496793929-36417d3117de?w=600"]
      },
      action: '',
      beforeImages: [
        'https://images.unsplash.com/photo-1590496793929-36417d3117de?w=600'
      ],
      afterImages: [],
      conclusion: '',
      isException: false,
      progressPercentage: 66
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
        if (found.handling) {
          this.action = found.handling.action || '';
          this.conclusion = found.handling.conclusion || '';
          this.beforeImages = found.handling.beforeImages || this.beforeImages;
          this.afterImages = found.handling.afterImages || [];
        }
      }
    }
  },
  methods: {
    handleBack() {
      uni.navigateBack({ delta: 1 });
    },
    uploadBeforeImg() {
      uni.chooseImage({
        count: 3,
        success: (res) => {
          this.beforeImages = [...this.beforeImages, ...res.tempFilePaths];
        }
      });
    },
    removeBeforeImg(idx) {
      this.beforeImages.splice(idx, 1);
    },
    uploadAfterImg() {
      uni.chooseImage({
        count: 3,
        success: (res) => {
          this.afterImages = [...this.afterImages, ...res.tempFilePaths];
        }
      });
    },
    removeAfterImg(idx) {
      this.afterImages.splice(idx, 1);
    },
    openExceptionDialog() {
      // PRD 2.3: 执行过程中若出现异常：支持弹窗录入异常描述、上传异常图片并临时保存
      uni.showModal({
        title: '现场处置异常情况录入',
        editable: true,
        placeholderText: '请输入异常原因（如：现场门锁损坏无法进入、阻扰执法等）',
        success: (res) => {
          if (res.confirm && res.content) {
            this.isException = true;
            this.progressPercentage = 50;
            uni.showToast({ title: '异常情况已临时保存并标记', icon: 'none' });
          }
        }
      });
    },
    promptCompleteOrder() {
      // 1. 点击按钮先二次弹窗确认「该工单是否确认完成」
      // 2. 表单校验：必填内容全部填写
      if (!this.action.trim()) {
        uni.showToast({ title: '请输入现场处置措施', icon: 'none' });
        return;
      }
      if (!this.conclusion.trim()) {
        uni.showToast({ title: '请输入隐患处置结论', icon: 'none' });
        return;
      }

      uni.showModal({
        title: '确认完成',
        content: '该工单是否确认完成？确认后状态将更新为【已完成】，隐患闭环并归档。',
        confirmText: '确认完成',
        cancelText: '取消',
        success: (res) => {
          if (res.confirm) {
            this.submitCompletion();
          }
        }
      });
    },
    submitCompletion() {
      uni.showLoading({ title: '正在完结工单...' });

      // 3. 提交成功，工单状态更新为【已完成】，返回工单列表
      this.order.status = '已完成';
      this.order.finishTime = new Date().toLocaleString();
      this.order.progress = {
        currentStep: 3,
        step1Status: "done",
        step2Status: "done",
        step3Status: "done",
        percentage: 100
      };
      this.order.handling = {
        action: this.action.trim(),
        beforeImages: this.beforeImages,
        afterImages: this.afterImages.length ? this.afterImages : ['https://images.unsplash.com/photo-1584467735871-8e85353a8413?w=600'],
        conclusion: this.conclusion.trim()
      };

      let orders = uni.getStorageSync('gt_work_orders') || [];
      const idx = orders.findIndex(o => o.id === this.order.id);
      if (idx !== -1) {
        orders[idx] = this.order;
      } else {
        orders.unshift(this.order);
      }
      uni.setStorageSync('gt_work_orders', orders);

      setTimeout(() => {
        uni.hideLoading();
        uni.showToast({ title: '工单已圆满完成！', icon: 'success' });
        setTimeout(() => {
          uni.navigateBack({ delta: 1 });
        }, 800);
      }, 500);
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

.handle-scroll {
  flex: 1;
  padding: 24rpx;
  box-sizing: border-box;
  padding-bottom: 160rpx;
}

.handle-card {
  background-color: #FFFFFF;
  border-radius: 24rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: 0 2rpx 10rpx rgba(0, 0, 0, 0.02);

  .card-header {
    display: flex;
    align-items: center;
    margin-bottom: 16rpx;
    &.space-between {
      justify-content: space-between;
    }
    .header-title {
      font-size: 26rpx;
      font-weight: bold;
      color: #1D2129;
    }
    .exception-btn {
      font-size: 22rpx;
      color: #FA8C16;
      font-weight: bold;
    }
  }

  .origin-img-wrap {
    width: 100%;
    height: 280rpx;
    border-radius: 16rpx;
    overflow: hidden;
    position: relative;
    background-color: #F2F3F5;

    .origin-img {
      width: 100%;
      height: 100%;
    }
    .origin-tag {
      position: absolute;
      bottom: 12rpx;
      left: 12rpx;
      background-color: rgba(0, 0, 0, 0.6);
      color: #FFFFFF;
      font-size: 20rpx;
      padding: 4rpx 16rpx;
      border-radius: 8rpx;
    }
  }

  .progress-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 24rpx;
    .progress-percent {
      font-size: 28rpx;
      font-weight: bold;
      color: #1E6FFF;
    }
  }

  .steps-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 20rpx;

    .step-node {
      display: flex;
      flex-direction: column;
      align-items: center;
      .node-circle {
        width: 56rpx;
        height: 56rpx;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 26rpx;
        font-weight: bold;
        margin-bottom: 8rpx;

        &.done {
          background-color: #00B578;
          color: #FFFFFF;
        }
        &.doing {
          background-color: #1E6FFF;
          color: #FFFFFF;
        }
        &.error {
          background-color: #F53F3F;
          color: #FFFFFF;
        }
        &.waiting {
          background-color: #F2F3F5;
          color: #86909C;
        }
      }
      .node-title {
        font-size: 22rpx;
        color: #86909C;
        &.done { color: #00B578; font-weight: bold; }
        &.doing { color: #1E6FFF; font-weight: bold; }
        &.error { color: #F53F3F; font-weight: bold; }
      }
    }

    .step-line {
      flex: 1;
      height: 4rpx;
      background-color: #E5E6EB;
      margin: 0 12rpx -28rpx;
      &.done {
        background-color: #00B578;
      }
    }
  }

  .step-hint {
    font-size: 20rpx;
    color: #86909C;
    text-align: center;
    margin-top: 24rpx;
    display: block;
  }
}

.form-item {
  padding: 20rpx 0;
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
    }
    .char-count {
      font-size: 22rpx;
      color: #86909C;
    }
  }

  .input-box {
    width: 100%;
    padding: 16rpx 20rpx;
    background-color: #F7F8FA;
    border-radius: 12rpx;
    font-size: 26rpx;
    color: #1D2129;
    box-sizing: border-box;
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

  .images-grid {
    display: flex;
    flex-wrap: wrap;
    gap: 16rpx;
    margin-top: 10rpx;

    .img-thumb-box {
      width: 140rpx;
      height: 140rpx;
      border-radius: 14rpx;
      overflow: hidden;
      position: relative;
      background-color: #F2F3F5;
      .thumb-img {
        width: 100%;
        height: 100%;
      }
      .img-del {
        position: absolute;
        top: 6rpx;
        right: 6rpx;
        width: 30rpx;
        height: 30rpx;
        border-radius: 50%;
        background-color: rgba(0, 0, 0, 0.6);
        color: #FFFFFF;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 22rpx;
      }
    }

    .upload-btn {
      width: 140rpx;
      height: 140rpx;
      border-radius: 14rpx;
      border: 2rpx dashed #C9CDD4;
      background-color: #F7F8FA;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      .upload-icon {
        font-size: 38rpx;
        color: #86909C;
      }
      .upload-label {
        font-size: 18rpx;
        color: #86909C;
        margin-top: 4rpx;
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
  justify-content: center;
  padding: 0 32rpx;
  box-sizing: border-box;
  z-index: 100;

  .btn-complete {
    width: 100%;
    height: 76rpx;
    line-height: 76rpx;
    font-size: 28rpx;
    font-weight: bold;
    border-radius: 16rpx;
    background: linear-gradient(135deg, #00B578, #009A63);
    color: #FFFFFF;
    text-align: center;
  }
}
</style>
