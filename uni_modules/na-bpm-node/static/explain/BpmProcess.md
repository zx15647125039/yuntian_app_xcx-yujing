NaBpmProcess组件配置说明
height：表格高度(类型数值)，值为-1时为100%
list：初始默认数据json类型(类型为数组对象),默认格式为:
[{ nodeId:'',nodeName:'',operateTime:'',operation:'',
   userId:'',userName:'',userIcon:'',finish:'',
   attachment:[{ id:'',name:'',path:'' }]
}]
 ——nodeId:节点唯一标识(必须)；nodeCode:节点编码(必须)；nodeName:节点名称(必须)；
 ——operateTime:处理时间；operation:处理意见；finish:当前是否为最后一个节点；
 ——userId:处理人编号(必须)；userName:处理人名称(必须)；userIcon:处理人头像；
 ——attachment:附件列表(id-附件编号，name-附件名称，path-附件访问路径)；
initKey：内容自定义转换的数据格式(类型为对象),
  如:{
      nId:'nodeId',
      nCode:'nodeCode',
      nName:'nodeName',
      detail:'operation',
      user:'operator',
      date:'operateTime',
      uId:'userId',
      uName:'userName',
      uIcon:'userIcon',
      status:'finish',
      children:{
          aId:'id'
          aName:'name',
          aPath:'path'
      }
    }
childKey：设置子数组的key值(类型为字符串)，默认值为attachment
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
        "nodeId": 1,
        "nodeCode": "N5",
        "nodeName": "角色审批",
        "actionCode": "abandon",
        "actionName": "废弃",
        "operation": "订单已失效",
        "operateTime": "2022-05-16 16:20:13",
        "finish":false,
        "operator": [
            {
                "userId": 90005127,
                "userName": "王武器",
            },
            {
                "userId": 90005222,
                "userName": "欧阳因",
            }
        ]
    },
    {
        "nodeId": 2,
        "nodeCode": "N6",
        "nodeName": "串审",
        "actionCode": "approve",
        "actionName": "通过",
        "operation": "单方面通过",
        "operateTime": "2022-05-16 19:45:50",
        "finish":true,
        "operator": [
            {
                "userId": 90005236,
                "userName": "赵六月",
            }
        ],
        "attachment":[{
            "id":"11",
            "name":"采购附件1",
            "path":""
        }]
    },
    {
        "nodeId": 3,
        "nodeCode": "N5",
        "nodeName": "条件审批",
        "actionCode": "reject",
        "actionName": "驳回",
        "operation": "订单已失效",
        "operateTime": "2022-05-16 16:20:13",
        "finish":false,
        "operator": [
            {
                "userId": 90005127,
                "userName": "王多余",
            }
        ]
    },
    {
        "nodeId": 4,
        "nodeCode": "N4",
        "nodeName": "组合规则审批",
        "actionCode": "approve",
        "actionName": "通过",
        "operation": "满足多种场景",
        "operateTime": "2022-05-16 9:17:00",
        "finish":false,
        "operator": [
            {
                "userId": 90005125,
                "userName": "李思雨",
            }
        ]
    },
    {
        "nodeId": 5,
        "nodeCode": "N3",
        "nodeName": "起草",
        "actionCode": "submit",
        "actionName": "提交",
        "operation": "发起流程",
        "operateTime": "2022-05-15 12:10:10",
        "finish":false,
        "operator": [
            {
                "userId": 90005113,
                "userName": "张三丰",
            }
        ]
    }
]

调用组件传参方式参考如下：
常规调用时——
<na-bpm-progress :list="list" />
<na-bpm-process :list="list" :initKey="initKey" :initCode="initCode"></na-bpm-process>
<na-bpm-process :url="url" :args="args" :onSuccess="getNaBpmProcessSuccess" :onFail="getNaBpmProcessFail"></na-bpm-process> 
父组件获取子组件数据，调用函数如下：
const getNaBpmProcessSuccess = (data) =>{}
const getNaBpmProcessFail = (data) =>{}
     
##################################################################
   
