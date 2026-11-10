import store from "../store/login.js";

// --- 现场处置 · 手机端接口通用配置 (D162 + D164) ---
// 默认指向 /admin-api（同源代理或可配置 http://{host}:48080/admin-api）
const DEFAULT_BASE_URL = 'http://192.168.1.6:48080/admin-api';

export const getBaseUrl = () => {
	try {
		if (typeof uni !== 'undefined' && uni.getStorageSync) {
			const customUrl = uni.getStorageSync('api_base_url');
			if (customUrl) return customUrl;
		}
	} catch (e) {}
	return DEFAULT_BASE_URL;
};

/**
 * 图片地址拼接工具函数
 */
export const formatImageUrl = (url) => {
	if (!url || typeof url !== 'string') return url;
	if (
		url.startsWith('http://') ||
		url.startsWith('https://') ||
		url.startsWith('wxfile://') ||
		url.startsWith('data:') ||
		url.startsWith('/static/') ||
		url.startsWith('/public/')
	) {
		return url;
	}
	let purePath = url.replace(/^https?:\/?/, '');
	if (!purePath.startsWith('/')) purePath = '/' + purePath;
	return purePath;
};

const http = {
	baseUrl: DEFAULT_BASE_URL,

	request(config) {
		config = beforeRequest(config);
		const prefix = getBaseUrl();
		if (config.url.startsWith('http://') || config.url.startsWith('https://')) {
			// 保持完整 URL
		} else if (config.url.startsWith('/admin-api')) {
			// 已含 /admin-api 前缀
		} else {
			config.url = prefix + (config.url.startsWith('/') ? config.url : '/' + config.url);
		}

		return new Promise((resolve, reject) => {
			if (typeof uni !== 'undefined' && typeof uni.request === 'function') {
				uni.request({
					url: config.url,
					method: config.method || 'GET',
					data: config.data,
					header: config.header,
					success: (resp) => {
						const processed = afterRequest(resp);
						if (processed && processed.data && processed.data.code !== undefined && processed.data.code !== 0 && processed.data.code !== 200) {
							if (!config.silentError && typeof uni !== 'undefined' && uni.showToast) {
								uni.showToast({
									title: processed.data.msg || `请求失败 (${processed.data.code})`,
									icon: 'none'
								});
							}
						}
						resolve(processed.data !== undefined ? processed.data : processed);
					},
					fail: (err) => {
						reject(errorRequest(err));
					}
				});
			} else if (typeof fetch !== 'undefined') {
				let fetchUrl = config.url;
				const fetchOptions = {
					method: config.method || 'GET',
					headers: config.header || {}
				};
				if (fetchOptions.method === 'GET' && config.data && typeof config.data === 'object') {
					const qs = Object.keys(config.data)
						.filter(k => config.data[k] !== undefined && config.data[k] !== null && config.data[k] !== '')
						.map(k => `${encodeURIComponent(k)}=${encodeURIComponent(config.data[k])}`)
						.join('&');
					if (qs) {
						fetchUrl += (fetchUrl.includes('?') ? '&' : '?') + qs;
					}
				} else if (config.data) {
					fetchOptions.body = JSON.stringify(config.data);
				}
				fetch(fetchUrl, fetchOptions)
					.then(r => r.json())
					.then(data => {
						const processed = afterRequest({ data });
						resolve(processed.data !== undefined ? processed.data : processed);
					})
					.catch(err => reject(err));
			} else {
				reject(new Error('No request adapter available'));
			}
		});
	},

	upload(url, filePath, auth = true) {
		const header = {};
		const accessToken = uni.getStorageSync('accessToken') || uni.getStorageSync('token') || '';
		const tenantId = uni.getStorageSync('tenantId') || '';
		if (accessToken) {
			header['Authorization'] = `Bearer ${accessToken}`;
		}
		if (tenantId !== '' && tenantId !== undefined && tenantId !== null) {
			header['tenant-id'] = String(tenantId);
		}
		const prefix = getBaseUrl();
		const fullUrl = url.startsWith('http') ? url : prefix + (url.startsWith('/') ? url : '/' + url);

		return new Promise((resolve, reject) => {
			uni.uploadFile({
				url: fullUrl,
				filePath: filePath,
				name: 'file',
				header: header,
				success: (res) => {
					try {
						const data = JSON.parse(res.data);
						resolve(data);
					} catch (e) {
						reject(e);
					}
				},
				fail: (err) => {
					reject(err);
				}
			});
		});
	},

	get(url, data = {}, auth = true, extraConfig = {}) {
		return this.request({ url, data, auth, method: 'GET', ...extraConfig });
	},
	post(url, data = {}, auth = true, extraConfig = {}) {
		return this.request({ url, data, auth, method: 'POST', ...extraConfig });
	},
	put(url, data = {}, auth = true, extraConfig = {}) {
		return this.request({ url, data, auth, method: 'PUT', ...extraConfig });
	},
	delete(url, data = {}, auth = true, extraConfig = {}) {
		return this.request({ url, data, auth, method: 'DELETE', ...extraConfig });
	}
};

const beforeRequest = (config) => {
	config.header = config.header || {};
	config.header['Content-Type'] = config.header['Content-Type'] || 'application/json';

	let accessToken = '';
	let tenantId = '';
	try {
		if (typeof uni !== 'undefined' && uni.getStorageSync) {
			accessToken = uni.getStorageSync('accessToken') || uni.getStorageSync('token') || '';
			tenantId = uni.getStorageSync('tenantId') || '';
		}
	} catch (e) {}

	if (accessToken && !config.header['Authorization']) {
		config.header['Authorization'] = `Bearer ${accessToken}`;
	}
	if (tenantId !== '' && tenantId !== undefined && tenantId !== null && !config.header['tenant-id']) {
		config.header['tenant-id'] = String(tenantId);
	}

	return config;
};

const afterRequest = (response) => {
	if (response && response.data) {
		if (response.data.code === 401) {
			clearAuth();
		}
	}
	return response;
};

const clearAuth = () => {
	try {
		if (store && store.state && store.state.user) {
			store.state.user.token = '';
			store.state.user.isLogin = false;
		}
		if (typeof uni !== 'undefined') {
			uni.removeStorageSync('accessToken');
			uni.removeStorageSync('token');
			uni.removeStorageSync('refreshToken');
			uni.showToast({ title: '登录已失效 (401)，请重新登录', icon: 'none' });
		}
	} catch (e) {}
};

const errorRequest = (err) => {
	return err;
};

export default http;