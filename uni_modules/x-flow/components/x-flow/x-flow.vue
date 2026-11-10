<template>
  <view class="x-flow">
    <!-- <view style="display: flex" v-for="(item, index) in list" :key="index" v-if="direction === 'column'">
      <view class="step">
        <slot v-if="dotSlot" :item="item" :index="index"></slot>
        <view v-else class="dot" :style="{ background: setDotColor(item) || '#D6D6D6' }"></view>
        <view v-if="index !== list.length - 1"
          :style="{ borderColor: setLineColorFunction(index) || '#D6D6D6', borderStyle }" class="line" />
      </view>
      <slot v-if="detailsSlot" :item="item" :index="index"></slot>
      <view v-else class="flow-path-details">
        <view style="flex: 1">
          {{ item[propsOption.flowNodeName] }}: {{ item[propsOption.name] }}
        </view>
        <view style="width: 140rpx;text-align: center" :style="{ color: setStatusColor(item) }">
          {{ item[propsOption.status] }}
        </view>
        <view class="flow-path-details-time">{{ item[propsOption.date] }}</view>
        <view class="reason exist-reason" v-if="item.remark">{{ item[propsOption.remark] }}</view>
        <view class="reason" v-else></view>
      </view>
    </view> -->
    <view v-if="direction === 'row'" class="row-flow">
      <view style="display: flex; flex-direction: column;" v-for="(item, index) in list" :key="index">
        <view class="" style="margin-left: -10%;">
          <!-- <view class="row-flowNodeName">
            {{ item[propsOption.name] }}
          </view> -->
          <view class="row-reason row-exist-reason">{{ item.gh }}</view>
        </view>
        <view class="row-step">
          <view class="row-dot" style="border-color:#394963;border-style: dashed;"></view>
          <view v-if="index !== list.length - 1" style="border-color:#394963;border-style: dashed;" class="row-line" />
        </view>
        <view class="row-flow-path-details">
          <!-- <view class="row-flowNodeName">
            {{ item[propsOption.time] }}
          </view> -->

          <view class="row-flow-path-details-time">
            进入：{{ item.yg }}
          </view>

          <view class="row-flow-path-details-time">出去：{{ item.leave }}</view>
          <view class="row-flow-path-details-time">
            时长：{{ item.zyj }}min
          </view>
          <!-- <view class="row-reason row-exist-reason" v-if="item.remark">{{ item[propsOption.status] }}</view>
          <view class="row-reason" v-else></view> -->
        </view>
      </view>
    </view>
  </view>
</template>

<script>

export default {
  name: "index",
  props: {
    propsOption: {
      type: Object,
      default: () => {
        return {
          name: 'name', // 人名
          time: 'time',  // 流程节点名称
          status: 'status', // 状态
          date: 'date', // 时间
          remark: 'remark' // 备注
        };
      }
    },
    // 自定义圆点
    dotSlot: {
      type: Boolean,
      default: false
    },
    // 自定义描述
    detailsSlot: {
      type: Boolean,
      default: false
    },
    // setLineColor参数item，是否用下一个item
    setLineColorNextItem: {
      type: Boolean,
      default: true
    },
    // 自定义颜色 根据item里面的字段判断圆点显示什么颜色
    setDotColor: {
      type: Function,
      default: (item) => {
        return '';
      }
    },
    // 自定义颜色 根据item里面的字段判断线显示什么颜色
    setLineColor: {
      type: Function,
      default: (item) => {
        return '';
      }
    },
    // 自定义颜色 根据item里面的字段判断状态字体显示什么颜色
    setStatusColor: {
      type: Function,
      default: (item) => {
        return '';
      }
    },
    // 数轴条数据，数组
    list: {
      type: Array,
      default: () => []
    },
    // row-横向，column-竖向 column | row
    direction: {
      type: String,
      default: 'column'
    },
    // 线样式
    borderStyle: {
      type: String,
      default: 'solid'
    }
  },
  computed: {
    setLineColorFunction() {
      return (index) => {
        const item = this.setLineColorNextItem ? index !== this.list.length - 1 ? this.list[index + 1] : this.list[index] : this.list[index];
        return this.setLineColor(item);
      }
    }
  }
}
</script>

<style scoped lang="scss">
.x-flow {
  padding: 30rpx;
  // background: #fff;

  .step {
    width: 40rpx;

    .line {
      position: relative;
      top: 10rpx;
      width: 0;
      border: 1px solid #394963;
      height: calc(100% - 20rpx);
      margin-left: 8rpx;
    }
  }

  .flow-path-details {
    flex: 1;
    display: flex;
    flex-wrap: wrap;
    line-height: 50rpx;
    padding-bottom: 20rpx;

    .flow-path-details-time {
      font-size: 24rpx;
      width: 120rpx;
      text-align: right;
    }

    .reason {
      width: 300rpx;
      // margin-left: 130rpx;
      word-break: break-word;
    }

    .exist-reason {
      background: #394963;
      border-radius: 14rpx;
      font-size: 24rpx;
      color: #000;
      line-height: 1.5;
      padding: 16rpx 20rpx;
      box-sizing: border-box;
    }
  }

  .row-flow {
    overflow: auto;
    -webkit-overflow-scrolling: touch;
    display: flex;
    flex-wrap: wrap;
    padding: 20rpx;


    .row-step {
      display: flex;
      height: 40rpx;
      position: relative;

      .row-line {
        position: relative;
        height: 0;
        top: 8rpx;
        border: 1px solid #394963;
        width: 100%;
      }

      .row-dot {
        top: 0;
      }
    }

    .row-flow-path-details {
      // padding-right: 40rpx;
      text-align: left;
      padding: 20rpx;
      margin-left: -10%;

      .row-flow-path-details-time {
        font-size: 24rpx;
        width: 120rpx;
        // overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
      }

      .row-exist-reason {
        background: #394963;
        border-radius: 14rpx;
        font-size: 24rpx;
        color: #000;
        line-height: 1.5;
        padding: 16rpx 20rpx;
        box-sizing: border-box;
      }

      .row-flowNodeName {
        overflow: hidden;
        white-space: nowrap;
      }
    }
  }

  .dot,
  .row-dot {
    border-radius: 50%;
    width: 20rpx;
    height: 20rpx;
    // background: #D6D6D6;
    position: relative;
    top: 10rpx;
  }
}
</style>
