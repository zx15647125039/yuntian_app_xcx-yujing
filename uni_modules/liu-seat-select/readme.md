### liu-seat-select适用于uni-app项目的任何座位选择的自定义组件
### 本组件目前兼容微信小程序、H5
### 我们更推荐您使用我们的这个模版，自由度更高！[https://ext.dcloud.net.cn/plugin?id=15737](https://ext.dcloud.net.cn/plugin?id=15737)
# --- 扫码预览、关注我们 ---

## 扫码关注公众号，查看更多插件信息，预览插件效果！ 

![](https://uni.ckapi.pro/uniapp/publicize.png)

### 使用示例
``` 
<template>
	<view class="page-main">
		<liu-seat-select :seatTop='6' :deskTop="5" :seatBottom='6' :deskBottom='5' :selects='2' @change='getSeat'></liu-seat-select>
	</view>
</template>

<script>
	export default {
		data() {
			return {
			}
		},
		methods: {
			getSeat(e){
				let seat = e.map(res=>{
					return res.seatNumber
				})
				console.log(seat)
				uni.showToast({
					title: '你选择的座位是' + seat.join(','),
					icon: 'none'
				});
			},
		}
	}
</script>

<style lang="scss">
	page {
		background-color: #f0f0f0;
	}
</style>
```

### 属性说明
| 名称                         | 类型            | 默认值               | 描述            |
| ----------------------------|--------------- | -------------------- | ---------------|
| seatTop             		    | Number         | 6             	      | 上方每个桌子的座位数
| deskTop              		    | Number         | 6            	   	  | 上方的桌子数
| seatBottom            			| Number         | 6                    | 下方每个桌子的座位数
| deskBottom                  | Number         | 6                    | 下方的桌子数
| selects                     | Number         | 1                	  | 可以选择的座位数
| @change                     | Function       |                      | 选完座位确认的回调事件



