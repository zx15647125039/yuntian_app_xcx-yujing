NaBpmAction组件配置说明
number：初始默认显示数量(类型为数值)，默认值为3
more：是否显示更多按钮(类型为布尔值)，默认值为true(显示)
list：初始默认数据json类型(类型为数组对象),默认格式为:
[{ actionCode:'',actionName:'',actionIcon:'',color:'',nodeId:'',nodeCode:'',nodeName:''}]
 ——actionCode:处理操作编码(必须)；actionName:处理操作名称(必须)；actionIcon:处理操作图标;
 ——color:初始自定义文字颜色；nodeId:节点标识；nodeId:节点编码；nodeName:节点名称
initKey：内容自定义转换的数据格式(类型为对象),
  如:{
      aCode:'actionCode',
      aName:'actionName',
      color:'color'
      nId:'nodeId',
      nCode:'nodeCode',
      nName:'nodeName'
    }
token：访问权限令牌(类型为字符串)
url：初始获取数据请求地址(类型为字符串),值存在时默认请求后端数据覆盖list
way：初始获取数据请求方式(类型为字符串),默认值为post
args：初始获取数据请求参数(类型为对象)
onSuccess：数据请求成功的回调函数，回传数据数组对象集合
onFail：数据请求失败的回调函数，回传异常信息
onHandle：点击操作时的回调函数，回传数据对象集合

数据集合案例如下：
list:[
    {
        "nodeId":11,
        "nodeCode": "N6",
        "nodeName": "组合规则审批",
        "actionName": "通过",
        "actionCode": "approve",
        "actionIcon":'',
        "color": "blue"
    },
    {
        "nodeId":12,
        "nodeCode": "N6",
        "nodeName": "组合规则审批",
        "actionName": "废弃",
        "actionCode": "abandon",
        "actionIcon":'',
        "color": "red"
    },
    {
        "nodeId":13,
        "nodeCode": "N6",
        "nodeName": "组合规则审批",
        "actionName": "驳回",
        "actionCode": "reject",
        "actionIcon":'',
        "color": ""
    },
    {
        "nodeId":14,
        "nodeCode": "N6",
        "nodeName": "组合规则审批",
        "actionName": "转办",
        "actionCode": "transfer",
        "actionIcon":'',
        "color": "black"
    },
    {
        "nodeId":15,
        "nodeCode": "N6",
        "nodeName": "组合规则审批",
        "actionName": "催办",
        "actionCode": "urgent",
        "actionIcon":'',
        "color": "black"
    },
    {
        "nodeId":16,
        "nodeCode": "N6",
        "nodeName": "组合规则审批",
        "actionName": "沟通",
        "actionCode": "communicate",
        "actionIcon":'',
        "color": "black"
    }
]

调用组件传参方式参考如下：
常规调用时——
<na-bpm-action :list="list" :onHandle="handleAction"/>
<na-bpm-action :list="list" :initKey="initKey" :onHandle="getHandle"></na-bpm-action>
<na-bpm-action :url="url" :args="args" :onSuccess="getNaBpmActionSuccess" :onFail="getNaBpmActionFail"></na-bpm-action> 
父组件获取子组件数据，调用函数如下：
const getHandle = (data) =>{}
const getNaBpmActionSuccess = (data) =>{}
const getNaBpmActionFail = (data) =>{}
     
##################################################################
   
