<template>
  <view v-if="openModal" class="wx-authorization-modal">
    <view class="wam__mask" @touchmove.prevent="" @tap.stop="closeModal"></view>

    <!-- 内容区域 -->
    <view class="wam__wrapper">
      <!-- 关闭按钮 -->
      <view class="wam__close-btn" @tap.stop="closeModal">
        <text class="tn-icon-close"></text>
      </view>
      <!-- 标题 -->
      <view class="wam__title">设置您的昵称、头像</view>
      <!-- tips -->
      <view class="wam__sub-title">
        设置用户头像、昵称，主要用于向用户提供具有辨识度的用户中心界面
      </view>

      <!-- 头像选择 -->
      <view class="wam__avatar">
        <!-- 当前头像预览 -->
        <view class="current-avatar">
          <view class="avatar-preview">
            <image 
              v-if="userInfodata.img" 
              class="avatar-image" 
              :src="userInfodata.img" 
              mode="aspectFill"
            ></image>
            <image 
              v-else 
              class="avatar-image" 
              src="/static/user.jpeg" 
              mode="aspectFill"
            ></image>
          </view>
          <view class="avatar-overlay" v-if="userInfodata.img">
            <text class="tn-icon-check"></text>
          </view>
        </view>
        
        <!-- 头像选择选项 -->
        <view class="avatar-options">
          <view class="option-btn">
            <button class="wechat-avatar-btn" open-type="chooseAvatar" @chooseavatar="onChooseAvatar">
              <text class="tn-icon-wechat-fill"></text>
              <text>微信头像</text>
            </button>
          </view>
        </view>
      </view>

      <!-- 昵称输入 -->
      <view class="wam__nickname">
        <!-- 当前昵称显示 -->
        <!-- <view class="current-nickname" v-if="userInfodata.nick_name">
          <text class="nickname-label">当前昵称</text>
          <view class="nickname-display">{{ userInfodata.nick_name }}</view>
        </view> -->

        <!-- 微信昵称输入框 -->
        <view class="nickname-input-wrapper">
          <input
            type="nickname"
            class="nickname-input"
            :value="userInfodata.nick_name"
            placeholder="请输入昵称"
            @input="onNicknameInput"
            @blur="onNicknameBlur"
          />
        </view>
      </view>


      <!-- 保存按钮 -->
      <view class="wam__submit-btn" :class="[{
    'disabled': !userInfodata.avatar || !userInfodata.nick_name
  }]" hover-class="tn-btn-hover-class" :hover-stay-time="150" @tap.stop="submitUserInfo">
        保 存
      </view>
    </view>
  </view>
</template>

<script>
export default {
  options: {
    // 在微信小程序中将组件节点渲染为虚拟节点，更加接近Vue组件的表现(不会出现shadow节点下再去创建元素)
    virtualHost: true
  },
  props: {
    value: {
      type: Boolean,
      default: false
    }
  },
  data() {
    return {
      openModal: false,
      userInfo: {},
      userInfodata: {
        avatar: '',
        nick_name: '',
        img: ''
      }
    }
  },
  watch: {
    value: {
      handler(val) {
        this.openModal = val
      },
      immediate: true
    }
  },
  mounted() {
    this.userInfo.img = uni.getStorageSync('userInfo').img
    this.userInfo.avatar = uni.getStorageSync('userInfo').avatar
    this.userInfo.nick_name = uni.getStorageSync('userInfo').nick_name
    if (this.userInfo.avatar) {
      this.userInfodata.img = this.userInfo.avatar
      this.userInfodata.avatar = this.userInfo.img
      this.userInfodata.nick_name = this.userInfo.nick_name
    }
   

  },
  methods: {
    // 处理微信头像选择
    onChooseAvatar(e) {
      const { avatarUrl } = e.detail
      if (avatarUrl) {
        this.userInfodata.img = avatarUrl
        this.userInfodata.avatar = avatarUrl
        uni.showToast({
          title: '已选择微信头像',
          icon: 'success'
        })
      }
    },

    // 处理微信昵称输入
    onNicknameInput(e) {
      this.userInfodata.nick_name = e.detail.value
    },

    // 微信昵称输入框失去焦点
    onNicknameBlur(e) {
      if (e.detail.value) {
        uni.showToast({
          title: '已更新昵称',
          icon: 'success',
          duration: 1000
        })
      }
    },

    // 更新用户信息
    submitUserInfo() {
      if (!this.userInfodata.avatar || !this.userInfodata.nick_name) {
        return uni.showToast({
          icon: 'none',
          title: '请选择头像和输入用户信息'
        })
      }
      this.$emit('updated', this.userInfodata)
    },

    // 关闭弹框
    closeModal() {
      this.$emit('input', false)
    }
  }
}
</script>

<style lang="scss" scoped>
@import '../../static/iconfont.css';

.wx-authorization-modal {
  position: fixed;
  left: 0;
  top: 0;
  width: 100vw;
  height: 100vh;
  z-index: 99998;

  view {
    box-sizing: border-box;
  }

  .image {
    width: 100%;
    height: 100%;
    border-radius: inherit;
  }

  .wam {

    /* mask */
    &__mask {
      position: absolute;
      left: 0;
      top: 0;
      width: 100%;
      height: 100%;
      background-color: rgba(0, 0, 0, 0.5);
      opacity: 0;
      animation: showMask 0.25s ease 0.1s forwards;
    }

    /* close-btn */
    &__close-btn {
      position: absolute;
      top: 30rpx;
      right: 30rpx;
      z-index: 99999;
    }

    /* wrapper */
    &__wrapper {
      position: absolute;
      left: 0;
      bottom: 0;
      width: 100%;
      background-color: #FFFFFF;
      border-radius: 20rpx 20rpx 0rpx 0rpx;
      padding: 40rpx;
      padding-top: 60rpx;
      padding-bottom: 40rpx;
      padding-bottom: calc(constant(safe-area-inset-bottom) + 40rpx);
      padding-bottom: calc(env(safe-area-inset-bottom) + 40rpx);
      transform-origin: center bottom;
      transform: scaleY(0);
      animation: showWrapper 0.25s ease 0.1s forwards;
      z-index: 99999;
    }

    /* title */
    &__title {
      font-size: 34rpx;
    }

    /* sub-title */
    &__sub-title {
      font-size: 26rpx;
      color: #AAAAAA;
      margin-top: 16rpx;
      padding-bottom: 30rpx;
    }

    /* 头像选择 */
    &__avatar {
      width: 100%;
      margin-top: 30rpx;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      
      .current-avatar {
        position: relative;
        margin-bottom: 40rpx;
        
        .avatar-preview {
          width: 200rpx;
          height: 200rpx;
          border-radius: 50%;
          overflow: hidden;
          box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.15);
          border: 8rpx solid rgba(255, 255, 255, 0.8);
          
          .avatar-image {
            width: 100%;
            height: 100%;
            border-radius: inherit;
          }
        }
        
        .avatar-overlay {
          position: absolute;
          bottom: -10rpx;
          right: -10rpx;
          width: 60rpx;
          height: 60rpx;
          background-color: #07c160;
          border-radius: 50%;
          border: 6rpx solid #FFFFFF;
          display: flex;
          align-items: center;
          justify-content: center;
          
          .tn-icon-check {
            font-size: 36rpx;
            color: #FFFFFF;
          }
        }
      }
      
      .avatar-options {
        display: flex;
        justify-content: space-between;
        width: 100%;
        gap: 20rpx;
        
        .option-btn {
          flex: 1;

          .wechat-avatar-btn {
            width: 100%;
            height: 80rpx;
            border-radius: 50rpx;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 28rpx;
            background-color: #07c160;
            color: white;
            box-shadow: 0 4rpx 15rpx rgba(7, 193, 96, 0.2);

            .tn-icon-wechat-fill {
              font-size: 32rpx;
              margin-right: 10rpx;
            }
          }
        }
      }
    }

    /* 昵称 */
    &__nickname {
      margin-top: 40rpx;
      width: 100%;
      
      .current-nickname {
        display: flex;
        flex-direction: column;
        align-items: center;
        margin-bottom: 30rpx;
        
        .nickname-label {
          font-size: 24rpx;
          color: #999;
          margin-bottom: 10rpx;
        }
        
        .nickname-display {
          font-size: 32rpx;
          color: #333;
          font-weight: bold;
          padding: 16rpx 30rpx;
          background-color: #f8f8f8;
          border-radius: 50rpx;
          box-shadow: 0 4rpx 15rpx rgba(0, 0, 0, 0.08);
        }
      }

      .nickname-input-wrapper {
        width: 100%;
        padding: 20rpx 30rpx;
        background-color: #f0f9ff;
        border-radius: 16rpx;
        box-shadow: 0 8rpx 30rpx rgba(0, 0, 0, 0.12);

        .nickname-input {
          width: 100%;
          height: 90rpx;
          padding: 0;
          font-size: 30rpx;
        }
      }
    }

    /* 保存按钮 */
    &__submit-btn {
      width: 100%;
      background-color: #05C160;
      color: #FFFFFF;
      margin-top: 60rpx;
      margin-bottom: 10vh;
      border-radius: 10rpx;
      padding: 25rpx;
      font-size: 32rpx;
      display: flex;
      align-items: center;
      justify-content: center;

      &.disabled {
        background-color: #E6E6E6;
      }
    }


  }
}

.tn-btn-hover-class {
  box-shadow: inset 10rpx 2rpx 40rpx 0rpx rgba(0, 0, 0, 0.05);
}

@keyframes showMask {
  0% {
    opacity: 0;
  }

  100% {
    opacity: 1;
  }
}

@keyframes showWrapper {
  0% {
    transform: scaleY(0);
  }

  100% {
    transform: scaleY(1);
  }
}
</style>