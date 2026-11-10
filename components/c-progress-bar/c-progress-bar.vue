<template>
	<view>
		<view class="slider-container">
			<view class="flex"></view>
			<movable-area class="sliderBar" :style="{width: (100)+'%'}">
				<view class="gone" :style="{width: x +'px',background:color}"></view>
				<movable-view class="slider" :style="{ '--bgColor': color }" :animation='false' ref='sliderBarBT' :x="x"
					direction="all" @change="onChange">
					<text>{{ score }}</text>
				</movable-view>
			</movable-area>
			<view :style="{ width: (minScore / maxScore) * 100 + '%', '--bgColor': color }"></view>
			<view class="dot1 dot" :style="{background:color}" :class="score>0?'':'dotNo'" @click.stop="onbai(0)">
			</view>
			<view class="dot25 dot" :style="{background:color}" :class="score>25?'':'dotNo'" @click.stop="onbai(25)">
				<text class="dot-tip" :style="{ '--bgColor': color }" :class="score>=25?'dot-tipNo':''">
					25%
				</text>
			</view>
			<view class="dot50 dot" :style="{background:color}" :class="score>50?'':'dotNo'" @click.stop="onbai(50)">
				<text class="dot-tip" :style="{ '--bgColor': color }" :class="score>=50?'dot-tipNo':''">
					50%
				</text>
			</view>
			<view class="dot75 dot" :style="{background:color}" :class="score>75?'':'dotNo'" @click.stop="onbai(75)">
				<text class="dot-tip" :style="{ '--bgColor': color }" :class="score>=75?'dot-tipNo':''">
					75%
				</text>
			</view>
			<view class="dot100 dot" :class="score>=100?'':'dotNo'" @click.stop="onbai(100)">
				<text class="dot-tip" style="left: -350%;" :style="{ '--bgColor': color }"
					:class="score>=100?'dot-tipNo':''">
					100%
				</text>
			</view>
		</view>
	</view>
</template>

<script>
	export default {
		props: {
			max: {
				type: Number,
				default: 100
			},
			min: {
				type: Number,
				default: 0
			},
			color: {
				type: String,
				default: '#E45360'

			}
		},
		computed: {
			mainColor() {
				return this.color
			},
		},
		data() {
			return {
				slideBarWidth: 0,
				minScore: this.min ? this.min : 0,
				maxScore: this.max ? this.max : 100,
				x: 0,
				y: 0,
				score: this.min ? this.min : 0,
				pTime: '',
				isUpdating:false
			};
		},
		mounted() {
			var that = this;
			// 解决报错问题
			let el = uni.createSelectorQuery().in(this)
			this.$nextTick(() => {
				el.select(".slider-container").boundingClientRect(function(res) {
					that.slideBarWidth = res.width
				}).exec();
			})
		},
		methods: {
			onbai(e) {
				this.score = e
				//计算x的值
				this.x = this.score / 100 * this.slideBarWidth
				this.$emit('change', this.score)
			},
			onChange: function(e, i) {
				if (this.isUpdating) {
							return;
						}
						this.isUpdating = true;
				this.pTime = setTimeout(() => {
					this.x = e.detail.x
					this.score = parseInt(this.x / this.slideBarWidth * this.maxScore)
					this.$emit('change', this.score)
					clearTimeout(this.pTime)
					this.isUpdating = false; // 重置状态标志
				}, 10)

			}
		}
	}
</script>

<style lang="scss" scoped>
	$uni-color-primary: #3A84FA;

	.slider-container {
		display: flex;
		width: 100%;
		height: 32rpx;
		position: relative;

		.dot-tipNo {
			color: var(--bgColor)
		}

		.dotNo {
			border: 2rpx solid #ccc !important;
			background: #fff !important;
			width: 18rpx !important;
			height: 18rpx !important;
		}

		.dot-tip {
			position: absolute;
			top: 30rpx;
			left: -200%;
		}

		.dot {
			position: absolute;
			width: 20rpx;
			height: 20rpx;
			z-index: 1;
			border-radius: 50%;
		}

		.dot1 {
			top: 25%;
		}

		.dot25 {
			top: 25%;
			left: 25%;


		}

		.dot50 {
			top: 25%;
			left: 50%;
		}

		.dot75 {
			top: 25%;
			left: 75%;
		}

		.dot100 {
			top: 25%;
			left: 100%;
		}

		&::before {
			content: '';
			position: absolute;
			height: 4rpx;
			border-radius: 8rpx;
			background-color: #C8CED9;
			top: 50%;
			left: 0;
			transform: translateY(-50%);
			width: 100%;
		}

		.flex {
			flex: 1;
			height: 8rpx;
			border-radius: 8rpx 0 0 8rpx;
			background-color: $uni-color-primary;
			margin-top: 12rpx;
			position: relative;
			z-index: 1;
		}

		.sliderBar {
			height: 100%;
			border-radius: 8rpx;
			width: 100%;

			.gone {
				height: 100%;
				position: absolute;
				left: 0;
				height: 4rpx;
				top: 14rpx;
				max-width: 100%;
				z-index: 1;
				border-radius: 0 8rpx 8rpx 0;
			}

			.slider {
				width: 0;
				height: 100%;
				position: relative;
				z-index: 2;

				&::after {
					content: '≡';
					position: absolute;
					// border-radius: 16rpx;
					background-color: #fff;
					text-align: center;
					line-height: 36rpx;
					top: 0rpx;
					left: -34rpx;
					border: 2px solid var(--bgColor);
					width: 36rpx;
					height: 36rpx;
					color: var(--bgColor);
					transform: rotate(90deg) translatey(-50%);

				}

				text {
					position: absolute;
					width: 60rpx;
					color: white;
					border-radius: 14rpx;
					// top: -140%;
					top: -54rpx;
					// left: 50%;
					left: 10rpx;
					text-align: center;
					transform: translateX(-50%);
					background-color: var(--bgColor);

					&::after {
						content: '';
						position: absolute;
						border: 6rpx solid transparent;
						border-top-color: var(--bgColor);
						top: 99%;
						left: 50%;
						transform: translateX(-50%);
					}
				}
			}
		}
	}
</style>