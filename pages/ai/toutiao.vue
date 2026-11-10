<template>
	<view class="oa-content">
		<tn-nav-bar fixed customBack :bottomShadow="false" backgroundColor="#EBECF0">
			<view slot="back" class='tn-custom-nav-bar__back' @click="goBack">
				<text class='tn-icon-left-arrow'></text>
			</view>
			<view class="tn-flex tn-flex-col-center tn-flex-row-center">
				<text class="tn-text-bold tn-text-xl tn-color-black">行业资讯</text>
			</view>
		</tn-nav-bar>

		<view class="main-body" :style="{ paddingTop: (vuex_custom_bar_height + 10) + 'px' }">
			
			<view class="tab-container">
				<view class="tab-item" :class="{'tab-active neu-inset': currentTab === 0, 'neu-outset': currentTab !== 0}" @click="switchTab(0)">
					云天资讯
				</view>
				<view class="tab-item tn-margin-left" :class="{'tab-active neu-inset': currentTab === 1, 'neu-outset': currentTab !== 1}" @click="switchTab(1)">
					招聘资讯
				</view>
			</view>

			<view class="chat-container">
				<view v-for="(news, index) in displayList" :key="index">
					<view v-if="news && news.trim().length > 0" class="message-row ai-row animate-fade-in">
						<view class="ai-msg-group">
							<view class="ai-header">
								<image src="https://ytzy-college-img.oss-cn-wulanchabu.aliyuncs.com/wximg/a/home.png" class="ai-avatar neu-outset" />
								<text class="ai-name">{{ currentTab === 0 ? '行业动态' : '招聘信息' }} {{ index + 1 }}</text>
							</view>
							<view class="ai-content-bubble neu-inset">
								<view class="ai-text-render">
									<text>{{ news }}</text>
									<view class="ai-voice-ctrl" @click="playNewsAudio(news, index)">
										<view class="ctrl-inner neu-outset-btn">
											<text :class="[isPlayingTTS && currentPlayingIdx === index ? 'tn-icon-sound-stop tn-color-red' : 'tn-icon-sound tn-color-blue']"></text>
											<text class="ctrl-text">{{ isPlayingTTS && currentPlayingIdx === index ? '停止' : '播报' }}</text>
										</view>
									</view>
								</view>
							</view>
						</view>
					</view>
				</view>

				<view v-if="loading && (!displayList[activeIdx] || displayList[activeIdx].length === 0)" class="message-row ai-row">
					<view class="ai-content-bubble neu-inset" style="width: 120rpx; display: flex; justify-content: center;">
						<view class="dot-loader">
							<view class="dot"></view><view class="dot"></view><view class="dot"></view>
						</view>
					</view>
				</view>

				<view class="ai-disclaimer">
					<text>内容AI生成，实时同步，仅供参考</text>
				</view>
				<view style="height: 240rpx;"></view>
			</view>
		</view>

		<view class="footer-fixed">
			<view class="bottom-bar-container">
				<view class="press-btn-wrap">
					<view class="press-btn-main neu-outset" :class="{'is-active': loading}" @click="fetchNews">
						<text class="tn-icon-add tn-margin-right-xs"></text>
						<text>{{ loading ? '正在同步...' : '获取下一条' + (currentTab === 0 ? '资讯' : '招聘') }}</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import template_page_mixin from '@/libs/mixin/template_page_mixin.js'
	import api from '@/api/index.js' 
	let ttsPlugin = null;

	export default {
		mixins: [template_page_mixin],
		data() {
			return {
				currentTab: 0, // 0: 云天资讯, 1: 招聘资讯
				newsList: [],  // 云天资讯列表
				jobList: [],   // 招聘资讯列表
				
				loading: false,
				isPlayingTTS: false,
				currentPlayingIdx: -1,
				ttsAudioContext: null,
				requestTask: null,
				
				renderQueue: [],    
				renderTimer: null,  
				isFinished: false,
				activeIdx: -1 
			}
		},
		computed: {
			// 根据 Tab 返回当前显示的数据源
			displayList() {
				return this.currentTab === 0 ? this.newsList : this.jobList;
			}
		},
		onLoad() {
			this.initAudioAndPlugins();
			this.fetchNews(); 
		},
		methods: {
			initAudioAndPlugins() {
				// #ifdef MP-WEIXIN
				ttsPlugin = requirePlugin("WechatSI");
				// #endif
				this.ttsAudioContext = uni.createInnerAudioContext();
			},

			switchTab(index) {
				if (this.loading || this.currentTab === index) return;
				this.terminateAll();
				this.currentTab = index;
				this.initAudioAndPlugins();
				// 如果当前 Tab 没数据，自动抓取第一条
				if (this.displayList.length === 0) {
					this.fetchNews();
				}
			},

			fetchNews() {
				if (this.loading) return;
				this.loading = true;
				
				const targetList = this.currentTab === 0 ? this.newsList : this.jobList;
				targetList.push(""); 
				this.activeIdx = targetList.length - 1;
				
				this.renderQueue = [];
				this.isFinished = false;
				this.startTypewriter();

				// 根据 Tab 选择接口
				const streamApi = this.currentTab === 0 ? api.droneNewsStream : api.jobNewsStream;
				
				this.requestTask = streamApi((res) => {
					let content = "";
					if (typeof res === 'object' && res !== null) {
						content = res.data || "";
						if (res.event === 'complete' || content.includes('获取完成')) {
							this.isFinished = true;
							return;
						}
					} else if (typeof res === 'string') {
						content = res;
						if (content.includes('event:complete') || content.includes('获取完成')) {
							this.isFinished = true;
							return;
						}
					}

					if (!content || content.includes('data:') || content.includes('event:')) return;
					
					content.split('').forEach(char => {
						this.renderQueue.push(char);
					});
					
				}).then(() => {
					this.isFinished = true;
				}).catch(err => {
					this.isFinished = true;
					this.loading = false;
				});
			},

			startTypewriter() {
				if (this.renderTimer) clearInterval(this.renderTimer);
				const targetList = this.currentTab === 0 ? this.newsList : this.jobList;
				
				this.renderTimer = setInterval(() => {
					if (this.renderQueue.length > 0) {
						const processCount = this.renderQueue.length > 20 ? 3 : 1;
						for(let i=0; i < processCount; i++) {
							const char = this.renderQueue.shift();
							if(!char) break;
							const currentContent = targetList[this.activeIdx] || "";
							this.$set(targetList, this.activeIdx, currentContent + char);
						}
						if (this.renderQueue.length % 3 === 0) this.scrollToBottom();
					} else if (this.isFinished) {
						clearInterval(this.renderTimer);
						this.renderTimer = null;
						this.loading = false;
					}
				}, 10); 
			},
            
            // ... 保持 playNewsAudio, stopTTSPlayback, scrollToBottom, terminateAll, goBack 原样 ...
			scrollToBottom() {
				this.$nextTick(() => {
					uni.pageScrollTo({ scrollTop: 999999, duration: 200 });
				});
			},
			playNewsAudio(content, index) {
				if (!ttsPlugin || !this.ttsAudioContext) return;
				if (this.isPlayingTTS && this.currentPlayingIdx === index) {
					this.stopTTSPlayback();
					return;
				}
				this.stopTTSPlayback();
				this.currentPlayingIdx = index;
				this.isPlayingTTS = true;
				ttsPlugin.textToSpeech({
					lang: "zh_CN",
					content: content.replace(/<br\/>/g, '').substring(0, 500),
					success: (res) => {
						if (!this.isPlayingTTS || !this.ttsAudioContext) return;
						this.ttsAudioContext.src = res.filename;
						this.ttsAudioContext.play();
					},
					fail: () => { this.isPlayingTTS = false; }
				});
			},
			stopTTSPlayback() {
				this.isPlayingTTS = false;
				this.currentPlayingIdx = -1;
				if (this.ttsAudioContext) { this.ttsAudioContext.stop(); }
			},
			terminateAll() {
				if (this.requestTask?.abort) this.requestTask.abort();
				if (this.renderTimer) clearInterval(this.renderTimer);
				this.stopTTSPlayback();
				if (this.ttsAudioContext) {
					this.ttsAudioContext.destroy();
					this.ttsAudioContext = null;
				}
			},
			goBack() {
				this.terminateAll();
				uni.navigateBack();
			}
		}
	}
</script>

<style lang="scss" scoped>
	/* 保持原有变量 */
	$bg: #EBECF0;
	$shadow-dark: #BABECC;
	$shadow-light: #FFFFFF;
	$primary: #2458FF;

	/* 新增 Tab 样式 */
	.tab-container {
		display: flex;
		padding: 20rpx 30rpx;
		justify-content: center;
		position: sticky;
		top: 0;
		z-index: 10;
		background: $bg;
	}
	.tab-item {
		flex: 1;
		height: 80rpx;
		display: flex;
		align-items: center;
		justify-content: center;
		border-radius: 40rpx;
		font-size: 28rpx;
		color: #7a8ba5;
		transition: all 0.3s;
		&.tab-active {
			color: $primary;
			font-weight: bold;
		}
	}

	/* 保持原有拟态 UI 样式不变 */
	.oa-content { background-color: $bg; min-height: 100vh; }
	.neu-outset { background: $bg; box-shadow: -6rpx -6rpx 12rpx $shadow-light, 6rpx 6rpx 12rpx $shadow-dark; }
	.neu-inset { background: $bg; box-shadow: inset 4rpx 4rpx 8rpx $shadow-dark, inset -4rpx -4rpx 8rpx $shadow-light; }
    /* ... 其余样式保持不变 ... */
    .tn-custom-nav-bar__back { width: 68rpx; height: 68rpx; background-color: $bg; border-radius: 50%; display: flex; align-items: center; justify-content: center; box-shadow: -2px -2px 4px #FFFFFF, 2px 2px 4px #BABECC; }
    .chat-container { display: flex; flex-direction: column; padding: 0 30rpx; }
    .message-row { display: flex; flex-direction: column; margin-bottom: 45rpx; }
    .ai-header { display: flex; align-items: center; margin-bottom: 12rpx; .ai-avatar { width: 64rpx; height: 64rpx; border-radius: 20rpx; padding: 6rpx; @extend .neu-outset; } .ai-name { font-size: 24rpx; color: #7a8ba5; margin-left: 15rpx; font-weight: bold; } }
    .ai-content-bubble { padding: 26rpx 32rpx; border-radius: 4rpx 35rpx 35rpx 35rpx; max-width: 90%; @extend .neu-inset; .ai-text-render { font-size: 28rpx; color: #394963; line-height: 1.6; white-space: pre-wrap; word-break: break-all; } }
    .ai-voice-ctrl { margin-top: 15rpx; display: flex; justify-content: flex-end; .ctrl-inner { display: flex; align-items: center; padding: 10rpx 20rpx; border-radius: 20rpx; font-size: 22rpx; color: #7a8ba5; @extend .neu-outset; } }
    .footer-fixed { position: fixed; bottom: 0; left: 0; width: 100%; padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); background: $bg; }
    .bottom-bar-container { width: 90%; margin: 0 auto; padding: 20rpx 0; }
    .press-btn-main { height: 100rpx; border-radius: 50rpx; display: flex; align-items: center; justify-content: center; font-weight: bold; @extend .neu-outset; &.is-active { @extend .neu-inset; color: $primary; } }
    .ai-disclaimer { display: flex; justify-content: center; align-items: center; padding: 40rpx 0; text { font-size: 20rpx; color: #BABECC; letter-spacing: 2rpx; } &::before, &::after { content: ""; width: 30rpx; height: 1px; background: #D1D9E6; margin: 0 15rpx; } }
    .dot-loader { display: flex; justify-content: center; .dot { width: 10rpx; height: 10rpx; background: $primary; border-radius: 50%; margin: 0 6rpx; animation: blink 1.4s infinite; &:nth-child(2) { animation-delay: 0.2s; } &:nth-child(3) { animation-delay: 0.4s; } } }
    @keyframes blink { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
    .animate-fade-in { animation: fadeIn 0.4s ease; }
    @keyframes fadeIn { from { opacity: 0; transform: translateY(10rpx); } to { opacity: 1; transform: translateY(0); } }
</style>