NaBpmUrgentUser组件配置说明
title:标题(类型为字符串)
data：初始默认原始数据(类型对象),默认格式为:{userId:'',userName:''}
list：初始默认数据列表json类型(类型为数组对象),默认格式为:[{userId:'',userName:''}]
initKey：内容自定义转换的数据格式(类型为对象),
  如:{
      id:'userId',
      name:'userName'
    }
url：初始获取数据请求地址(类型为字符串),值存在时默认请求后端数据覆盖list
way：初始获取数据请求方式(类型为字符串),默认值为post
args：初始获取数据请求参数(类型为对象)
onSuccess：数据请求成功的回调函数，回传数据数组对象集合
onFail：数据请求失败的回调函数，回传异常信息
onChange：值改变时函数，回传已选的value数组集合,已选的list数组对象集合
onChange：去增添数据时函数

数据集合案例如下：
list:[
    {
        userId: "11",
        userName: "张三锋"
    },
    {
        userId: "12",
        userName: "李四云"
    },
    {
        userId: "13",
        userName: "王五久"
    }
]

调用组件传参方式参考如下：
常规调用时——
<na-bpm-user-source :list="list" :onChange="handleBpmUserSource"></na-bpm-user-source>
<na-bpm-user-source :url="url" :args="args" :onSuccess="getNaBpmUserSourceSuccess" :onFail="getNaBpmUserSourceFail"></na-bpm-user-source> 
父组件获取子组件数据，调用函数如下：
const handleBpmUserSource = (data) =>{}
const getNaBpmUserSourceSuccess = (data) =>{}
const getNaBpmUserSourceFail = (data) =>{}
     
##################################################################
   
