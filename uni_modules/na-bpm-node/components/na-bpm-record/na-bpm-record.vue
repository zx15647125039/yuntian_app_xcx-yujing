<template>
    <view class="node-col-record-box" :style="{ height:props.height>0?`${props.height}px`:'100%' }" >
        <view class="col-record-content" v-if="listArr?.length>0">
            <view class="col-record-item" v-for="(item,index) in listArr" :key="index">
                <view class="col-record-item-one">
                    <text>{{item?.operateTime && item.operateTime.split(" ")[0].substring(5,item.operateTime.length-5)}}</text>
                </view>
                <view class="col-record-item-two">
                    <text>{{item?.operateTime && item.operateTime.split(" ")[1].substring(0,5)}}</text>
                    <text class="record-item-two-year">{{item?.operateTime && item.operateTime.split(" ")[0].split("-")[0]}}</text>
                </view>
                <view class="col-record-item-three" :class="{'record-end':index==listArr.length-1}">
                    <text class="record-item-three-point"></text>
                </view>
                <view class="col-record-item-four">
                    <text>{{handleOperator(item.operator)}}：</text>{{item.operation}}
                </view>
            </view>
        </view>
        <view class="record-load" v-else>
            <view class="record-load-img"><image class="empty-load-img" src="../../static/image/process/empty.png" alt="暂无数据" /></view>
            <view>暂无相关数据</view>
        </view>
    </view>
</template>

<script setup lang="ts">
    import {onMounted, ref} from 'vue'
    import service from "../na-utils/service";
    import {ConvertKey} from "../na-utils/format";
    const props = defineProps({
        height:{//高度，值为-1时为100%
            type:Number,
            default:300
        },
        list:{
            type: Array,
            default(){
                return []
            }
        },
        /*
       * 重组的key格式，如
       * {
       *   nId:'nodeId',
       *   nCode:'nodeCode',
       *   nName:'nodeName',
       *   detail:'operation',
       *   date:'operateTime',
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
       *  operator:[
       *   userId:''
       *   userName:''
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
        token:{
            type:String,
            default:''
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

    let listArr = ref()


    onMounted(()=>{
        if(props.url !=''){
            getBpmRecordList()
        }else{
            listArr.value = props.list;
            if(!(Object.keys(props.initKey).length==0)){
                let newList = ConvertKey(listArr.value,props.initKey,props.childKey);
                listArr.value = newList;
            }
        }
    })

    const getBpmRecordList = () =>{
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

</script>

<style scoped>
    .node-col-record-box{
        width: 100%;
        padding: 10px;
        background: #FFFFFF;
        box-sizing: border-box;
        overflow: hidden;
        overflow-y: scroll;
    }
    .node-col-record-box::-webkit-scrollbar-track-piece {
        background-color: transparent;
    }
    .node-col-record-box::-webkit-scrollbar {
        width: 8px;
        height: 8px;
        background-color: transparent;
    }
    .node-col-record-box::-webkit-scrollbar-thumb {
        border-radius: 5px;
    }
    .node-col-record-box:hover::-webkit-scrollbar-thumb{
        background-color: hsla(220, 4%, 58%, .3);
    }
    .node-col-record-box:hover::-webkit-scrollbar-thumb{
        background-color: hsla(220, 4%, 58%, .3);
    }
    .col-record-content{
        margin-top: 20px;
        box-sizing: border-box;
    }
    .col-record-item{
        width: 100%;
        box-sizing: border-box;
        display: flex;
    }
    .col-record-item>view{
        flex: 1;
        font-size: 14px;
        font-weight: 400;
        text-align: left;
        color: #444444;
    }
    .col-record-item>view>text{
        display: inline-block;
    }
    .col-record-item-one{
        max-width: 50px;
    }
    .record-item-two-year{
        position: absolute;
        top: -20px;
        left: 0;
        color: #999999;
    }
    .col-record-item-two{
        max-width: 70px;
        position: relative;
    }
    .col-record-item-three{
        max-width:26px;
        border-left: 2px solid #808080;
        box-sizing: border-box;
        position: relative;
    }
    .col-record-item-four{
        padding:0 5px 30px;
        box-sizing: border-box;
    }
    .record-item-three-point{
        display: inline-block;
        width: 14px;
        height: 14px;
        background: #808080;
        border-radius: 50%;
        position: absolute;
        left: -8px;
    }
    .record-end{
        border-color: #FFFFFF;
    }
    .record-load{
        text-align: center;
        color: #888888;
        font-size: 14px;
        padding-top:5%;
        box-sizing: border-box;
    }
    .record-load-img .empty-load-img{
        display: inline-block;
        max-width: 100px;
        max-height: 60px;
        background-size: cover;
    }
</style>
