<template>
  <text class="sv-danmaku-item" :style="[{ '--track-width': trackWidth }, item.style]">
    <image :src="item.avatar" class="danmaku-avatar"></image>
    {{ item.nickName ? item.nickName : name }}：{{ item.text }}
  </text>
</template>

<script>
export default {
  props: {
    // 每条独立的弹幕轨道
    item: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      name: '匿名用户'
    }
  },
  computed: {
    /**
     * trackWidth：轨道基础宽度 (弹幕容器宽度px)
     * 最终弹幕滚动长度 = 轨道基础宽度 + 弹幕自身100%长度 + 预留距离(可选)
     * 即：from (trackWidth) to (-100% - 预留距离(可选))
     */
    trackWidth() {
      return this.item.danmakuContainer.width + 'px'
    }
  },
  created() {
    this.living(this.item)
  },
  methods: {
    /**
     * 弹幕的生命计时
     */
    living(item) {
      const lifeTimer = setTimeout(() => {
        item.alive = false
        // console.log('==== 释放 ====', item)
        // 通知父组件，该弹幕已经释放
        this.$emit('update:alive', item)
        clearTimeout(lifeTimer)
      }, item.time * 1000)
    }
  }
}
</script>

<style lang="scss">
.sv-danmaku-item {
  --track-width: 0px;

  padding: 12rpx 18rpx;
  background: rgba(0, 0, 0, 0.05);
  border-radius: 24rpx;
  white-space: nowrap;

  position: absolute;
  // transform: translateX(100%);
  animation: danmaku-running linear;
}

@keyframes danmaku-running {
  0% {
    // transform: translateX(v-bind(trackWidth));
    transform: translateX(var(--track-width));
  }

  100% {
    transform: translateX(calc(-100% - 40px));
  }
}

.danmaku-avatar {
  width: 30rpx;
  height: 30rpx;
  border-radius: 50%;
  margin-right: 10rpx;
  vertical-align: middle;
  display: inline-block;
}
</style>
