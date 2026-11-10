NaBpmNotifyWay组件配置说明
data：初始默认已选数据(类型为数组)
list：初始默认数据列表json类型(类型为数组对象),默认格式为:[{value:'',text:''}]
initKey：内容自定义转换的数据格式(类型为对象),如:{id:'value',name:'text'}
color：组件主题色(类型为字符串),默认值为:#ea0a2a
mode：排版方式(类型为字符串),level:水平,vertical:垂直,默认值为:level
initKey：内容自定义转换的数据格式(类型为对象),
  如:{
      id:'value',
      name:'text'
    }
token：访问权限令牌(类型为字符串)
url：初始获取数据请求地址(类型为字符串),值存在时默认请求后端数据覆盖list
way：初始获取数据请求方式(类型为字符串),默认值为post
args：初始获取数据请求参数(类型为对象)
onSuccess：数据请求成功的回调函数，回传数据数组对象集合
onFail：数据请求失败的回调函数，回传异常信息
onChange：值改变时函数，回传已选的value数组集合,已选的list数组对象集合

数据集合案例如下：
list:[
    { text: '邮件', value: 'email' },
    { text: '待办', value: 'todo' },
    { text: '企业微信', value: 'wechat' }
]

调用组件传参方式参考如下：
常规调用时——
<na-bpm-notify-way :list="list" :onChange="handleBpmNotifyWay"></na-bpm-notify-way>
<na-bpm-notify-way :url="url" :args="args" :onSuccess="getNaBpmNotifyWaySuccess" :onFail="getNaBpmNotifyWayFail"></na-bpm-notify-way> 
父组件获取子组件数据，调用函数如下：
const handleBpmNotifyWay = (data) =>{}
const getNaBpmNotifyWaySuccess = (data) =>{}
const getNaBpmNotifyWayFail = (data) =>{}
     
##################################################################
   
