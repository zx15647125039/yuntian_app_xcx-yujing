<template>
    <view class="sv-danmaku">
        <view class="danmaku-content" id="danmaku" @click="barrage">
            <sv-danmaku-track ref="danmakuTrackRef" :style="{ opacity: dmOpacity }"
                :container="danmakuContainer"></sv-danmaku-track>
        </view>
        <view class="danmaku-input" :style="{ display: show ? 'block' : 'none' }">
            <uni-easyinput v-model="dmText" trim prefixIcon="chat" suffixIcon="gear" placeholder="请输入弹幕内容"
                @iconClick="iconClick">
                <template #right>
                    <button class="danmaku-input-send" size="mini" @click="send">发送</button>
                </template>
            </uni-easyinput>
        </view>
        <!-- 弹幕面板设置 点击chat -->
        <view class="danmaku-panel" v-if="showPanel">
            <view class="panel-header">
                弹幕面板设置
                <uni-icons type="closeempty" size="16" class="close-icon" @click="closePanel"></uni-icons>
            </view>
            <view class="panel-main">
                <view class="flex-center-between">
                    不透明度
                    <slider class="sv-uni-slider" :value="dmOpacity" step="0.1" min="0" max="1" block-size="12"
                        block-color="#fb7299" show-value @change="changeSlider($event, 'dm-opacity')" />
                </view>
                <view class="flex-center-between">
                    密集程度
                    <slider class="sv-uni-slider" :value="dmDense" step="1" min="1" max="5" block-size="12"
                        block-color="#fb7299" show-value @change="changeSlider($event, 'dm-dense')" />
                </view>
            </view>
        </view>
        <!-- 弹幕输入设置 点击gear -->
        <view class="danmaku-setting" v-if="showSetting">
            <view class="panel-header">
                弹幕输入设置
                <uni-icons type="closeempty" size="16" class="close-icon" @click="closePanel"></uni-icons>
            </view>
            <view class="panel-main">
                <view class="flex-center-between">
                    弹幕字号
                    <slider class="sv-uni-slider" :value="dmSize" step="1" min="12" max="24" block-size="12"
                        block-color="#fb7299" show-value @change="changeSlider($event, 'dm-size')" />
                </view>
                <view class="flex-center-between">
                    弹幕速度
                    <slider class="sv-uni-slider" :value="dmSpeed" step="1" min="1" max="5" block-size="12"
                        block-color="#fb7299" show-value @change="changeSlider($event, 'dm-speed')" />
                </view>
                <view class="flex-center-between">
                    字体颜色
                    <uni-easyinput class="text-color-input" v-model="dmColor" :clearable="false"
                        disabled></uni-easyinput>
                    <view class="color-cube" :style="{ backgroundColor: dmColor, marginRight: '8rpx' }"></view>
                </view>
                <view v-for="item in colorList" :key="item" :class="['color-cube', dmColor == item ? 'is-select' : '']"
                    :style="{ backgroundColor: item, marginLeft: '24rpx' }" @click="selectColor(item)"></view>
            </view>
        </view>
    </view>
</template>

<script>
import SvDanmakuTrack from './sv-danmaku-track.vue';
export default {
    components: { SvDanmakuTrack },
    props: {
        /**
         * 弹幕数据列表
         */
        list: {
            type: Array,
            default: () => []
        },
        /**
         * 发送按钮节流时长(ms)
         */
        throttle: {
            type: Number,
            default: 5000
        },
        /**
         * 弹幕循环
         */
        loop: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            show: false,
            danmakuContainer: {},
            showPanel: false,
            showSetting: false,
            dmText: '',
            dmColor: uni.getStorageSync('danmaku-config')?.dmColor || '#FB7299',
            dmSize: uni.getStorageSync('danmaku-config')?.dmSize || 14,
            dmSpeed: uni.getStorageSync('danmaku-config')?.dmSpeed || 3, // 建议默认3挡
            dmOpacity: uni.getStorageSync('danmaku-config')?.dmOpacity || 1, // 建议默认1
            dmDense: uni.getStorageSync('danmaku-config')?.dmDense || 1, // 建议默认1
            colorList: [
                '#FE0302',
                '#FF7204',
                '#FFAA02',
                '#FFD302',
                '#FFFF00',
                '#00CD00',
                '#FB7299',
                '#66CCFF',
                '#9B9B9B',
                '#019899',
                '#CC0273',
                '#4266BE',
                '#222222',
                '#FFFFFF'
            ],
            sendThrottle: 0, // 发送节流时间标志，初始为0
            timer: null, // 循环计时器实例
            dmIndex: 0, // 当前弹幕索引
            userInfo: {}
        }
    },
    created() { },
    mounted() {
        this.$nextTick(() => {
            this.renderDanmakuContainer()
        })
        this.userInfo = uni.getStorageSync('userInfo')
        console.log("🚀 ~ mounted ~ this.userInfo:", this.danmakuContainer)
    },
    computed: {
        // 计时器间隔毫秒数
        timerMs() {
            return Math.round(2000 / this.dmDense) // 指数2000视情况调整
        }
    },
    methods: {
        renderDanmakuContainer() {
            // 等dom渲染完成后获取弹幕容器宽高
            const query = uni.createSelectorQuery().in(this)
            query
                .select('#danmaku')
                .boundingClientRect((data) => {
                    const { width, height } = data
                    this.danmakuContainer = {
                        width,
                        height
                    }
                })
                .exec()
        },
        iconClick(e) {
            switch (e) {
                case 'prefix':
                    this.showSetting = false
                    this.showPanel = !this.showPanel
                    break
                case 'suffix':
                    this.showPanel = false
                    this.showSetting = !this.showSetting
                    break
            }
        },
        /**
         * 弹幕列表整体装载 - 弃用，建议使用计时器分片装载方式
         * @param {Object} list 弹幕列表
         * 弹幕项参数
         * {
            id: `dmid_${Date.now()}`, // 可根据情况调整
            text: this.dmText,
            speed: this.dmSpeed,
            style: {
              color: this.dmColor,
              fontSize: this.dmSize + 'px'
            },
            // 可继续添加自定义的参数，例如账号信息等
          }
         */
        load(list) {
            console.log("🚀 ~ load ~ list:", list)
            this.$nextTick(() => {
                this.$refs.danmakuTrackRef.dmLoad(list)
            })
        },
        createTimer() {
            this.stopTimer()
            console.log('==== createTimer ====')
            this.timer = setInterval(() => {
                this.$nextTick(() => {
                    // console.log('==== 发送弹幕 :', this.dmIndex, this.list[this.dmIndex])
                    this.$refs.danmakuTrackRef.add(this.list[this.dmIndex])
                    if (this.loop) {
                        // 开启弹幕循环
                        this.dmIndex = ++this.dmIndex > this.list.length - 1 ? 0 : this.dmIndex
                    } else {
                        // 关闭弹幕循环
                        this.dmIndex = ++this.dmIndex > this.list.length - 1 ? -1 : this.dmIndex
                    }
                    if (this.dmIndex == -1) {
                        // 关闭弹幕循环时，完成所有弹幕装填后需要停止timer，并重置索引
                        this.stopTimer()
                        this.dmIndex = 0
                    }
                })
            }, this.timerMs)
        },
        stopTimer() {
            if (this.timer) {
                console.log('==== stopTimer ====')
                clearInterval(this.timer)
                this.timer = null
            }
        },
        clearTimer() {
            this.stopTimer()
            console.log('==== clearTimer ====')
            // 重置相关参数
            this.dmIndex = 0
            this.$refs.danmakuTrackRef.clearDmlist()
        },
        // 发送
        send() {
            // 拦截空弹幕
            if (!this.dmText) {
                uni.showToast({
                    title: '请输入弹幕内容',
                    icon: 'none'
                })
                return
            }

            // 节流throttle毫秒
            if (Date.now() - this.sendThrottle < this.throttle) {
                uni.showToast({
                    title: '发送太频繁啦~',
                    icon: 'none'
                })
                return
            }
            // 节流标志更新赋值
            this.sendThrottle = Date.now()
            // 弹幕数据参数
            const dmItem = {
                // id: `dmid_${Date.now()}`, // 可根据情况调整
                text: this.dmText,
                speed: this.dmSpeed,
                style: {
                    color: this.dmColor,
                    fontSize: this.dmSize + 'px'
                },
                // 可继续添加自定义的参数，例如账号信息，时间等
                // create_date: Date.now(),
                // creator: '5555',
                nickName: uni.getStorageSync('userInfo')?.nick_name || '匿名用户'
            }
            // 发送弹幕
            this.$refs.danmakuTrackRef.add(dmItem)
            this.$emit('send', dmItem)
            // 发送成功后清空输入框
            this.dmText = ''
        },
        closePanel() {
            this.showSetting = false
            this.showPanel = false
        },
        selectColor(color) {
            this.dmColor = color
            const danmakuConfig = uni.getStorageSync('danmaku-config')
            uni.setStorageSync(
                'danmaku-config',
                Object.assign({ ...danmakuConfig }, { dmColor: this.dmColor })
            )
        },
        changeSlider(e, type) {
            const danmakuConfig = uni.getStorageSync('danmaku-config')
            switch (type) {
                case 'dm-size':
                    this.dmSize = e.detail.value
                    uni.setStorageSync(
                        'danmaku-config',
                        Object.assign({ ...danmakuConfig }, { dmSize: this.dmSize })
                    )
                    break
                case 'dm-speed':
                    this.dmSpeed = e.detail.value
                    uni.setStorageSync(
                        'danmaku-config',
                        Object.assign({ ...danmakuConfig }, { dmSpeed: this.dmSpeed })
                    )
                    break
                case 'dm-opacity':
                    this.dmOpacity = e.detail.value
                    uni.setStorageSync(
                        'danmaku-config',
                        Object.assign({ ...danmakuConfig }, { dmOpacity: this.dmOpacity })
                    )
                    break
                case 'dm-dense':
                    this.dmDense = e.detail.value
                    uni.setStorageSync(
                        'danmaku-config',
                        Object.assign({ ...danmakuConfig }, { dmDense: this.dmDense })
                    )
                    this.createTimer()
                    break
            }
        },
        barrage() {
            this.show = !this.show
        }
    }
}
</script>

<style lang="scss">
.sv-danmaku {
    width: 100%;
    height: 100%;
    position: relative;

    --panel-text-color: #000000;

    .danmaku-content {
        width: 100%;
        height: calc(100% - 100rpx);
        position: relative;
    }

    .danmaku-input {
        width: 90%;
        height: 80rpx;
        margin: 0 auto;
        // margin-top: 20rpx;

        :deep(.uni-icons) {
            font-size: 20px;
        }

        .danmaku-input-send {
            width: 140rpx;
            margin-right: 6rpx;
            background-color: #0D80E8;
            color: #ffffff;

            &:active {
                background-color: #50a3ec;
            }
        }
    }

    .danmaku-panel {
        width: 200px;
        background-color: rgba(251, 114, 153, 0.25);
        position: absolute;
        left: 0;
        bottom: 100rpx;
        border-radius: 12rpx;
        padding: 12rpx;
        box-sizing: border-box;
        font-size: 14px;
        color: var(--panel-text-color);

        &::after {
            content: '';
            width: 30rpx;
            height: 20rpx;
            position: absolute;
            bottom: -20rpx;
            left: 16rpx;
            background-color: inherit;
            clip-path: polygon(0% 0%, 100% 0%, 50% 100%, 0% 0%);
        }
    }

    .danmaku-setting {
        width: 200px;
        background-color: rgba(251, 114, 153, 0.25);
        position: absolute;
        right: 128rpx;
        bottom: 100rpx;
        border-radius: 12rpx;
        padding: 12rpx;
        box-sizing: border-box;
        font-size: 14px;
        color: var(--panel-text-color);

        &::after {
            content: '';
            width: 30rpx;
            height: 20rpx;
            position: absolute;
            bottom: -20rpx;
            right: 18rpx;
            background-color: inherit;
            clip-path: polygon(0% 0%, 100% 0%, 50% 100%, 50% 100%, 0% 0%);
        }
    }

    .panel-header {
        margin-bottom: 12rpx;
    }

    .close-icon {
        float: right;
    }

    .panel-main {
        line-height: 2;
    }

    .text-color-input {
        width: 52%;
        flex: unset;

        :deep(.uni-easyinput__content-input) {
            height: unset;
            min-height: unset;
            font-size: 12px;
            padding: 8rpx 0;
        }
    }

    .color-cube {
        width: 24rpx;
        height: 24rpx;
        background-color: #0D80E8;
        display: inline-block;
    }

    .is-select {
        border: 1px solid #ffffff;
        box-shadow: 4rpx 4rpx 6rpx 0 rgba(255, 255, 255, 0.5);
    }
}

.flex-center-between {
    display: flex;
    align-items: center;
    justify-content: space-between;
}

.sv-uni-slider {
    flex: 1;
    margin: unset;
    margin-left: 40rpx;
}
</style>
