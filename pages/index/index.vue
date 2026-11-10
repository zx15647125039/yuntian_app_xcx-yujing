<template>
  <view class="index" style="background-color: rgb(235, 236, 240);">

    <!-- 顶部固定新拟态导航栏：完美避让微信右上角胶囊按钮 -->
    <view
      class="custom-top-nav"
      :style="{
        height: customBarHeight + 'px',
        paddingTop: statusBarHeight + 'px'
      }"
    >
      <view class="nav-content-row" :style="{ height: navBarHeight + 'px' }">
        <view class="brand-badge-box">
          <text class="nav-app-name">观天下</text>
          <view class="nav-section-chip">
            <text class="chip-status-text">{{ currentTabTitle }}</text>
          </view>
        </view>
        <!-- 右侧胶囊安全占位区：防止文字或图标与原生微信胶囊重叠 -->
        <view class="capsule-safe-space" :style="{ width: capsuleWidth + 'px' }"></view>
      </view>
    </view>

    <!-- 核心胶囊占位块：确保所有页面内容物理展示在胶囊正下方 -->
    <view :style="{ height: customBarHeight + 'px', width: '100%' }"></view>

    <!-- Tab 0: 调度首页 (PageA) -->
    <view v-if="tabberPageLoadFlag[0]" v-show="currentTabbarIndex === 0">
      <scroll-view class="custom-tabbar-page" scroll-y enable-back-to-top @scrolltolower="tabbarPageScrollLower">
        <page-a ref="pageA" :deptIndex="deptIndex"></page-a>
      </scroll-view>
    </view>

    <!-- Tab 1: 隐患上报主表单 (PageB) -->
    <view v-if="tabberPageLoadFlag[1]" v-show="currentTabbarIndex === 1">
      <scroll-view class="custom-tabbar-page" scroll-y enable-back-to-top @scrolltolower="tabbarPageScrollLower">
        <page-b ref="pageB"></page-b>
      </scroll-view>
    </view>

    <!-- Tab 2: 工单派发中心与处置闭环 (PageC) -->
    <view v-if="tabberPageLoadFlag[2]" v-show="currentTabbarIndex === 2">
      <scroll-view class="custom-tabbar-page" scroll-y enable-back-to-top @scrolltolower="tabbarPageScrollLower">
        <page-c ref="pageC"></page-c>
      </scroll-view>
    </view>

    <!-- Tab 3: 个人中心 (PageE) -->
    <view v-if="tabberPageLoadFlag[3]" v-show="currentTabbarIndex === 3">
      <scroll-view class="custom-tabbar-page" scroll-y enable-back-to-top @scrolltolower="tabbarPageScrollLower">
        <page-e ref="pageE"></page-e>
      </scroll-view>
    </view>

    <!-- 底部新拟态悬浮导航栏 (严格遵循 4 大派单调度核心功能) -->
    <view class="tabbar">
      <view class="tabbar__bg" :style="[wrapStyle]"></view>
      <view class="tabbar__list">
        <block v-for="(item, index) in tabbar" :key="index">
          <view
            :id="`tabbar_item_${index}`"
            class="tabbar__item"
            :class="[{ 'tabbar__item--active': index === currentTabbarIndex }]"
            @click="changeTabbar(index)"
          >
            <block v-if="item.icon && item.icon.indexOf('/static/') !== -1">
              <image 
                :src="item.icon" 
                mode="aspectFit" 
                class="tabbar__item__icon-image"
                :class="[{'tabbar__item__icon-image--active': index === currentTabbarIndex}]"
              ></image>
            </block>
            <view v-else :class="[
              `tabbar__item__icon tn-icon-${item.icon}`,
              { 'tabbar__item__icon--active': index === currentTabbarIndex }
            ]"></view>
            <view class="tabbar__badge" v-if="index === 2 && todoCount > 0">{{ todoCount }}</view>
            <view class="tabbar__item__text" :class="[{ 'tabbar__item__text--active': index === currentTabbarIndex }]">
              {{ item.title }}
            </view>
          </view>
        </block>
      </view>
      <view class="tabbar__shadow" :animation="activeBgAnimation"></view>
    </view>
  </view>
</template>

<script>
  import PageA from './component/PageA.vue'
  import PageB from './component/PageB.vue'
  import PageC from './component/PageC.vue'
  import PageE from './component/PageE.vue'
  import api from '@/api/index.js'

  export default {
    components: {
      PageA,
      PageB,
      PageC,
      PageE
    },
    data() {
      return {
        currentTabbarIndex: 0,
        prevTabbarIndex: 0,
        tabberPageLoadFlag: [true, false, false, false],
        deptIndex: 0,
        todoCount: 4,

        // 胶囊与顶部安全区尺寸
        statusBarHeight: 20,
        navBarHeight: 44,
        customBarHeight: 88,
        capsuleWidth: 100,

        // 导航动画与位置数据
        activeBgAnimation: {},
        wrapMaskPositionLeft: 0,
        activeBgPositionLeft: 0,
        tabbarRectInfo: [],
        lastBackPressTime: 0,

        // 底部导航栏配置 (4个项严格对应 调度首页, 隐患上报, 现场处置, 个人中心)
        tabbar: [
          {
            title: '调度首页',
            icon: '/static/images/home.png'
          },
          {
            title: '隐患上报',
            icon: '/static/images/ytkc.png'
          },
          {
            title: '现场处置',
            icon: '/static/images/kspx.png'
          },
          {
            title: '个人中心',
            icon: '/static/images/geren.png'
          }
        ]
      }
    },
    computed: {
      wrapStyle() {
        return {
          left: `${this.wrapMaskPositionLeft}px`
        }
      },
      currentTabTitle() {
        if (this.currentTabbarIndex === 0) return '调度中枢';
        if (this.currentTabbarIndex === 1) return '隐患上报';
        if (this.currentTabbarIndex === 2) return '现场处置';
        return '个人中心';
      }
    },
    onLoad(options) {
      this.initNavbarDimensions();

      const index = Number(options && options.index !== undefined ? options.index : 0);
      this.tabberPageLoadFlag = new Array(this.tabbar.length).fill(false);
      this.$set(this.tabberPageLoadFlag, index, true);
      this.currentTabbarIndex = index;

      api.getStaffProfile().then(res => {
        if (res && res.code === 0 && res.data) {
          this.todoCount = res.data.todoCount || 0;
        }
      }).catch(() => {});

      uni.$on('profileUpdated', (prof) => {
        if (prof && prof.todoCount !== undefined) {
          this.todoCount = prof.todoCount;
        }
      });

      uni.$on('changeTabbar', (idx) => {
        this.changeTabbar(idx);
      });
    },
    onUnload() {
      uni.$off('changeTabbar');
      uni.$off('profileUpdated');
    },
    onReady() {
      this.$nextTick(() => {
        setTimeout(() => {
          this.getTabbarItemInfo();
        }, 150);
      });
    },
    methods: {
      // 计算胶囊与状态栏精准位置，确保内容绝对在胶囊下方
      initNavbarDimensions() {
        try {
          const sysInfo = uni.getSystemInfoSync();
          if (sysInfo && sysInfo.statusBarHeight) {
            this.statusBarHeight = sysInfo.statusBarHeight;
          }
          
          let capsuleBottom = this.statusBarHeight + 44;
          let capsuleRightSpace = 100;

          // #ifdef MP-WEIXIN
          const menu = uni.getMenuButtonBoundingClientRect();
          if (menu && menu.top && menu.bottom) {
            this.navBarHeight = (menu.bottom - this.statusBarHeight) + (menu.top - this.statusBarHeight);
            capsuleBottom = menu.bottom + 8; // 胶囊底部再留 8px 安全呼吸区
            capsuleRightSpace = menu.width + (sysInfo.windowWidth - menu.right) + 12;
          }
          // #endif

          this.capsuleWidth = capsuleRightSpace;
          this.customBarHeight = Math.max(capsuleBottom, this.statusBarHeight + 44);
        } catch (e) {
          this.statusBarHeight = 24;
          this.navBarHeight = 44;
          this.customBarHeight = 88;
          this.capsuleWidth = 105;
        }
      },

      // 切换底部导航
      changeTabbar(index) {
        if (this.currentTabbarIndex === index) return;

        if (!this.tabberPageLoadFlag[index]) {
          this.$set(this.tabberPageLoadFlag, index, true);
        }
        this.prevTabbarIndex = this.currentTabbarIndex;
        this.currentTabbarIndex = index;

        this.$nextTick(() => {
          this.updateHollowsPosition();
          this.updateActiveBgPosition();
        });
      },

      // 获取底部导航栏每个 item 的宽度与位置
      getTabbarItemInfo() {
        const query = uni.createSelectorQuery().in(this);
        for (let i = 0; i < this.tabbar.length; i++) {
          query.select('#tabbar_item_' + i).boundingClientRect();
        }
        query.exec(res => {
          if (!res || !res[0]) {
            // 兜底方案：防止首次渲染时 DOM 延迟
            const info = (typeof uni.getSystemInfoSync === 'function') ? uni.getSystemInfoSync() : { windowWidth: 375 };
            const itemWidth = (info.windowWidth || 375) / (this.tabbar.length || 4);
            this.tabbarRectInfo = this.tabbar.map((_, i) => ({
              left: i * itemWidth,
              width: itemWidth
            }));
          } else {
            this.tabbarRectInfo = res.map(item => ({
              left: item ? item.left : 0,
              width: item ? item.width : 0
            }));
          }
          this.updateHollowsPosition();
          this.updateActiveBgPosition(true);
        });
      },

      // 更新底部镂空凹槽位置
      updateHollowsPosition() {
        if (!this.tabbarRectInfo || !this.tabbarRectInfo[this.currentTabbarIndex]) return;
        const { width, left } = this.tabbarRectInfo[this.currentTabbarIndex];
        const imageFixedHeightWidthRatioValue = 300 * (uni.upx2px(64) / 92);
        this.wrapMaskPositionLeft = left - ((imageFixedHeightWidthRatioValue - width) / 2);
      },

      // 更新选中圆球凸起动画位置
      updateActiveBgPosition(init = false) {
        if (!this.tabbarRectInfo || !this.tabbarRectInfo[this.currentTabbarIndex]) return;
        const { width, left } = this.tabbarRectInfo[this.currentTabbarIndex];
        const oldActiveBgPositionLeft = this.activeBgPositionLeft;
        this.activeBgPositionLeft = left + ((width - uni.upx2px(90)) / 2);
        
        const animation = uni.createAnimation({
          duration: 160,
          timingFunction: "linear"
        });
        
        if (!init) {
          animation.top(uni.upx2px(-24)).left(oldActiveBgPositionLeft + ((this.activeBgPositionLeft - oldActiveBgPositionLeft) / 2)).scale(1).step();
          animation.left(this.activeBgPositionLeft).top(uni.upx2px(-24)).scale(1).step();
        } else {
          animation.left(this.activeBgPositionLeft).top(uni.upx2px(-26)).step();
        }
        this.activeBgAnimation = animation.export();
      },

      tabbarPageScrollLower() {
        // 触底回调
      },

      // 返回键处理
      onBackPress(options) {
        if (this.currentTabbarIndex !== 0) {
          this.changeTabbar(0);
          return true;
        }
        const currentTime = new Date().getTime();
        if (currentTime - this.lastBackPressTime < 2000) {
          return false;
        } else {
          this.lastBackPressTime = currentTime;
          uni.showToast({
            title: '再按一次退出应用',
            icon: 'none'
          });
          return true;
        }
      }
    }
  }
</script>

<style lang="scss" scoped>
  .index {
    width: 100%;
    min-height: 100vh;
    min-height: 100dvh;
    position: relative;
    background-color: #EBECF0;
    overflow-x: hidden;
    font-family: -apple-system, BlinkMacSystemFont, "PingFang SC", "Hiragino Sans GB", "Microsoft YaHei", sans-serif;
    -webkit-font-smoothing: antialiased;
    -moz-osx-font-smoothing: grayscale;
    text-rendering: optimizeLegibility;
  }

  /* 顶部固定新拟态导航栏 */
  .custom-top-nav {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    z-index: 9990;
    background-color: #EBECF0;
    box-shadow: 0 4rpx 16rpx rgba(186, 190, 204, 0.4);
    box-sizing: border-box;
    display: flex;
    flex-direction: column;
    justify-content: flex-end;
  }

  .nav-content-row {
    width: 100%;
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 0 24rpx;
    box-sizing: border-box;
  }

  .brand-badge-box {
    display: flex;
    align-items: center;
    gap: 12rpx;
  }

  .nav-app-name {
    font-size: 36rpx;
    font-weight: 800;
    color: #0F172A;
    letter-spacing: 1rpx;
  }

  .nav-section-chip {
    display: inline-flex;
    align-items: center;
    gap: 8rpx;
    background-color: #DBEAFE;
    padding: 6rpx 16rpx;
    border-radius: 30rpx;
  }

  .chip-status-dot {
    width: 12rpx;
    height: 12rpx;
    border-radius: 50%;
    background-color: #1E6FFF;
  }

  .chip-status-text {
    font-size: 20rpx;
    font-weight: bold;
    color: #1E6FFF;
  }

  .capsule-safe-space {
    flex-shrink: 0;
  }

  /* 内容滚动视口 */
  .custom-tabbar-page {
    width: 100%;
    height: calc(100vh - 120rpx - env(safe-area-inset-bottom));
    height: calc(100dvh - 120rpx - env(safe-area-inset-bottom));
    box-sizing: border-box;
    padding-bottom: 40rpx;
  }

  /* 底部导航栏 */
  .tabbar {
    width: 100%;
    height: 120rpx;
    height: calc(120rpx + env(safe-area-inset-bottom));
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    z-index: 9999;
    background-color: #EBECF0;
    box-shadow: 0 -4rpx 16rpx rgba(186, 190, 204, 0.4);

    &__bg {
      position: absolute;
      width: 100%;
      height: 150rpx;
      bottom: 22rpx;
      left: 0;
      background-image: url("data:image/svg+xml;charset=utf-8;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0idXRmLTgiPz4KPCEtLSBHZW5lcmF0b3I6IEFkb2JlIElsbHVzdHJhdG9yIDIzLjAuMCwgU1ZHIEV4cG9ydCBQbHVnLUluIC4gU1ZHIFZlcnNpb246IDYuMDAgQnVpbGQgMCkgIC0tPgo8c3ZnIHZlcnNpb249IjEuMSIgaWQ9IuWbvuWxgl8xIiB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHhtbG5zOnhsaW5rPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5L3hsaW5rIiB4PSIwcHgiIHk9IjBweCIKCSB2aWV3Qm94PSIwIDAgMjMwLjYgNjEuNSIgc3R5bGU9ImVuYWJsZS1iYWNrZ3JvdW5kOm5ldyAwIDAgMjMwLjYgNjEuNTsiIHhtbDpzcGFjZT0icHJlc2VydmUiPgo8c3R5bGUgdHlwZT0idGV4dC9jc3MiPgoJLnN0MHtmaWxsOiNFQkVDRjA7fQo8L3N0eWxlPgo8cGF0aCBjbGFzcz0ic3QwIiBkPSJNMjMwLjYsNjEuNWMtNTYuOCwwLTU2LjgtNDkuNS0xMTUuMy00OS41UzU2LjgsNjEuNSwwLDYxLjVoMTE1LjNIMjMwLjZ6Ii8+Cjwvc3ZnPgo=");
      background-size: auto 56rpx, cover;
      background-repeat: no-repeat;
      z-index: 1;
      transition: 0.5s;
      pointer-events: none;
    }

    &__list {
      position: absolute;
      z-index: 10;
      top: 0;
      left: 0;
      right: 0;
      bottom: 0;
      display: flex;
      align-items: center;
    }

    &__item {
      height: 100%;
      flex: 1;
      text-align: center;
      position: relative;
      margin-top: 14rpx;

      &--active {
        .tabbar__item__icon {
          top: -18rpx;
          font-size: 54rpx;
        }

        .tabbar__item__icon-image {
          top: -18rpx;
          width: 64rpx;
          height: 64rpx;
        }

        .tabbar__item__text {
          opacity: 1;
          font-size: 26rpx;
          color: #1E6FFF;
          font-weight: 800;
        }
      }

      &__icon-image {
        width: 52rpx;
        height: 52rpx;
        position: absolute;
        top: 16rpx;
        left: 50%;
        transform: translateX(-50%);
        transition: all 0.5s cubic-bezier(0.2, 0.8, 0.2, 1);
        z-index: 5;

        &--active {
          top: -18rpx;
          width: 64rpx;
          height: 64rpx;
        }
      }

      &__icon {
        font-size: 56rpx;
        position: absolute;
        left: 0;
        right: 0;
        top: 16rpx;
        transition: 0.5s;
      }

      &__badge {
        position: absolute;
        top: 6rpx;
        right: 36rpx;
        width: 32rpx;
        height: 32rpx;
        background-color: #EF4444;
        color: #FFF;
        font-size: 20rpx;
        font-weight: bold;
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        z-index: 15;
        border: 2rpx solid #FFF;
        box-shadow: 0 2rpx 6rpx rgba(239, 68, 68, 0.4);
      }

      &__text {
        position: absolute;
        left: 0;
        right: 0;
        bottom: 20rpx;
        bottom: calc(20rpx + env(safe-area-inset-bottom));
        transition: 0.3s;
        opacity: 1;
        color: #334155;
        font-size: 24rpx;
        font-weight: 600;
      }
    }

    /* 凸起圆盘新拟态阴影 */
    &__shadow {
      position: absolute;
      width: 96rpx;
      height: 96rpx;
      top: -26rpx;
      left: 48rpx;
      border-radius: 1000rpx;
      background-color: #EBECF0;
      z-index: 2;
      box-shadow: -3px -3px 8px #FFF, 3px 3px 8px #BABECC;
      pointer-events: none;
    }
  }
</style>