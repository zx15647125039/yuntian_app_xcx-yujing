NaBpmNode组件配置说明
height：表格高度(类型数值)，值为-1时为100%
list：初始默认数据json类型(类型为数组对象),默认格式为:
[{ nodeId:'',nodeCode:'',nodeName:'',actionCode:'',actionName:'',
   operator:[{ userId:'',userName:'',userIcon:'',actionCode:'',actionName:'' }]
}]
 ——nodeId:节点唯一标识；nodeCode:节点编码；nodeName:节点名称(必须);
 ——actionCode:处理操作编码(必须)；actionName:处理操作名称(如通过/拒绝等)(必须);
 operator:处理人(可多人) ——userId:处理人编号(必须)；userName:处理人名称(必须)；userIcon:处理人头像;

initKey：内容自定义转换的数据格式(类型为对象),
  如:{
      nId:'nodeId',
      nCode:'nodeCode',
      nName:'nodeName',
      user:'operator',
      aCode:'actionCode',
      aName:'actionName',
      children:{
          uId:'userId'
          uName:'userName',
          uIcon:'userIcon',
          aCode:'actionCode',
          aName:'actionName'
      }
    }
childKey：设置子数组的key值(类型为字符串)，默认值为operator
initCode：默认的节点编码(类型为对象),默认格式为
  ——{submit:'submit',active:'active',approve:'approve',reject:'reject',abandon:'abandon'}
  ——submit:起草；active:处理中；approve:通过；reject:驳回；abandon:废弃
token：访问权限令牌(类型为字符串)
url：初始获取数据请求地址(类型为字符串),值存在时默认请求后端数据覆盖list
way：初始获取数据请求方式(类型为字符串),默认值为post
args：初始获取数据请求参数(类型为对象)
onSuccess：数据请求成功的回调函数，回传数据数组对象集合
onFail：数据请求失败的回调函数，回传异常信息

数据集合案例如下：
list:[
    {
        "nodeId": 7171,
        "nodeCode": "N3",
        "nodeName": "起草",
        "actionCode": "submit",
        "actionName": "提交",
        "operator": [{
                "userId": 90005121,
                "userName": "赵小兰",
                "actionCode": "submit",
                "actionName": "提交",
        }]
    },
    {
        "nodeId": 7176,
        "nodeCode": "N6",
        "nodeName": "组合规则审批",
        "actionCode": "revert",
        "actionName": "通过",
        "operator": [
            {
                "userId": 90005131,
                "userName": "张三锋",
                "actionCode": "approve",
                "actionName": "通过"
            },
            {
                "userId": 90005132,
                "userName": "谢小玉",
                "actionCode": "approve",
                "actionName": "通过"
            },
            {
                "userId": 90005133,
                "userName": "胡冰",
                "actionCode": "reject",
                "actionName": "驳回"
             },
            {
                "userId": 90005134,
                "userName": "张楼兰",
                "actionCode": "approve",
                "actionName": "通过"
            }
        ]
    },
    {
        "nodeId": 71711,
        "nodeCode": "N11",
        "nodeName": "条件审批",
        "actionCode": "reject",
        "actionName": "驳回",
        "operator": [{
            "userId": 90005151,
            "userName": "王一鸣",
            "actionCode": "reject",
            "actionName": "驳回"
        }]
    },
    {
        "nodeId": 7177,
        "nodeCode": "N7",
        "nodeName": "角色审批",
        "actionCode": "approve",
        "actionName": "通过",
        "operator": [{
            "userId": 90005141,
            "userName": "凌云",
            "actionCode": "approve",
            "actionName": "通过",
        }]
    },
    {
        "nodeId": 7178,
        "nodeCode": "N8",
        "nodeName": "条件审批",
        "actionCode": "active",
        "actionName": "处理中",
        "operator": [{
            "userId": 90005141,
            "userName": "赵小燕",
            "actionCode": "",
            "actionName": "",
        }]
    }
]

调用组件传参方式参考如下：
常规调用时——
<na-bpm-node :list="list" />
<na-bpm-node :list="list" :initKey="initKey" :initCode="initCode"></na-bpm-node>
<na-bpm-node :url="url" :args="args" :onSuccess="getNaBpmNodeSuccess" :onFail="getNaBpmNodeFail"></na-bpm-node> 
父组件获取子组件数据，调用函数如下：
const getNaBpmNodeSuccess = (data) =>{}
const getNaBpmNodeFail = (data) =>{}
     
##################################################################
   
