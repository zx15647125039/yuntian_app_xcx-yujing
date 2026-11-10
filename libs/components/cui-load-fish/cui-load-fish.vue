<template>
	<view>
		<canvas type="2d" :style="{ width: canvasW + 'px', height: canvasH + 'px' }" canvas-id="myCanvas" id="myCanvas">
		</canvas>
	</view>
</template>

<script>
	var _self;
	export default {
		data() {
			return {
				canvasW: 0, // 画布宽
				canvasH: 0, // 画布高
			};
		},
		created() {
			this.creatCav();
		},
		onShow() {},
		methods: {
			async creatCav() {
				let that = this;
				this.SystemInfo = await this.getSystemInfo();
				that.canvasH = this.SystemInfo.windowWidth;
				that.canvasW = this.SystemInfo.windowHeight;
				var RENDERER = {
					POINT_INTERVAL: 5,
					FISH_COUNT: 2,
					MAX_INTERVAL_COUNT: 50,
					INIT_HEIGHT_RATE: 0.5,
					THRESHOLD: 50,

					init: function() {
						this.setParameters();
						this.reconstructMethods();
						this.setup();
						this.render();
					},
					setParameters: function() {
						this.context = uni.createCanvasContext('myCanvas', that);
						this.points = [];
						this.fishes = [];
						this.watchIds = [];
					},
					createSurfacePoints: function() {
						var count = Math.round(this.width / this.POINT_INTERVAL);
						this.pointInterval = this.width / (count - 1);
						this.points.push(new SURFACE_POINT(this, 0));

						for (var i = 1; i < count; i++) {
							var point = new SURFACE_POINT(this, i * this.pointInterval),
								previous = this.points[i - 1];

							point.setPreviousPoint(previous);
							previous.setNextPoint(point);
							this.points.push(point);
						}
					},
					reconstructMethods: function() {
						this.watchWindowSize = this.watchWindowSize.bind(this);
						this.jdugeToStopResize = this.jdugeToStopResize.bind(this);
						this.render = this.render.bind(this);
					},
					setup: function() {
						this.points.length = 0;
						this.fishes.length = 0;
						this.watchIds.length = 0;
						this.intervalCount = this.MAX_INTERVAL_COUNT;
						this.width = that.canvasW;
						this.height = that.canvasH;
						this.fishCount = this.FISH_COUNT * this.width / 500 * this.height / 500;
						this.skyGradient = this.context.createLinearGradient(0, 0, 0, this.height);
						this.skyGradient.addColorStop(0, '#75F0F0');
						this.skyGradient.addColorStop(1, '#D1FAFA');

						this.seaGradient = this.context.createLinearGradient(0, 0, 0, this.height);
						this.seaGradient.addColorStop(0, '#47EBEB');
						this.seaGradient.addColorStop(0.5, '#19E6E6');
						this.seaGradient.addColorStop(1, '#1980E6');

						this.fishes.push(new FISH(this));
						this.createSurfacePoints();
					},
					watchWindowSize: function() {
						this.clearTimer();
						this.tmpWidth = that.canvasW;
						this.tmpHeight = that.canvasH;
						this.watchIds.push(setTimeout(this.jdugeToStopResize, this.WATCH_INTERVAL));
					},
					clearTimer: function() {
						while (this.watchIds.length > 0) {
							clearTimeout(this.watchIds.pop());
						}
					},
					jdugeToStopResize: function() {
						var width = that.canvasW,
							height = that.canvasH,
							stopped = (width == this.tmpWidth && height == this.tmpHeight);

						this.tmpWidth = width;
						this.tmpHeight = height;

						if (stopped) {
							this.setup();
						}
					},
					generateEpicenter: function(x, y, velocity) {
						if (y < this.height / 2 - this.THRESHOLD || y > this.height / 2 + this.THRESHOLD) {
							return;
						}
						var index = Math.round(x / this.pointInterval);

						if (index < 0 || index >= this.points.length) {
							return;
						}
						this.points[index].interfere(y, velocity);
					},
					controlStatus: function() {
						for (var i = 0, count = this.points.length; i < count; i++) {
							this.points[i].updateSelf();
						}
						for (var i = 0, count = this.points.length; i < count; i++) {
							this.points[i].updateNeighbors();
						}
						if (this.fishes.length < this.fishCount) {
							if (--this.intervalCount == 0) {
								this.intervalCount = this.MAX_INTERVAL_COUNT;
								this.fishes.push(new FISH(this));
							}
						}
					},
					render: function() {
						// requestAnimationFrame(this.render);
						// this.render();
						this.controlStatus();

						this.context.fillStyle = this.skyGradient;
						this.context.fillRect(0, 0, this.width, this.height);
						this.context.fillStyle = this.seaGradient;
						this.context.beginPath();
						this.context.moveTo(0, this.height);

						for (var i = 0, count = this.points.length; i < count; i++) {
							this.points[i].render(this.context);
						}
						this.context.lineTo(this.width, this.height);
						this.context.closePath();
						this.context.fill();

						for (var i = 0, count = this.fishes.length; i < count; i++) {
							this.fishes[i].render(this.context);
						}
						this.context.draw();
					}
				};
				var SURFACE_POINT = function(renderer, x) {
					this.renderer = renderer;
					this.x = x;
					this.init();
				};
				SURFACE_POINT.prototype = {
					SPRING_CONSTANT: 0.03,
					SPRING_FRICTION: 0.9,
					WAVE_SPREAD: 0.3,
					ACCELARATION_RATE: 0.01,

					init: function() {
						this.initHeight = this.renderer.height * this.renderer.INIT_HEIGHT_RATE;
						this.height = this.initHeight;
						this.fy = 0;
						this.force = {
							previous: 0,
							next: 0
						};
					},
					setPreviousPoint: function(previous) {
						this.previous = previous;
					},
					setNextPoint: function(next) {
						this.next = next;
					},
					interfere: function(y, velocity) {
						this.fy = this.renderer.height * this.ACCELARATION_RATE * ((this.renderer.height - this
							.height -
							y) >= 0 ? -1 : 1) * Math.abs(velocity);
					},
					updateSelf: function() {
						this.fy += this.SPRING_CONSTANT * (this.initHeight - this.height);
						this.fy *= this.SPRING_FRICTION;
						this.height += this.fy;
					},
					updateNeighbors: function() {
						if (this.previous) {
							this.force.previous = this.WAVE_SPREAD * (this.height - this.previous.height);
						}
						if (this.next) {
							this.force.next = this.WAVE_SPREAD * (this.height - this.next.height);
						}
					},
					render: function(context) {
						if (this.previous) {
							this.previous.height += this.force.previous;
							this.previous.fy += this.force.previous;
						}
						if (this.next) {
							this.next.height += this.force.next;
							this.next.fy += this.force.next;
						}
						context.lineTo(this.x, this.renderer.height - this.height);
					}
				};
				var FISH = function(renderer) {
					this.renderer = renderer;
					this.init();
				};
				FISH.prototype = {
					GRAVITY: 0.4,

					init: function() {
						this.direction = Math.random() < 0.5;
						this.x = this.direction ? (this.renderer.width + this.renderer.THRESHOLD) : -this
							.renderer
							.THRESHOLD;
						this.y = this.getRandomValue(this.renderer.height * 6 / 10, this.renderer.height * 9 /
							10);
						this.previousY = this.y;
						this.vx = this.getRandomValue(4, 10) * (this.direction ? -1 : 1);
						this.vy = this.getRandomValue(-5, -2);
						this.ay = this.getRandomValue(-0.2, -0.05);
						this.theta = 0;
						this.phi = 0;
						this.isOut = false;
					},
					getRandomValue: function(min, max) {
						return min + (max - min) * Math.random();
					},
					controlStatus: function(context) {
						this.previousY = this.y;
						this.x += this.vx;
						this.y += this.vy;
						this.vy += this.ay;

						if (this.y < this.renderer.height * this.renderer.INIT_HEIGHT_RATE) {
							this.vy += this.GRAVITY;
							this.isOut = true;
						} else {
							if (this.isOut) {
								this.ay = this.getRandomValue(-0.2, -0.05);
							}
							this.isOut = false;
						}
						if (!this.isOut) {
							this.theta += Math.PI / 20;
							this.theta %= Math.PI * 2;
							this.phi += Math.PI / 30;
							this.phi %= Math.PI * 2;
						}
						this.renderer.generateEpicenter(this.x + (this.direction ? -1 : 1) * this.renderer
							.THRESHOLD,
							this.y,
							this.y - this.previousY);

						if (this.vx > 0 && this.x > this.renderer.width + this.renderer.THRESHOLD || this.vx <
							0 &&
							this.x <
							-this.renderer.THRESHOLD) {
							this.init();
						}
					},
					render: function(context) {
						context.save();
						context.translate(this.x, this.y);
						context.rotate(Math.PI + Math.atan2(this.vy, this.vx));
						context.scale(1, this.direction ? 1 : -1);

						context.fillStyle = '#BDDCDC';
						context.beginPath();
						context.moveTo(-30, 0);
						context.bezierCurveTo(-20, 15, 15, 10, 40, 0);
						context.bezierCurveTo(15, -10, -20, -15, -30, 0);
						context.fill();

						context.save();
						context.translate(40, 0);
						context.scale(0.9 + 0.2 * Math.sin(this.theta), 1);
						context.fillStyle = '#BDDCDC';
						context.beginPath();
						context.moveTo(0, 0);
						context.quadraticCurveTo(5, 10, 20, 8);
						context.quadraticCurveTo(12, 5, 10, 0);
						context.quadraticCurveTo(12, -5, 20, -8);
						context.quadraticCurveTo(5, -10, 0, 0);
						context.fill();
						context.restore();

						context.save();
						context.translate(-3, 0);
						context.rotate(Math.PI / 3 + Math.PI / 10 * Math.sin(this.phi));
						context.fillStyle = '#144BB8';
						context.beginPath();
						context.moveTo(-5, 0);
						context.bezierCurveTo(-10, -10, -10, -30, 0, -40);
						context.bezierCurveTo(12, -25, 8, -10, 0, 0);
						context.closePath();
						context.fill();
						context.restore();

						context.strokeStyle = '#144BB8';
						context.beginPath();
						context.arc(-15, -3, 5, 0, Math.PI * 2, false);
						context.stroke();

						context.fillStyle = '#144BB8';
						context.beginPath();
						context.arc(-15, -3, 3, 0, Math.PI * 2, false);
						context.fill();
						context.restore();

						this.controlStatus(context);
					}
				};
				RENDERER.init();
			},
			getSystemInfo() {
				return new Promise((req, rej) => {
					uni.getSystemInfo({
						success: function(res) {
							req(res)
						}
					});
				})
			}
		}
	};
</script>
