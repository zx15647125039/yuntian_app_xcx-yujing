<template>
    <view class="node-col-progress-box" :style="{ height:props.height>0?`${props.height}px`:'100%' }">
        <view class="col-progress-content" v-if="listArr?.length>0">
            <view class="col-progress-item">
                <view class="progress-item-box">
                    <view class="progress-item-node" :class="listArr[0]?.finish?'node-finish':''">
                        <view class="item-node-text">
                            <image class="node-finish-img" src="../../static/image/process/card-complete.png" alt="完成" />
                        </view>
                    </view>
                    <view class="progress-item-line" :class="listArr[0]?.finish?'line-success':''">
                        <view class="finish-text">{{listArr[0]?.finish && listArr[0]?.actionCode==props.initCode['abandon']?'结束':'完成'}}</view>
                    </view>
                </view>
            </view>
            <view class="col-progress-item" v-for="(item,index) in listArr" :key="index">
                <view class="progress-item-box">
                    <view class="progress-item-node" :class="handleNodeClass(item,index)">
                        <view class="item-node-text" v-if="index==listArr.length-1 && item.actionCode==props.initCode['submit']">发起</view>
                        <view class="item-node-text" v-else><text>节点{{item.nodeCode}}</text></view>
                    </view>
                    <view class="progress-item-line line-success" :class="handleLineClass(item,index)">
                        <view class="progress-item-r-content">
                            <view class="item-r-content-user">
                                <view class="content-user-content">
                                    <image v-if="handleOperatorIcon(item.operator)" class="user-content-one-user" :src="handleOperatorIcon(item.operator)" alt="用户" />
                                    <text v-else class="user-content-one">{{handleOperator(item.operator) && handleOperator(item.operator).substring(handleOperator(item.operator).length-2)}}</text>
                                    <text class="user-content-tow">{{handleOperator(item.operator)}}</text>
                                </view>
                                <text class="content-node-name">{{item.nodeCode}}:{{item.nodeName}}</text>
                            </view>
                            <view class="item-r-content-time" v-if="index==listArr.length-1 && item.actionCode==props.initCode['submit']">发起时间：{{item.operateTime}}</view>
                            <view class="item-r-content-detail" v-else :class="{'detail-red':item.actionCode==props.initCode['reject'] || item.actionCode==props.initCode['abandon']}">{{item.actionName}}</view>
                            <view class="item-r-content-time">{{item?.operation && `审批意见：${item.operation}`}}</view>
                            <view class="item-r-content-time" v-if="item?.attachment?.length>0">意见附件：
                                <text class="content-time-file" v-for="(aitem,aindex) in item.attachment" :key="aindex">{{aitem.name}}</text>
                            </view>
                        </view>
                        <text class="item-r-content-icon">
                            <image class="content-icon-img" v-if="item.actionCode==props.initCode['abandon']" src="../../static/image/process/card-icon-reject.png" />
                            <image class="content-icon-img" v-else-if="item.actionCode != props.initCode['reject'] && item.actionCode != props.initCode['active']" src="../../static/image/process/card-submit.png" />
                        </text>
                    </view>
                </view>
            </view>
        </view>
        <view class="progress-load" v-else>
            <view class="progress-load-image"><image src="../../static/image/process/empty.png" alt="暂无数据" /></view>
            <view>暂无相关数据</view>
        </view>
    </view>
</template>



<script setup lang="ts">
    import {onMounted, ref} from 'vue'
    import {ConvertKey} from "../na-utils/format";
    import service from "../na-utils/service";
    const props = defineProps({
        height:{//高度，值为-1时为100%
            type:Number,
            default:300
        },
        list:{
            type:Array,
            default:()=>[]
        },
        /*
        * 重组的key格式，如
        * {
        *   nId:'nodeId',
        *   nCode:'nodeCode',
        *   nName:'nodeName',
        *   detail:'operation',
        *   date:'operateTime',
        *   status:'finish',
       *   user:'operator',
       *   //operator下自定义的key
       *   children:{
       *       uId:'userId'
       *       uName:'userName'
       *   }
        * }
        * 标准key--{
        *  nodeId:节点唯一标识,
        *  nodeCode:'节点编码',
        *  nodeName:节点名称,
        *  operateTime:处理时间,
        *  operation:处理意见,
        *  finish:当前是否为最后一个节点(true/false),
        *  operator:[
       *   userId:'',处理人编号,
       *   userName:'',处理人姓名,
       *   userIcon:'',处理人头像地址,
       *  ]
        *  attachment:[
        *   id:'附件编号'
        *   name:'附件名称',
        *   path:'附件访问路径'
        *  ]
        * }
        * */
        initKey:{
            type: Object,
            default(){
                return {}
            }
        },
        childKey:{//设置子数组的key值
            type:String,
            default:'operator'
        },
    /*
    * 默认的节点编码
    *   submit:起草,
    *   active:处理中,
    *   approve:通过,
    *   reject:驳回,
    *   abandon:废弃,
     */
    initCode:{
        type: Object,
        default(){
            return {
                submit:'submit',//起草
                active:'active',//处理中
                approve:'approve',//通过
                reject:'reject',//驳回
                abandon:'abandon',//废弃
            }
        }
    },
    token:{//访问权限令牌
        type:String,
        default:''
    },
    url:{//接口请求完整url,含域名
        type:String,
        default:''
    },
    way:{//请求方式
        type:String,
        default:'post'
    },
    args:{
        type:Object,
        default:()=>{}
    },
    onSuccess:{
        type: Function,
        default() {
            return Promise.resolve()
        }
    },
    onFail:{
        type: Function,
        default() {
            return Promise.resolve()
        }
    },
})

let listArr = ref(props.list)

onMounted(()=>{
    if(props.url !=''){
        getBpmProcessList()
    }else{
        listArr.value = props.list;
        if(!(Object.keys(props.initKey).length==0)){
            let newList = ConvertKey(listArr.value,props.initKey,props.childKey);
            listArr.value = newList;
        }
    }
})

const getBpmProcessList = () =>{
    service({
        url:props.url,
        method:props.way,
        data:props.args,
        token:props.token
    }).then((res:any)=>{
        if(res?.length>0){
            listArr.value = res;
            if(!(Object.keys(props.initKey).length==0)){
                let newList = ConvertKey(res,props.initKey,props.childKey);
                listArr.value = newList;
            }
        }
        if(props.onSuccess){
            props.onSuccess(res)
        }
    }).catch((err:any)=>{
        if(props.onFail){
            props.onFail(err)
        }
    })
}

    const handleOperator = (operator:[]) =>{
        let nameArr: any[string] = [];
        operator?.length>0 && operator.map((item:object)=>{
            item?.userName && nameArr.push(item.userName)
        })
        return nameArr.join(',')
    }

    const handleOperatorIcon = (operator:[]) =>{
        let uIcon = operator?.length>0 && operator[operator.length-1]?.userIcon || null
        return uIcon
    }



const handleNodeClass  = (item: any) =>{//处理当前节点文字颜色
    let initClass = '';
    switch (item.actionCode) {
        case props.initCode['active']:
            initClass = 'node-active';
            break;
        case props.initCode['reject']:
        case props.initCode['abandon']:
            initClass = 'node-fail';
            break;
        default:
            initClass = 'node-success';
            break;
    }
    return initClass;
}

const handleLineClass = (item: any,index: number) =>{//处理当前节点线条颜色
    let initClass = '';
    switch (item.actionCode) {
        case props.initCode['submit']:
            if(index==listArr.value?.length-1){
                initClass = 'node-end';
            }
            break;
        case props.initCode['active']:
            initClass = 'line-active';
            break;
        case props.initCode['reject']:
        case props.initCode['abandon']:
            initClass = 'line-fail'
            break;
        default:
            initClass = 'line-success';
            break;
    }
    return initClass;
}



</script>

<style lang="scss" scoped>
    .node-col-progress-box{
        width: 100%;
        padding: 10px;
        background: #FFFFFF;
        box-sizing: border-box;
        overflow: hidden;
        overflow-y: scroll;
    }
    .node-col-progress-box::-webkit-scrollbar-track-piece {
        background-color: transparent;
    }
    .node-col-progress-box::-webkit-scrollbar {
        width: 8px;
        height: 8px;
        background-color: transparent;
    }
    .node-col-progress-box::-webkit-scrollbar-thumb {
        border-radius: 5px;
    }
    .node-col-progress-box:hover::-webkit-scrollbar-thumb{
        background-color: hsla(220, 4%, 58%, .3);
    }
    .node-col-progress-box:hover::-webkit-scrollbar-thumb{
        background-color: hsla(220, 4%, 58%, .3);
    }
    .col-progress-content{
        width: 98%;
        margin-left: 2%;
        box-sizing: border-box;
    }
    .col-progress-item{
        width: 100%;
        box-sizing: border-box;
    }
    .col-progress-item-l>text{
        display: inline-block;
        width: 36px;
        height: 36px;
        background: #00bd96;
        border-radius: 50%;
        font-size: 12px;
        color: #FFFFFF;
        line-height: 36px;
        text-align: center;
    }
    .col-progress-item-l>view{
        width: 36px;
        text-align: center;
    }
    .col-progress-item-l>view>view{
        width: 2px;
        border-right: 2px solid #00BD96;
        margin: 0;
        padding: 0 49% 0 0;
        box-sizing: border-box;
    }
    .progress-item-box{
        width: 100%;
        position: relative;
    }
    .progress-item-box>view{
        font-size: 14px;
        font-weight: 400;
        text-align: left;
        color: #c8d2e3;
        line-height: 36px;
    }
    .progress-item-line{
        width: 100%;
        border-left: 2px solid #C8D2E3;
        padding: 0 20px 20px 40px;
        box-sizing: border-box;
    }
    .progress-item-node{
        display: inline-block;
        position: absolute;
        left: -20px;
        top: 0;
        z-index: 5;
        text-align: center;
    }
    .progress-item-node .item-node-text{
        display: inline-block;
        width: 40px;
        height: 40px;
        background: #C8D2E3;
        border-radius: 50%;
        font-size: 10px;
        color: #FFFFFF;
        line-height: 40px;
        text-align: center;
        overflow: hidden;
    }
    .progress-item-node .item-node-text>text{
        display: inline-block;
        font-style: normal;
        line-height: 14px;
        padding: 5px 1px 0;
        box-sizing: border-box;
    }
    .progress-item-node .item-node-text .progress-img{
        display: inline-block;
        width: 18px;
        height: 18px;
        background-size: cover;
        vertical-align: middle;
    }
    .progress-img{
        display: inline-block;
        width: 18px;
        height: 18px;
        background-size: cover;
        vertical-align: middle;
    }
    .item-r-content-icon{
        display: inline-block;
        position: absolute;
        right: 5px;
        bottom: 5px;
        .content-icon-img{
            width: 32px;
            height: 32px;
            background-size: cover;
        }
    }
    .progress-item-r-content{
        width: 100%;
        background: #EBF2FE;
        border-radius: 10px;
        padding: 10px 10px;
        box-sizing: border-box;
    }
    .item-r-content-user{
        width: 100%;
        margin-bottom: 5px;
        overflow: hidden;
    }
    .content-user-content{
        display: inline-block;
        height: 36px;
        background: #ffffff;
        border-radius: 18px;
        box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.16);
        position: relative;
    }
    .content-node-name{
        float: right;
        font-size: 13px;
        color: #9cb8cc;
        vertical-align: middle;
    }
    .user-content-one{
        display: inline-block;
        width: 36px;
        height: 36px;
        background: #0badf9;
        border-radius: 50%;
        box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.16);
        font-size: 12px;
        line-height: 36px;
        color: #FFFFFF;
        text-align: center;
        overflow: hidden;
    }
    .user-content-one-user{
        display: inline-block;
        width: 36px;
        height: 36px;
        background-size: cover;
        border-radius: 50%;
        margin: 0;
        padding: 0;
    }
    .user-content-tow{
        display: inline-block;
        height: 36px;
        line-height: 36px;
        padding: 0 10px;
        font-size: 14px;
        font-weight: 400;
        color: #444444;
        max-width: 150px;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
    }
    .item-r-content-time{
        width: 100%;
        font-size: 14px;
        font-weight: 400;
        text-align: left;
        color: #808080;
        line-height: 20px;
        padding: 0 0 3px;
        box-sizing: border-box;
    }
    .content-time-file{
        display: inline-block;
        margin: 0 15px 0 0;
        color: #808080;
        font-size: 14px;
        text-decoration: underline;
        cursor: pointer;
    }
    .content-time-file:hover{
        color: #0badf9;
    }
    .item-r-content-detail{
        font-size: 14px;
        font-weight: 400;
        text-align: left;
        color: #444444;
        padding: 0;
        line-height: 24px;
    }
    .detail-red{
        color: #E64340;
    }
    .line-success{
        border-color: #00bd96;
        .finish-text{
            color: #2b4943;
            font-weight: bolder;
        }
    }
    .node-success .item-node-text{
        background: #00bd96;
    }
    .line-active{
        border-color: #FF9F00;
    }
    .node-active .item-node-text{
        background: #FF9F00;
    }
    .line-fail{
        border-color: #E64340;
    }
    .node-fail .item-node-text{
        background: #E64340;
    }
    .node-end{
        border-color: #FFFFFF;
    }
    .node-finish .item-node-text{
        background: #2b4943;
    }
    .node-finish-img{
        display: inline-block;
        vertical-align: middle;
        width: 18px;
        height: 18px;
        background-size: cover;
    }
    .finish-text{
        color: #b8c2d2;
        font-weight: bolder;
    }
    .progress-load{
        text-align: center;
        color: #888888;
        font-size: 14px;
        padding-top:5%;
        box-sizing: border-box;
    }
    .progress-load-image>image{
        display: inline-block;
        max-width: 150px;
        background-size: cover;
    }

    @media (min-width:280px) and (max-width: 900px) {
        .col-progress-content{
            width: 95%;
            margin-left: 5%;
            box-sizing: border-box;
        }
    }
</style>
