const utils = {
	props: {
		// 自定义class
		customClass: [String, Object, Array],
		// 自定义样式
		customStyle: [Object, String],
		// scope
		scopeParams: {
			type: Object,
			default: () => ({}),
		},
	},
	computed: {
		custom_class() {
			return this.$mergeClass(this.customClass);
		},
		custom_style() {
			return this.$mergeStyle(this.customStyle);
		},
		$sUid() {
			return `S-${getUid()}`;
		},
	},
	methods: {
		$isDef: function(val) {
			return val !== undefined && val !== null && val !== '';
		},
		$addUnit: function(value = '', unit = 'rpx') {
			return this.isNumber(value) ? Number(value) + unit : value;
		},
		$mergeClass: function(...classList) {
			return [
				...new Set(
					this.trim(
						classList
						.map(item => {
							const type = this.getType(item);
							let str = '';
							if (type === 'string') {
								str = item;
							} else if (type === 'object') {
								str = Object.keys(item)
									.filter(name => name && item[name])
									.join(' ');
							} else if (type === 'array') {
								str = this.$mergeClass(...item);
							}
							return str;
						})
						.join(' '),
					).split(/\s+/),
				),
			].join(' ');
		},
		$mergeStyle: function(...styleList) {
			const styleObj = {};
			const addStyle = (name, value) => {
				name = this.trim(name);
				value = ['string', 'number'].includes(this.getType(value)) ? this.trim(value) : '';
				if (name && value) styleObj[this.toLine(name)] = value;
			};
			styleList.forEach(style => {
				const type = this.getType(style);
				if (type === 'string' && style) {
					style = this.trim(style);
					if (style) {
						style.replace(/^;+|;+$/, '')
							.split(/;+/)
							.map(str => str.split(/:+/))
							.forEach(([k, value]) => addStyle(k, value));
					}
				} else if (type === 'object') {
					Object.keys(style).forEach(k => addStyle(k, style[k]));
				}
			});
			return Object.keys(styleObj).map(k => `${k}:${styleObj[k]}`).join(';');
		},
		$getPropsFn: function(handlerName) {
			const handler = this[handlerName];
			if (typeof handler === 'function') {
				// #ifndef H5
				let parent = this.$parent;
				while (parent) {
					// 因为在非H5中props中的方法没有绑定this，尝试从$options.methods上找到传递的方法
					const methodsHandlers = Object.values(parent.$options.methods || {});
					if (methodsHandlers.includes(handler)) {
						// 使this指向使用该组件的实例vm
						return handler.bind(parent);
					} else {
						parent = parent.$parent;
					}
				}
				// #endif
				return handler;
			}
			return undefined;
		},
		isNumber(value) {
			if (typeof value === 'number') return true;
			if (typeof value === 'string' && this.trim(value)) return !isNaN(value);
			return false;
		},
		trim(str, pos = 'both') {
			str = String(this.$isDef(str) ? str : '');
			if (pos == 'both') {
				return str.replace(/^\s+|\s+$/g, '');
			} else if (pos == 'left') {
				return str.replace(/^\s*/, '');
			} else if (pos == 'right') {
				return str.replace(/(\s*$)/g, '');
			} else if (pos == 'all') {
				return str.replace(/\s+/g, '');
			} else {
				return str;
			}
		},
		getType(value) {
			return Object.prototype.toString.call(value).slice(8, -1).toLowerCase();
		},
		toLine(str = '', mark = '-') {
			return str.replace(/([A-Z])/g, `${mark}$1`).toLowerCase();
		}

	},
	mounted() {
		this.$emit('mounted', this);
	},
};

export default utils;
