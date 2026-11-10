<template>
	<view class="oa-content">
		<tn-nav-bar fixed customBack :bottomShadow="false" backgroundColor="#EBECF0">
			<view slot="back" class='tn-custom-nav-bar__back' @click="goBack">
				<text class='tn-icon-left-arrow'></text>
			</view>
			<view class="tn-flex tn-flex-col-center tn-flex-row-center">
				<text class="tn-text-bold tn-text-xl tn-color-black">小天智能体</text>
			</view>
		</tn-nav-bar>

		<view class="main-body" :style="{ paddingTop: (vuex_custom_bar_height + 20) + 'px' }">
			<view class="chat-container">
				<view v-for="(msg, index) in messages" :key="index" class="message-row" :class="msg.role === 'ai' ? 'ai-row' : 'user-row'">
					
					<view v-if="msg.role === 'ai'" class="ai-msg-group">
						<view class="ai-header">
							<image src="https://ytzy-college-img.oss-cn-wulanchabu.aliyuncs.com/wximg/a/home.png" class="ai-avatar neu-outset" />
							<text class="ai-name">小天智能体</text>
						</view>
						<view class="ai-content-bubble neu-inset">
							<view v-if="msg.isThinking" class="thinking-box">
								<view class="dot-loader">
									<view class="dot"></view><view class="dot"></view><view class="dot"></view>
								</view>
							</view>
							<view v-else class="ai-text-render">
								<rich-text :nodes="msg.content"></rich-text>
								<view class="ai-voice-ctrl" v-if="msg.content" @click="playAiResponse(msg, index)">
									<view class="ctrl-inner neu-outset-btn">
										<text :class="[isPlayingTTS && currentPlayingIdx === index ? 'tn-icon-sound-stop tn-color-red' : 'tn-icon-sound tn-color-blue']"></text>
										<text class="ctrl-text">{{ isPlayingTTS && currentPlayingIdx === index ? '停止' : (currentChunkIndex > 0 && currentPlayingIdx === index ? '继续播报' : '播报') }}</text>
									</view>
								</view>
							</view>
						</view>
					</view>

					<view v-else class="user-msg-group">
						<view v-if="msg.isVoiceMessage" class="voice-player-card neu-outset" @click="playUserAudio(msg)" @longpress="toggleVoiceText(msg)">
							<view class="player-inner">
								<view class="play-btn-circle neu-inset">
									<text :class="msg.isPlaying ? 'tn-icon-stop-circle-fill' : 'tn-icon-play-fill'"></text>
								</view>
								<view class="wave-lines">
									<view v-for="n in 7" :key="n" class="line" :class="{ 'animating': msg.isPlaying }"></view>
								</view>
								<text class="voice-duration">{{ msg.duration }}</text>
							</view>
						</view>
						<view v-else class="user-text-bubble neu-outset">
							<text>{{ msg.content }}</text>
						</view>
						<view v-if="msg.showText" class="recognized-box neu-inset animate-fade-in">
							<text class="box-content">{{ msg.content }}</text>
						</view>
					</view>
				</view>

				<view class="ai-disclaimer">
					<text>内容由 AI 生成，仅供参考</text>
				</view>
				<view style="height: 240rpx;"></view>
			</view>
		</view>

		<view class="recording-overlay" v-if="isRecording">
			<view class="recording-modal" :class="{ 'will-cancel': willStop }">
				<view class="timer">{{ recordLength }}s</view>
				<view class="tip">{{ willStop ? '松开手指 取消发送' : '上滑 取消发送' }}</view>
			</view>
		</view>

		<view class="footer-fixed">
			<view class="bottom-bar-container">
				<view v-if="isVoiceMode" class="voice-mode-bar">
					<view class="bar-icon-btn neu-outset" @click="toggleMode">
						<text class="tn-icon-keyboard"></text>
					</view>
					<view class="press-btn-wrap">
						<view class="press-btn-main" :class="{ 'is-active': isRecording, 'is-cancel': willStop }"
							@touchstart.stop="voiceBegin" @touchmove.stop.prevent="voiceIng" @touchend.stop="voiceEnd">
							<text class="tn-icon-voice-fill tn-margin-right-xs"></text>
							<text>{{ isRecording ? (willStop ? '松开取消' : '松开发送') : '按住 说话' }}</text>
						</view>
					</view>
					<view class="bar-icon-btn neu-outset" @click="clearMessages">
						<text class="tn-icon-delete"></text>
					</view>
				</view>
				<view v-else class="text-mode-bar">
					<view class="bar-icon-btn neu-outset" @click="toggleMode">
						<text class="tn-icon-voice-fill"></text>
					</view>
					<view class="input-wrap neu-inset">
						<input class="chat-input" v-model="searchValue" placeholder="输入问题..." @confirm="search" confirm-type="send" />
					</view>
					<view class="send-btn-main neu-outset" :class="{'can-send': searchValue.length > 0}" @click="search">
						<text class="send-text">发送</text>
					</view>
				</view>
			</view>
		</view>
	</view>
</template>

<script>
	import template_page_mixin from '@/libs/mixin/template_page_mixin.js'
	import Base64 from 'base-64';
	import api from '@/api/index.js' 
	let ttsPlugin = null;

	export default {
		mixins: [template_page_mixin],
		data() {
			return {
				userId: null,
				currentSessionId: null,
				messages: [],
				isVoiceMode: true,
				searchValue: '',
				isRecording: false,
				willStop: false,
				recordLength: 0,
				recordTimer: null,
				initPoint: { Y: 0 },
				recorderManager: null,
				currentAudioPath: '',
				currentRecordingLength: 0,
				userAudioContext: null,
				ttsAudioContext: null,
				isPlayingTTS: false,
				showStopButton: false,
				autoPlayEnabled: true,
				currentPlayingIdx: -1,
				currentChunkIndex: 0,
				currentStreamRequest: null,
				
				// 字符渲染缓冲区逻辑
				renderQueue: [],
				renderTimer: null
			}
		},
		mounted() {
			this.initSession();
			this.initAudioAndPlugins();
			this.messages = [{ role: 'ai', content: '您好！我是小天智能体。请问有什么可以帮您？', isThinking: false }];
		},
		onUnload() {
			// 关键：彻底销毁，防止声音残留
			this.stopAllLogic();
			if (this.ttsAudioContext) {
				this.ttsAudioContext.destroy();
				this.ttsAudioContext = null;
			}
		},
		methods: {
			/**
			 * 清洗特殊字符
			 */
			cleanText(text) {
				if (!text) return "";
				return text
					.replace(/\[DONE\]/gi, '') 
					.replace(/[\[【]\d+[:：]\d+\.\d+(?:[，,]\d+[:：]\d+\.\d+)?[\]】]/g, '')
					.replace(/#{1,6}\s?/g, '')
					.replace(/[\*\_\+\`\$]/g, '')
					.replace(/\\n/g, '\n');
			},

			/**
			 * 匀速律动输出
			 */
			startSmoothRender(aiIdx) {
				if (this.renderTimer) clearInterval(this.renderTimer);
				this.renderTimer = setInterval(() => {
					if (this.renderQueue.length > 0) {
						if (this.messages[aiIdx].isThinking) this.messages[aiIdx].isThinking = false;
						const char = this.renderQueue.shift();
						this.messages[aiIdx].content += char;
						this.scrollToBottom();
					}
				}, 15); // 速度微调
			},

			/**
			 * 修改后的流式接口调用核心
			 */
			async handleAiResponse(userInput) {
				this.stopTTSPlayback();
				this.renderQueue = [];
				if (this.renderTimer) clearInterval(this.renderTimer);
				
				let aiIdx = this.messages.length;
				this.messages.push({ role: 'ai', content: '', isThinking: true });
				this.scrollToBottom();

				this.startSmoothRender(aiIdx);

				this.currentStreamRequest = api.voiceChatStream({
					userId: this.userId, 
					sessionId: (this.currentSessionId === 'null' || !this.currentSessionId) ? null : this.currentSessionId,
					textData: userInput, 
					enableKnowledge: true, 
					responseType: "both"
				}, (res) => {
					// 1. 适配 request.js 传回的对象结构 {event, data}
					let rawData = (typeof res === 'object') ? res.data : res;
					if (!rawData) return;

					try {
						// 2. 二次解析后端嵌套的 JSON 字符串
						const json = JSON.parse(rawData);
						if (json.sessionId) this.currentSessionId = json.sessionId;
						
						if (json.data) {
							let cleanData = this.cleanText(json.data);
							const displayChunk = cleanData.replace(/\n/g, '<br/>');
							if (displayChunk) this.renderQueue.push(...displayChunk.split(''));
						}

						// 判断是否结束
						if (json.isFinal) this.handleStreamEnd(aiIdx);
					} catch (e) {
						// 如果不是 JSON，尝试直接处理内容（兼容 [DONE] 或纯文本）
						if (rawData === '[DONE]' || res.event === 'complete') {
							this.handleStreamEnd(aiIdx);
						} else {
							let cleanData = this.cleanText(rawData);
							this.renderQueue.push(...cleanData.split(''));
						}
					}
				}).catch(err => {
					if (this.messages[aiIdx]) {
						this.messages[aiIdx].isThinking = false;
						if (err.statusCode === 502) this.messages[aiIdx].content = "后端服务响应异常(502)。";
					}
				});
			},

			/**
			 * 结束流处理
			 */
			handleStreamEnd(aiIdx) {
				const checkEnd = setInterval(() => {
					if (this.renderQueue.length === 0) {
						clearInterval(checkEnd);
						if (this.autoPlayEnabled) this.playAiResponse(this.messages[aiIdx], aiIdx);
						if (this.renderTimer) clearInterval(this.renderTimer);
					}
				}, 200);
			},

			playAiResponse(message, index) {
				if (!ttsPlugin || !this.ttsAudioContext) return;
				if (this.isPlayingTTS && this.currentPlayingIdx === index) {
					this.stopTTSPlayback();
					return;
				}
				this.stopTTSPlayback();
				this.currentPlayingIdx = index;
				this.currentChunkIndex = 0;

				let speakText = message.content.replace(/<[^>]*>/g, ' ').replace(/\s+/g, ' ').trim();
				if (!speakText) return;

				const chunks = speakText.match(/.{1,50}/g) || [];
				this.isPlayingTTS = true;
				this.showStopButton = true;
				this.playTtsChunks(chunks, this.currentChunkIndex);
			},

			playTtsChunks(chunks, index) {
				if (!this.isPlayingTTS || index >= chunks.length || !this.ttsAudioContext) {
					this.isPlayingTTS = false;
					this.showStopButton = false;
					return;
				}
				this.currentChunkIndex = index;
				ttsPlugin.textToSpeech({
					lang: "zh_CN", content: chunks[index],
					success: (res) => {
						if (!this.isPlayingTTS || !this.ttsAudioContext) return;
						this.ttsAudioContext.src = res.filename;
						this.ttsAudioContext.offEnded();
						this.ttsAudioContext.onEnded(() => {
							if (this.isPlayingTTS) this.playTtsChunks(chunks, index + 1);
						});
						this.ttsAudioContext.play();
					},
					fail: () => { this.isPlayingTTS = false; }
				});
			},

			stopTTSPlayback() {
				this.isPlayingTTS = false;
				this.showStopButton = false;
				if (this.ttsAudioContext) {
					this.ttsAudioContext.stop();
					this.ttsAudioContext.offEnded();
				}
			},

			stopAllLogic() {
				if (this.currentStreamRequest && this.currentStreamRequest.abort) {
					this.currentStreamRequest.abort();
				}
				if (this.renderTimer) clearInterval(this.renderTimer);
				this.stopTTSPlayback();
			},

			// ASR 逻辑保持原样
			async recognizeWithBackend() {
				uni.getFileSystemManager().readFile({
					filePath: this.currentAudioPath,
					success: (res) => {
						const audioBase64 = uni.arrayBufferToBase64(res.data);
						const token = uni.getStorageSync('token');
						uni.request({
							url: this.$baseUrl + '/gxx-pasture/voice-chat/asr',
							method: 'POST',
							data: { audioData: audioBase64, audioFormat: 'mp3' },
							header: { 
								'Authorization': `Basic ${Base64.encode('student:student_secret')}`,
								'Blade-Auth': 'Bearer ' + token,
								'Accept': 'application/json',
								'Content-Type': 'application/json'
							},
							success: (response) => {
								if (response.statusCode === 200 && response.data.code === 200) {
									this.voiceRecognitionComplete(response.data.data);
								} else {
									uni.showToast({ title: '识别超时', icon: 'none' });
								}
							}
						});
					}
				});
			},

			voiceBegin(e) {
				if (this.isRecording) return;
				this.resetVoiceState();
				this.isRecording = true;
				this.initPoint.Y = e.touches[0].clientY;
				uni.vibrateShort();
				this.stopTTSPlayback();
				this.recordTimer = setInterval(() => {
					this.recordLength++;
					if (this.recordLength >= 60) this.finishVoiceRecording(false);
				}, 1000);
				this.recorderManager.start({ duration: 60000, format: 'mp3' });
			},
			voiceIng(e) { if (this.isRecording) this.willStop = (this.initPoint.Y - e.touches[0].clientY) > 60; },
			voiceEnd() { if (this.isRecording) this.finishVoiceRecording(this.willStop); },
			finishVoiceRecording(isCancel) {
				const finalLen = this.recordLength;
				this.recorderManager.stop();
				clearInterval(this.recordTimer);
				setTimeout(() => {
					if (!isCancel && finalLen >= 1) {
						this.currentRecordingLength = finalLen;
						this.recognizeWithBackend();
					}
					this.resetVoiceState();
				}, 200);
			},
			resetVoiceState() { this.isRecording = false; this.willStop = false; this.recordLength = 0; if (this.recordTimer) clearInterval(this.recordTimer); },
			
			voiceRecognitionComplete(text) {
				if (!text) return;
				const cleanedText = this.cleanText(text);
				this.messages.push({
					role: 'user', content: cleanedText, isVoiceMessage: true, 
					audioPath: this.currentAudioPath, isPlaying: false, showText: false, duration: this.currentRecordingLength + 's'
				});
				this.scrollToBottom();
				this.handleAiResponse(cleanedText);
			},

			playUserAudio(msg) {
				this.userAudioContext.src = msg.audioPath;
				this.userAudioContext.onPlay(() => msg.isPlaying = true);
				this.userAudioContext.onEnded(() => msg.isPlaying = false);
				this.userAudioContext.play();
			},
			toggleVoiceText(msg) { uni.vibrateShort(); msg.showText = !msg.showText; this.$forceUpdate(); },
			initSession() {
			  const info = uni.getStorageSync('userInfo');
			  const isLogin = uni.getStorageSync('isLogin'); // 正式用户为 true, 游客为 false
			
			  // 1. 修正判断条件：!isLogin 表示是游客
			  if (isLogin === false) {
			    // 增加一个延时，确保页面进入后再提示，防止被覆盖
			    setTimeout(() => {
			      uni.showToast({ 
			        title: '当前为游客模式，仅供功能体验', 
			        icon: 'none',
			        duration: 3000
			      });
			    }, 1000);
			  }
			
			  // 2. 赋值 UserId
			  if (info && info.userId) {
			    this.userId = info.userId;
			  } else {
			    this.userId = 'guest_' + Math.random().toString(36).substring(2, 11);
			  }
			  
			  console.log('当前对话用户ID:', this.userId, '登录状态:', isLogin);
			},
			initAudioAndPlugins() {
				// #ifdef MP-WEIXIN
				ttsPlugin = requirePlugin("WechatSI");
				// #endif
				this.recorderManager = uni.getRecorderManager();
				this.userAudioContext = uni.createInnerAudioContext();
				this.ttsAudioContext = uni.createInnerAudioContext();
				this.recorderManager.onStop((res) => { this.currentAudioPath = res.tempFilePath; });
			},
			scrollToBottom() { 
				this.$nextTick(() => { 
					setTimeout(() => { uni.pageScrollTo({ scrollTop: 99999, duration: 150 }); }, 50); 
				}); 
			},
			toggleMode() { this.isVoiceMode = !this.isVoiceMode; },
			search() { 
				if (!this.searchValue.trim()) return; 
				const t = this.searchValue; 
				this.searchValue = ''; 
				this.messages.push({ role: 'user', content: t }); 
				this.scrollToBottom(); 
				this.handleAiResponse(t); 
			},
			clearMessages() { 
				this.stopAllLogic();
				this.messages = [{ role: 'ai', content: '您好！我是云天小云。请问有什么可以帮您？', isThinking: false }]; 
				this.currentSessionId = null; 
			},
			goBack() { 
				this.stopAllLogic();
				uni.navigateBack();
			}
		}
	}
</script>

<style lang="scss" scoped>
	$bg: #EBECF0;
	$shadow-dark: #BABECC;
	$shadow-light: #FFFFFF;
	$primary: #2458FF;

	.oa-content { background-color: $bg; min-height: 100vh; }
	.neu-outset { background: $bg; box-shadow: -6rpx -6rpx 12rpx $shadow-light, 6rpx 6rpx 12rpx $shadow-dark; }
	.neu-inset { background: $bg; box-shadow: inset 4rpx 4rpx 8rpx $shadow-dark, inset -4rpx -4rpx 8rpx $shadow-light; }

	.tn-custom-nav-bar__back {
		width: 68rpx; height: 68rpx; background-color: $bg; border-radius: 50%; display: flex; align-items: center; justify-content: center;
		box-shadow: -2px -2px 4px #FFFFFF, 2px 2px 4px #BABECC; 
	}

	.chat-container { display: flex; flex-direction: column; padding: 0 30rpx; }
	.message-row { display: flex; flex-direction: column; margin-bottom: 45rpx; }
	.ai-row { align-items: flex-start; }
	.user-row { align-items: flex-end; }

	.ai-header { display: flex; align-items: center; margin-bottom: 12rpx;
		.ai-avatar { width: 64rpx; height: 64rpx; border-radius: 20rpx; padding: 6rpx; @extend .neu-outset; }
		.ai-name { font-size: 24rpx; color: #7a8ba5; margin-left: 15rpx; font-weight: bold; }
	}

	/* 优化段落显示布局 */
	.ai-content-bubble { 
		padding: 26rpx 32rpx; border-radius: 4rpx 35rpx 35rpx 35rpx; max-width: 85%; @extend .neu-inset;
		.ai-text-render { 
			font-size: 28rpx; color: #394963; line-height: 1.8; letter-spacing: 1rpx; 
			word-break: break-all;
			/* 强制为 br 标签增加微量间距，模拟段落感 */
			:deep(br) {
				display: block;
				content: "";
				margin-top: 12rpx;
			}
		}
		.ai-voice-ctrl { margin-top: 20rpx; display: flex; justify-content: flex-end;
			.ctrl-inner { display: flex; align-items: center; padding: 10rpx 20rpx; border-radius: 20rpx; font-size: 22rpx; color: #7a8ba5; @extend .neu-outset; }
		}
	}

	.user-text-bubble { padding: 26rpx 32rpx; border-radius: 35rpx 35rpx 4rpx 35rpx; max-width: 85%; font-size: 28rpx; color: #394963; @extend .neu-outset; }
	.voice-player-card { padding: 20rpx 25rpx; border-radius: 35rpx 35rpx 4rpx 35rpx; width: 340rpx; @extend .neu-outset;
		.player-inner { display: flex; align-items: center; justify-content: space-between; }
		.play-btn-circle { width: 56rpx; height: 56rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: $primary; @extend .neu-inset; }
	}

	.recognized-box { margin-top: 15rpx; padding: 20rpx; border-radius: 20rpx; max-width: 85%; @extend .neu-inset;
		.box-content { font-size: 24rpx; color: #7a8ba5; }
	}

	.ai-disclaimer { display: flex; justify-content: center; align-items: center; padding: 40rpx 0;
		text { font-size: 20rpx; color: #BABECC; letter-spacing: 2rpx; }
		&::before, &::after { content: ""; width: 30rpx; height: 1px; background: #D1D9E6; margin: 0 15rpx; }
	}

	.footer-fixed { position: fixed; bottom: 0; left: 0; width: 100%; padding-bottom: calc(40rpx + env(safe-area-inset-bottom)); background: $bg; }
	.bottom-bar-container { width: 92%; margin: 0 auto; }
	.voice-mode-bar, .text-mode-bar { display: flex; align-items: center; justify-content: space-between; height: 120rpx; }
	.bar-icon-btn { width: 90rpx; height: 90rpx; border-radius: 50%; display: flex; align-items: center; justify-content: center; font-size: 40rpx; color: #7a8ba5; @extend .neu-outset; }
	.press-btn-wrap { flex: 1; margin: 0 25rpx; }
	.press-btn-main { height: 90rpx; border-radius: 45rpx; display: flex; align-items: center; justify-content: center; font-weight: bold; @extend .neu-outset;
		&.is-active { @extend .neu-inset; color: $primary; }
	}
	.input-wrap { flex: 1; height: 90rpx; margin: 0 20rpx; border-radius: 45rpx; display: flex; align-items: center; padding: 0 35rpx; @extend .neu-inset; }
	.send-btn-main { width: 120rpx; height: 80rpx; border-radius: 40rpx; display: flex; align-items: center; justify-content: center; color: $shadow-dark; @extend .neu-outset;
		&.can-send { color: $primary; }
	}

	.recording-overlay { position: fixed; top: 0; left: 0; width: 100%; height: 100%; background: rgba(0,0,0,0.05); display: flex; align-items: center; justify-content: center; z-index: 1000;
		.recording-modal { width: 300rpx; height: 300rpx; background: rgba(235, 236, 240, 0.98); border-radius: 50rpx; display: flex; flex-direction: column; align-items: center; justify-content: center;
			&.will-cancel { background: #F56C6C; .timer, .tip { color: #FFF; } }
			.timer { font-size: 46rpx; font-weight: bold; color: $primary; }
		}
	}
	
	.animate-fade-in { animation: fadeIn 0.3s ease; }
	@keyframes fadeIn { from { opacity: 0; transform: translateY(-10rpx); } to { opacity: 1; transform: translateY(0); } }

	.dot-loader { display: flex; .dot { width: 10rpx; height: 10rpx; background: $primary; border-radius: 50%; margin: 0 6rpx; animation: blink 1.4s infinite; &:nth-child(2) { animation-delay: 0.2s; } &:nth-child(3) { animation-delay: 0.4s; } } }
	@keyframes blink { 0%, 100% { opacity: 0.2; } 50% { opacity: 1; } }
	.wave-lines { display: flex; align-items: center; .line { width: 4rpx; height: 10rpx; background: $shadow-dark; margin: 0 4rpx; border-radius: 4rpx; &.animating { background: $primary; animation: wave 0.6s infinite alternate; } } }
	@keyframes wave { from { height: 10rpx; } to { height: 30rpx; } }
</style>