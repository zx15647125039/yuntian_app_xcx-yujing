NaBpmAppoint组件配置说明
height：表格高度(类型数值)，值为-1时为100%
list：初始默认数据json类型(类型为数组对象),默认格式为:
[{ nodeId:'',nodeCode:'',nodeName:''
   operator:[{ userId:'',userName:'' }]
}]
 ——nodeId:节点唯一标识(必须)；nodeId:节点编号(必须)；nodeName:节点名称(必须)；
 operator:处理人(可多人)；
    ——userId:处理人编号(必须)；userName:处理人名称(必须)；
initKey：内容自定义转换的数据格式(类型为对象),
  如:{
      nId:'nodeId',
      nCode:'nodeCode',
      nName:'nodeName',
      children:{
          uId:'userId'
          uName:'userName'
      }
    }
childKey：设置子数组的key值(类型为字符串)，默认值为operator
token：访问权限令牌(类型为字符串)
url：初始获取数据请求地址(类型为字符串),值存在时默认请求后端数据覆盖list
way：初始获取数据请求方式(类型为字符串),默认值为post
args：初始获取数据请求参数(类型为对象)
onSuccess：数据请求成功的回调函数，回传数据数组对象集合
onFail：数据请求失败的回调函数，回传异常信息
onChange：数据增减时的回调函数，回传数据数组对象集合
onSelect：数据发起增添时的回调函数

数据集合案例如下：
list:[
    {
        "nodeId": 1211,
        "nodeCode":'N10',
        "nodeName":'职位审批',
        "operator":[
            {
                "userId": 7174,
                "userName": "赵小兰",
            },
            {
                "userId": 7175,
                "userName": "胡冰",
            }
        ]
    },
    {
        "nodeId": 1212,
        "nodeCode":'N12',
        "nodeName":'指定审批人审批',
        "operator":[
            {
                "userId": 7171,
                "userName": "张三锋",
            }
        ]
    },
    {
        "nodeId": 1213,
        "nodeCode":'N14',
        "nodeName":'角色审批',
        "operator":[
            {
                "userId": 7172,
                "userName": "谢小玉",
            }
        ]
    }
]

调用组件传参方式参考如下：
常规调用时——
<na-bpm-appoint :list="list" />
<na-bpm-appoint :list="list" :initKey="initKey" :initCode="initCode"></na-bpm-appoint>
<na-bpm-appoint :url="url" :args="args" :onSuccess="getNaBpmAppointSuccess" :onFail="getNaBpmAppointFail"></na-bpm-appoint> 
父组件获取子组件数据，调用函数如下：
const getNaBpmAppointSuccess = (data) =>{}
const getNaBpmAppointFail = (data) =>{}
     
##################################################################
   
