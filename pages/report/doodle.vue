<template>
  <view class="container">
    <!-- 顶部操作栏 -->
    <view class="nav-bar">
      <text class="btn-cancel" @click="handleCancel">取消</text>
      <text class="nav-title">隐患图片涂鸦标注</text>
      <text class="btn-done" @click="handleDone">完成</text>
    </view>

    <!-- 画布绘制区 -->
    <view class="canvas-wrap">
      <canvas
        canvas-id="doodleCanvas"
        id="doodleCanvas"
        class="doodle-canvas"
        @touchstart="onTouchStart"
        @touchmove="onTouchMove"
        @touchend="onTouchEnd"
      ></canvas>
    </view>

    <!-- 底部工具栏 (矩形框、圆形、画笔、文字 T，PRD 1.5) -->
    <view class="tools-bar">
      <view class="tool-list">
        <view
          :class="['tool-btn', currentTool === 'rect' ? 'active' : '']"
          @click="selectTool('rect')"
        >
          <text class="tool-icon">▢</text>
          <text class="tool-name">矩形框</text>
        </view>

        <view
          :class="['tool-btn', currentTool === 'circle' ? 'active' : '']"
          @click="selectTool('circle')"
        >
          <text class="tool-icon">◯</text>
          <text class="tool-name">圆形</text>
        </view>

        <view
          :class="['tool-btn', currentTool === 'brush' ? 'active' : '']"
          @click="selectTool('brush')"
        >
          <text class="tool-icon">✏️</text>
          <text class="tool-name">画笔</text>
        </view>

        <view
          :class="['tool-btn', currentTool === 'text' ? 'active' : '']"
          @click="selectTool('text')"
        >
          <text class="tool-icon text-t">T</text>
          <text class="tool-name">文字</text>
        </view>

        <view class="tool-btn" @click="clearCanvas">
          <text class="tool-icon">↺</text>
          <text class="tool-name">重置</text>
        </view>
      </view>

      <!-- 调色板 -->
      <view class="color-palette">
        <text class="color-label">标注颜色：</text>
        <view
          v-for="color in colorList"
          :key="color"
          :class="['color-dot', currentColor === color ? 'selected' : '']"
          :style="{ backgroundColor: color }"
          @click="selectColor(color)"
        ></view>
      </view>
    </view>
  </view>
</template>

<script>
export default {
  data() {
    return {
      currentTool: 'brush', // rect, circle, brush, text
      currentColor: '#FF3B30',
      colorList: ['#FF3B30', '#FF9500', '#007AFF', '#34C759'],
      startX: 0,
      startY: 0,
      canvasCtx: null,
      sampleImageUrl: 'https://images.unsplash.com/photo-1541888946425-d0fbb1861593?w=600'
    };
  },
  onReady() {
    this.canvasCtx = uni.createCanvasContext('doodleCanvas', this);
    this.drawBaseImage();
  },
  methods: {
    drawBaseImage() {
      // 绘制背景图片底图
      this.canvasCtx.fillStyle = '#22262E';
      this.canvasCtx.fillRect(0, 0, 350, 420);
      
      uni.getImageInfo({
        src: this.sampleImageUrl,
        success: (image) => {
          this.canvasCtx.drawImage(image.path, 0, 0, 350, 420);
          this.canvasCtx.draw();
        },
        fail: () => {
          this.canvasCtx.draw();
        }
      });
    },
    selectTool(tool) {
      this.currentTool = tool;
    },
    selectColor(c) {
      this.currentColor = c;
    },
    onTouchStart(e) {
      const touch = e.touches[0];
      this.startX = touch.x;
      this.startY = touch.y;

      if (this.currentTool === 'brush') {
        this.canvasCtx.beginPath();
        this.canvasCtx.moveTo(this.startX, this.startY);
        this.canvasCtx.setStrokeStyle(this.currentColor);
        this.canvasCtx.setLineWidth(4);
      } else if (this.currentTool === 'text') {
        uni.showModal({
          title: '输入文字标注',
          editable: true,
          placeholderText: '如：存在严重火灾隐患',
          success: (res) => {
            if (res.confirm && res.content) {
              this.canvasCtx.setFontSize(16);
              this.canvasCtx.setFillStyle(this.currentColor);
              this.canvasCtx.fillText(res.content, this.startX, this.startY);
              this.canvasCtx.draw(true);
            }
          }
        });
      }
    },
    onTouchMove(e) {
      const touch = e.touches[0];
      if (this.currentTool === 'brush') {
        this.canvasCtx.lineTo(touch.x, touch.y);
        this.canvasCtx.stroke();
        this.canvasCtx.draw(true);
      }
    },
    onTouchEnd(e) {
      const touch = e.changedTouches[0];
      const endX = touch.x;
      const endY = touch.y;

      this.canvasCtx.setStrokeStyle(this.currentColor);
      this.canvasCtx.setLineWidth(4);

      if (this.currentTool === 'rect') {
        this.canvasCtx.strokeRect(this.startX, this.startY, endX - this.startX, endY - this.startY);
        this.canvasCtx.draw(true);
      } else if (this.currentTool === 'circle') {
        const radius = Math.max(Math.abs(endX - this.startX), Math.abs(endY - this.startY)) / 2;
        const centerX = (this.startX + endX) / 2;
        const centerY = (this.startY + endY) / 2;
        this.canvasCtx.beginPath();
        this.canvasCtx.arc(centerX, centerY, radius, 0, 2 * Math.PI);
        this.canvasCtx.stroke();
        this.canvasCtx.draw(true);
      }
    },
    clearCanvas() {
      this.drawBaseImage();
    },
    handleCancel() {
      // PRD 1.5: 取消：放弃编辑，返回图片选择弹窗
      uni.navigateBack({ delta: 1 });
    },
    handleDone() {
      // PRD 1.5: 完成：保存涂鸦标注后的图片，回填至隐患表单【事件图片】区域
      uni.canvasToTempFilePath({
        canvasId: 'doodleCanvas',
        success: (res) => {
          uni.$emit('onDoodleSaved', res.tempFilePath);
          uni.navigateBack({ delta: 1 });
        },
        fail: () => {
          uni.$emit('onDoodleSaved', this.sampleImageUrl);
          uni.navigateBack({ delta: 1 });
        }
      }, this);
    }
  }
};
</script>

<style lang="scss" scoped>
.container {
  width: 100%;
  height: 100vh;
  background-color: #1D2129;
  display: flex;
  flex-direction: column;
}

.nav-bar {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 24rpx 32rpx;
  background-color: #272E3B;
  color: #FFFFFF;

  .btn-cancel {
    font-size: 28rpx;
    color: #86909C;
  }
  .nav-title {
    font-size: 30rpx;
    font-weight: bold;
  }
  .btn-done {
    font-size: 28rpx;
    font-weight: bold;
    color: #1E6FFF;
  }
}

.canvas-wrap {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20rpx;

  .doodle-canvas {
    width: 700rpx;
    height: 840rpx;
    background-color: #272E3B;
    border-radius: 16rpx;
  }
}

.tools-bar {
  background-color: #272E3B;
  padding: 24rpx 32rpx 48rpx;
  border-top: 1rpx solid #373E4D;

  .tool-list {
    display: flex;
    justify-content: space-around;
    align-items: center;
    margin-bottom: 24rpx;

    .tool-btn {
      display: flex;
      flex-direction: column;
      align-items: center;
      color: #86909C;

      &.active {
        color: #1E6FFF;
        .tool-icon {
          background-color: #1E6FFF;
          color: #FFFFFF;
        }
      }

      .tool-icon {
        width: 68rpx;
        height: 68rpx;
        border-radius: 16rpx;
        background-color: #373E4D;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 32rpx;
        margin-bottom: 6rpx;

        &.text-t {
          font-family: serif;
          font-weight: bold;
        }
      }

      .tool-name {
        font-size: 20rpx;
      }
    }
  }

  .color-palette {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 24rpx;
    padding-top: 16rpx;
    border-top: 1rpx solid #373E4D;

    .color-label {
      font-size: 20rpx;
      color: #86909C;
    }

    .color-dot {
      width: 36rpx;
      height: 36rpx;
      border-radius: 50%;
      &.selected {
        border: 4rpx solid #FFFFFF;
      }
    }
  }
}
</style>
