<template>
  <view class="sv-danmaku-track">
    <template v-for="item in dmlist">
      <sv-danmaku-item v-if="item.alive" :key="item.id" :item="item" @update:alive="die"></sv-danmaku-item>
    </template>
  </view>
</template>
<script>
import SvDanmakuItem from './sv-danmaku-item.vue';
export default {
  components: { SvDanmakuItem },
  props: {
    container: {
      type: Object,
      default: () => { }
    }
  },
  data() {
    return {
      dmlist: [],
      danmakuContainer: {}
    }
  },
  computed: {},
  mounted() {
    // 使用命令式watch，只监听一次，获取弹幕容器渲染完成之后的dom宽高
    const unwatch = this.$watch('container', (newValue) => {
      this.danmakuContainer = newValue
      unwatch()
    })

  },
  methods: {
    /**
     * 弹幕装载
     * @param {Object} list 弹幕列表
     * 弹幕项参数
     * {
        id: `dmid_${Date.now()}`, // 可根据情况调整
        text: this.dmText,
        speed: this.dmSpeed,
        style: {
          color: this.dmColor,
          fontSize: this.dmSize + 'px'
        }
        // 可继续添加自定义的参数，例如账号信息等
      }
     */
    dmLoad(list) {
      console.log("🚀 ~ dmLoad ~ list:", list)
      list?.forEach((item) => {
        this.add(item)
      })
    },
    handleDanmaku(data) {
      console.log("🚀 ~ handleDanmaku ~ data:", data)
      const { speed } = data
      const { height } = this.danmakuContainer
      /**
       * 每条弹幕存活时长time
       * speed为速度1~5档，每档5s，1档时最慢，为25秒，5档最快，为5秒
       */
      const time = Math.ceil(25 / speed) // ceil向上取整 floor向下取整
      let dmData = Object.assign(
        { ...data },
        {
          time,
          style: {
            ...data.style,
            animationDuration: `${time}s`,
            top: `${Math.floor(Math.random() * (height - 30))}px`
          },
          danmakuContainer: this.danmakuContainer,
          alive: true // 装载后激活生命
        }
      )
      return dmData
    },
    add(data) {
      console.log("🚀 ~ add ~ data:", data)
      this.dmlist.push(this.handleDanmaku(data))
    },
    die(e) {
      // 移除该释放的弹幕id
      this.dmlist.some((item, index) => {
        if (item.id === e.id) {
          this.dmlist.splice(index, 1)
          return true
        }
      })
      // console.log('==== 弹幕释放 :', e)
    },
    clearDmlist() {
      this.dmlist = []
    }
  }
}
</script>

<style lang="scss">
.sv-danmaku-track {
  position: relative;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
</style>
