export default {
    namespaced: true,
    state: {
        token: '',
        refreshToken: '',
        deptId: '',
        userInfo: {},
		deptName: '',
        isLogin: false,
        showWxLogin:false,
		licenseType: '',
		
    },
    getters: {

    },
    mutations: {
        setShowWxLogin(state, data) {
            state.showWxLogin = data
        },
        //登录后保存信息
        initUser(state) {
            const userInfo = uni.getStorageSync('userInfo');
            const token = uni.getStorageSync('token');
            const refreshToken = uni.getStorageSync('refresh_token');
            const deptId = uni.getStorageSync('dept_id');
			const deptName = uni.getStorageSync('dept_name'); // 新增
            const isLogin = uni.getStorageSync('isLogin');
			const licenseType = uni.getStorageSync('license_type');
            if (isLogin) {
                state.userInfo = userInfo;
                state.isLogin = isLogin;
                state.token = token;
                state.refreshToken = refreshToken;
                state.deptId = deptId;
				state.deptName = deptName || ''; // 新增
				state.licenseType = licenseType || ''; // 新增
            }
        },
        login(state, userInfo) {
            state.userInfo = userInfo;
            state.isLogin = true;
            state.token = userInfo.token;
            state.refreshToken = userInfo.refresh_token;
            state.deptId = userInfo.dept_id;
			state.deptName = userInfo.dept_name || ''; 
			state.licenseType = userInfo.license_type || ''; 
			    
			
			uni.setStorageSync('dept_name', userInfo.dept_name);
			uni.setStorageSync('license_type', userInfo.license_type);
        },
        // 更新 token
        updateToken(state, tokenData) {
            state.token = tokenData.access_token;
            state.refreshToken = tokenData.refresh_token;
        },
		// 退出登录清理逻辑
		        logout(state) {
		            state.isLogin = false;
		            state.token = '';
		            state.userInfo = {};
		            state.deptId = '';
		            state.deptName = '';
					state.licenseType = '';
		            uni.removeStorageSync('isLogin');
		            uni.removeStorageSync('token');
		            uni.removeStorageSync('refresh_token');
		            uni.removeStorageSync('userInfo');
		            uni.removeStorageSync('dept_id');
		            uni.removeStorageSync('dept_name');
					uni.removeStorageSync('license_type');
					
		        }
    },
    actions: {

    },

}