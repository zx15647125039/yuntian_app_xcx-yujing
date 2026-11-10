NaBpmPublicPopup组件配置说明
title：弹窗标题(类型为字符串)
height：弹窗高度(类型为数值)，值为-1时为100%,默认值为:300
width：弹窗宽度(类型为数值)，值为-1时为100%,默认值为:300
onClose：弹窗关闭时的回调函数,回传文本框的内容及触发动作布尔值,true:确定,false:取消

向外暴露的值及函数：
inputPopup：文本框内容
openPopup：打开弹窗函数
cancelPopup：关闭弹窗函数
confirmPopup：点击弹窗确定按钮函数

调用组件传参方式参考如下：
常规调用时——
<na-bpm-public-popup ref="bpmPublicPopupRef" :onClose="handlePublicPopup">
    <view>自定义内容模块2</view>
</na-bpm-public-popup>
父组件获取子组件数据，调用函数如下：
const handlePublicPopup = (data,tag=false) =>{}

     
##################################################################
   
