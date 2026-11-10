NaBpmRecord组件配置说明
height：表格高度(类型数值)，值为-1时为100%
list：初始默认数据json类型(类型为数组对象),默认格式为:
[{ nodeId:'',nodeCode:'',nodeName:'',operation:'',operateTime:'',
    operator:[{ userId:'',userName:'' }] }]
 ——nodeId:节点唯一标识(必须)；nodeId:节点编号(必须)；nodeName:节点名称(必须)；
 ——operation:处理信息；operateTime:处理时间
 operator:处理人(可多人)；
    ——userId:处理人编号(必须)；userName:处理人名称(必须)；
initKey：内容自定义转换的数据格式(类型为对象),
  如:{
      id:'nodeId',
      code:'nodeCode',
      name:'nodeName',
      detail:'operation',
      date:'operateTime',
      user:'operator',
       children:{
            uId:'userId'
            uName:'userName'
       }
    }
token：访问权限令牌(类型为字符串)
url：初始获取数据请求地址(类型为字符串),值存在时默认请求后端数据覆盖list
way：初始获取数据请求方式(类型为字符串),默认值为post
args：初始获取数据请求参数(类型为对象)
onSuccess：数据请求成功的回调函数，回传数据数组对象集合
onFail：数据请求失败的回调函数，回传异常信息

数据集合案例如下：
list:[
    {
        "nodeId": 1321,
        "nodeCode": "N8",
        "nodeName": "条件分支",
        "operateTime": "2022-05-23 23:56:23",
        "operation": "条件分支处理，走分支: !=aaa",
        "operator": [
            {
                "userId": 90005127,
                "userName": "王武器",
            }
        ]
    },
    {
        "nodeId": 1322,
        "nodeCode": "N6",
        "nodeName": "组合规则审批",
        "operateTime": "2022-05-22 9:24:43",
        "operation": "重试",
        "operator": [
            {
                "userId": 90005128,
                "userName": "李四悦",
            }
        ]
    },
    {
        "nodeId": 1323,
        "nodeCode": "N6",
        "nodeName": "并审",
        "operateTime": "2022-05-20 10:20:10",
        "operation": "通过",
        "operator": [
            {
                "userId": 90005129,
                "userName": "刘洋",
            },
            {
                "userId": 90005126,
                "userName": "宋涛宇",
            }
        ]
    },
    {
        "nodeId": 1324,
        "nodeCode": "N3",
        "nodeName": "起草",
        "operateTime": "2022-05-19 15:17:10",
        "operation": "起草提交",
        "operator": [
            {
                "userId": 90005125,
                "userName": "赵小龙",
            }
        ]
    }
]

调用组件传参方式参考如下：
常规调用时——
<na-bpm-record :list="list" />
<na-bpm-record :list="list" :initKey="initKey"></na-bpm-record>
<na-bpm-record :url="url" :args="args" :onSuccess="getNaBpmRecordSuccess" :onFail="getNaBpmRecordFail"></na-bpm-record> 
父组件获取子组件数据，调用函数如下：
const getNaBpmRecordSuccess = (data) =>{}
const getNaBpmRecordFail = (data) =>{}
     
##################################################################
   
