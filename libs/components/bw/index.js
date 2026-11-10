/*
import bw from 'bw'
Vue.use(bw)
在main中注册

*/




const install = Vue => {
	Vue.prototype.navTo = (url) => {
				uni.navigateTo({
					url: url,
					success: res => {},
					fail: () => {},
					complete: () => {}
				});
			}
}

export default {
	install
}