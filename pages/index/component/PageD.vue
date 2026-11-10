<template>
  <view class="template-clock">
    <view class="content-card neu-outset">
      <text class="title">巡检网格与轨迹</text>
      <text class="desc">观天下综合网格电子围栏与实时巡查轨迹</text>
    </view>
  </view>
</template>

<script>
export default {
  name: 'PageD'
};
</script>

<style scoped>
.template-clock {
  background-color: #EBECF0;
  min-height: 100vh;
  padding: 30rpx;
}
.content-card {
  padding: 40rpx;
  border-radius: 20rpx;
  text-align: center;
}
.title {
  font-size: 32rpx;
  font-weight: bold;
  color: #394963;
  display: block;
  margin-bottom: 12rpx;
}
.desc {
  font-size: 22rpx;
  color: #7E8B9B;
}
.neu-outset {
  background-color: #EBECF0;
  box-shadow: -3px -3px 7px #FFFFFF, 3px 3px 7px #BABECC;
}
</style>