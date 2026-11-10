import Vue from 'vue'
import Vuex from 'vuex'
import createPersistedState from 'vuex-persistedstate'

Vue.use(Vuex)
import user from './modules/user'

export default new Vuex.Store({
    state: {
    },
    mutations: {

    },
    modules: {
        user
    },
    plugins: [
        createPersistedState({
            storage: {
                getItem: key => uni.getStorageSync(key),
                setItem: (key, value) => uni.setStorageSync(key, value),
                removeItem: key => uni.removeStorageSync(key)
            }
        }),
    ],
})