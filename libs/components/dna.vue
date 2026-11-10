<template>
    <view>
        <view class="container">
            <!-- --d为自定义属性，CSS中可通过var函数对其调用 -->
            <view v-for="(number, index) in 18" :key="index">
                <view v-if="number % 3 == 0">
                    <!-- show为true时，显示line,否则显示line1 -->
                    <view :class="show ? 'line' : 'line1'" ref="line" :style="{ '--d': number }">
                        <span style="background-image: none;">
                            <view @click="tn(item, index2)" v-for="(item, index2) in list" :key="index2"
                                v-if="index2 + 1 == number / 3" class="tn-flex tn-flex-row-center  tn-text-bold"
                                style="margin-top:-36rpx;margin-left: 15rpx; margin-right: 40rpx; ">
                                <view
                                    class="justify-content-item tn-padding-xs tn-text-center bg-flex-shadow tn-shadow-blur tn-flex-basic-md"
                                    style="border-top-left-radius: 50rpx;border-bottom-left-radius: 50rpx;background:radial-gradient(circle at 70% 30%, rgb(10, 175, 230), rgb(96 161 186))">
                                    <view>{{ item.name }}</view>
                                    <view>
                                        <text class="tn-icon-time"></text>
                                        {{ item.time }}
                                    </view>
                                </view>
                                <view
                                    class="justify-content-item tn-padding-xs tn-text-center bg-flex-shadow tn-shadow-blur tn-flex-basic-md"
                                    style="border-top-right-radius: 50rpx;border-bottom-right-radius: 50rpx;background: radial-gradient(circle at 30% 70%, rgb(10, 175, 230), rgb(96 161 186));">
                                    <view>{{ item.value }}</view>
                                    <view @click.stop="details(item)">查看详情</view>

                                </view>
                            </view>

                        </span>
                    </view>
                </view>
                <view :class="show ? 'line' : 'line1'" :style="{ '--d': number }" v-else><span></span></view>
            </view>
        </view>
        <!-- 历史信息 -->
        <!-- 透明度 -->
        <tn-popup v-model="show1" mode="bottom" height="60%" :backgroundColor="backgroundColor"
            style="color: #ffffff; background:rgba(0,0,0,0.5);">
            <history_info :show1="show1" :time_line_list="time_line_list"></history_info>
        </tn-popup>

    </view>
</template>

<script>
import history_info from '@/libs/components/history_info.vue'

export default {
    components: {
        history_info,
    },
    name: 'dna',
    props: {
        list: {},
        show: {
            type: Boolean,
            default: true
        }
    },
    data() {
        return {
            backgroundColor: 'transparent',
            show: true,
            show1: false,
            time_line_list: [
                {
                    title: '2024.4.11',
                    title_span: '绑定',
                    content: '568947569',
                    time: '2024.4.11'
                },
                {
                    title: '2023.4.11',
                    title_span: '解绑',
                    content: '568947569',
                    time: '2024.4.11'
                },
                {
                    title: '2022.4.11',
                    title_span: '绑定',
                    content: '568947569',
                    time: '2024.4.11'
                },
                {
                    title: '2021.4.11',
                    title_span: '解绑',
                    content: '568947569',
                    time: '2024.4.11'
                },
                {
                    title: '2024.4.11',
                    title_span: '绑定',
                    content: '568947569',
                    time: '2024.4.11'
                },


            ],
            time: 0,
            isclick: true,
        }
    },
    onPageScroll() {
        this.$refs.timeline.getScroll();
    },
    onPageScroll() {
        if (this.isclick) {
            this.timer();
            this.$refs.timeline.getScroll();
        }
    },

    methods: {
        timer() {
            if (this.time > 0) {
                this.isclick = false;
                this.time--;
                setTimeout(this.timer, 1)
            }
            else {
                this.isclick = true;
                this.time = 10
            }
        },
        tn(item, index) {

            // uni.navigateTo({
            // 	url: e,
            // });

            if (index == 0) {
                this.show = false;
                return
            }
            if (item.name == '项圈号') {
                var output = this.list.find(object => object.name === '项圈芯片号');
                let data = output;
                this.list = this.list.filter(items => items.name !== output.name);
                this.list.unshift(output);
                //停止动画
                this.show = false;
            }
            if (item.name == '耳钉号') {
                var output = this.list.find(object => object.name === '耳钉芯片号');
                let data = output;
                this.list = this.list.filter(items => items.name !== output.name);

                this.list.unshift(output);
                this.show = false;
            }
            let data = item;
            this.list = this.list.filter(items => items.name !== item.name);
            this.list.unshift(data);
            this.show = false;
        },
        details() {
            this.show1 = true
            //初始化history_info组件
        },


    }
}
</script>

<style lang="scss">
* {
    /* 初始化 */
    margin: 0;
    padding: 0;
}

body {
    /* 100%窗口高度 */
    height: 100vh;
    /* 弹性布局 水平+垂直居中 */
    display: flex;
    justify-content: center;
    align-items: center;
    background-color: #000;
}

.container {
    width: 200px;
    height: 150vh;
    /* 开启3D效果 */
    transform-style: preserve-3d;
    /* 定义3D元素距视图的距离 */
    perspective: 1000px;
    /* 沿Z轴旋转15度 */
    transform: rotateZ(0deg);

}

.tn-popup--bottom {
    //去掉背景色
    background-color: none;
}

.container .line {
    width: 300px;
    height: 20px;
    /* 绝对定位 */
    position: absolute;
    /* 结合自定义属性--d，计算 top */
    top: calc(40px * var(--d));
    /* 执行动画：动画名 时长 线性 无限播放 */
    animation: roll 4s linear 10;
    /* 结合自定义属性--d，计算动画延迟时间 */
    animation-delay: calc(0.3s * var(--d));
}

/* 两边两个圆的统一样式 */
.container .line::before,
.container .line::after {
    content: "";
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #0094ff;
    background: radial-gradient(circle at 70% 30%, #0aafe6, #222222);
}

/* 左圆 */
.container .line::before {
    background-color: #E60116;
    position: absolute;
    left: 10rpx;
    transform-style: preserve-3d;

}

/* 右圆 */
.container .line::after {
    background-color: #3646FF;
    position: absolute;
    right: 0;
}


.container .line1 {
    width: 300px;
    height: 30px;
    /* 绝对定位 */
    position: absolute;
    /* 结合自定义属性--d，计算 top */
    top: calc(40px * var(--d));
    /* 执行动画：动画名 时长 线性 无限播放 */
    /* 只执行一次 */
    /* animation: rotate 4s linear 1; */
    /* 结合自定义属性--d，计算动画延迟时间 */
    animation-delay: calc(0.3s * var(--d));
}

/* 两边两个圆的统一样式 */
.container .line1::before,
.container .line1::after {
    content: "";
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background-color: #0094ff;
    background: radial-gradient(circle at 70% 30%, #0aafe6, #222222);
}

/* 左圆 */
.container .line1::before {
    background-color: #E60116;
    position: absolute;
    left: 0;
    transform-style: preserve-3d;

}

/* 右圆 */
.container .line1::after {
    background-color: #3646FF;
    position: absolute;
    right: 0;
}

@keyframes rotate {
    0% {
        transform: rotateX(0deg) rotateY(0deg);
    }

    100% {
        transform: rotateX(360deg) rotateY(360deg);
    }

}

/* 中间的线 */
.container .line span {
    width: 270px;
    height: 2rpx;
    /* background-color: #FFF420; */
    background-image: linear-gradient(to right, #0aafe6, #222222);
    position: absolute;
    left: 20px;
    top: 10px;
}

/* 中间的线 */
.container .line1 span {
    width: 270px;
    height: 2rpx;
    /* background-color: #FFF420; */
    background-image: linear-gradient(to right, #0aafe6, #222222);
    position: absolute;
    left: 20px;
    top: 10px;
}

/* 定义旋转动画 */
@keyframes roll {

    /* 100% {
        transform: rotateY(360deg);
    } */

    50% {
        transform: rotateY(180deg);
    }
}
</style>