### 用法说明

**注意：部分厂商的部分系统版本，可能会出现重复申请权限的情况（不一定影响审核上架，因为审核的手机系统版本有多种）**
**如出现上述问题导致无法通过审核请使用（requestAndroidPermission 函数）自行处理或使用其他插件**

-----

### 在main.js引入（全局处理，不破坏原本业务逻辑）
```js
import { addPermisionInterceptor } from '@/uni_modules/x-perm-apply-instr/js_sdk/index.js'
addPermisionInterceptor('chooseImage', '为了修改个人头像和发布信息图片视频等, 我们需要申请您设备的相机和存储权限')
addPermisionInterceptor('chooseVideo', '为了发布信息图片视频等, 我们需要申请您设备的相机和存储权限')
addPermisionInterceptor('saveImageToPhotosAlbum', '为了保存推广海报到手机相册, 我们需要申请您设备的存储权限')
addPermisionInterceptor('getLocation', '为了根据您的位置展示信息, 我们需要申请您设备的位置权限')
addPermisionInterceptor('makePhoneCall', '为了联系客服/用户/咨询等, 我们需要申请您设备的拨打电话权限')
addPermisionInterceptor('getRecorderManager', '为了使用语言消息功能等, 我们需要申请您设备的麦克风权限')
addPermisionInterceptor('startLocationUpdate', '为了根据您的位置展示信息, 我们需要申请您设备的位置权限')
addPermisionInterceptor('scanCode', '为了识别二维码信息, 我们需要申请您设备的相机权限')
```

**addPermisionInterceptor 添加 uniApi 调用拦截**

| 位置	| 类型			| 描述																															| 可选值																												|
| ----	| -------------	| ------------------------------------------------------------																	 | ------------------------------------------------------------																	 |
| 0		| String		| 要拦截的 uniApi 名称																											| scanCode、chooseImage、chooseVideo、saveImageToPhotosAlbum、saveVideoToPhotosAlbum、getLocation、startLocationUpdate、makePhoneCall、getRecorderManager、startBluetoothDevicesDiscovery	|
| 1		| String		| 申请权限说明信息																												| 自定义文本																							|
| 2		| Boolean		| 只询问一次, 用户不同意申请或拒绝权限将无法使用 uniApi, 如果要继续使用 Api 先用 removePermisionInterceptor 函数移除拦截再调用 Api	| true, false	|

**removePermisionInterceptor 移除 uniApi 调用拦截**

| 位置 | 类型        | 描述                     | 可选值                |
| ---- | ------------- | ------------------------ | ------------------------ |
| 0    | String | 要移除拦截的 uniApi 名称 | 同上 |

**requestAndroidPermission 手动申请权限同时弹出申请权限目的弹窗**

| 位置	| 类型			| 描述											| 可选值																								|
| ----	| -------------	| ------------------------						| ------------------------																			|
| 0		| String		| 安卓权限名称, 例: android.permission.CAMERA	|  [权限列表参考](https://uniapp.dcloud.net.cn/tutorial/app-nativeresource-android.html#permissions)	|
| 1		| Object		| 安卓权限申请说明信息							|  例: { title: '相机权限申请说明', content: '应用需要访问您的相机，以便拍摄照片或扫描二维码。'}		|

```js
// 示例
import { requestAndroidPermission } from '@/uni_modules/x-perm-apply-instr/js_sdk/index.js'
requestAndroidPermission('android.permission.READ_EXTERNAL_STORAGE', {
    title: '存储读取权限申请说明',
    content: '应用需要读取您的存储，以便加载图片、视频等多媒体文件。'
}).then(status => {
    // status 权限申请结果 （1:已获得权限, 0:拒绝本次申请, -1:永久拒绝申请）
    console.log('status', status);
})
```

#### 注意, 如果需要拦截 getRecorderManager , 在使用时不要直接在 script 下初始化, 会导致拦截失败, 请在 onLoad 或 onReady 中调用

``` vue
<script>
	// 错误写法
	const recorderManager = uni.getRecorderManager();
	// 正确写法
	let recorderManager = null
    export default {
		onLoad() {
			recorderManager = uni.getRecorderManager();
		}
    }
</script>
```

------


### 插件如果对你有帮助给个好评吧~
