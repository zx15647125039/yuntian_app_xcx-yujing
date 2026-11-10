<template>
    <view>
        <view class="appoint-user-box" v-if="listArr && listArr.length>0">
            <view class="appoint-user-item" v-for="(item,index) in listArr" :key="index">
                <view class="appoint-user-title">
                    <view class="user-node">{{item.nodeCode}}: {{item.nodeName}}</view>
                    <text class="user-select" @click="toSelectUser(item)">选择用户</text>
                </view>
                <view class="user-r-cont-r" v-if="item.operator && item.operator.length>0">
                    <view class="reject-user-box" v-for="(uitem,uindex) in item.operator" :key="uindex">
                        <view class="reject-user-cont">
                            <view class="reject-user-item-t">
                                <view class="reject-user-item-avagetext">
                                    <text>{{uitem.userName?uitem.userName.substring(uitem.userName.length-3):''}}</text>
                                </view>
                                <text class="user-delete-btn" @click="delSelectUser(index,uindex)">-</text>
                            </view>
                            <view class="reject-user-item-b">{{uitem.userName}}</view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
        <view class="list-content-empty" v-else>
            <view class="list-load-img"><image class="empty-img" src="../../static/image/process/empty.png" alt="暂无数据" /></view>
            <view class="empty-text">暂无相关数据</view>
        </view>
    </view>
</template>

<script setup lang="ts">
    import { onMounted, ref} from 'vue'
    import service from "../na-utils/service";
    import { ConvertKey } from "../na-utils/format";
    const props = defineProps({
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
        *   user:'operator',
        *   //operator下自定义的key
        *   children:{
        *       uId:'userId'
        *       uName:'userName'
        *   }
        * }
        * 标准key--{
        *  nodeId:'',
        *  nodeCode:'',
        *  nodeName:'',
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
        args:{
            type:Object,
            default:()=>{}
        },
        way:{//请求方式
            type:String,
            default:'post'
        },
        token:{
            type:String,
            default:''
        },
        onSelect:{
            type: Function,
            default() {
                return Promise.resolve()
            }
        },
        onChange:{
            type: Function,
            default() {
                return Promise.resolve()
            }
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
        }
    })

    let listArr = ref()

    onMounted(()=>{
        if(props.url !=''){
            getDataList()
        }else{
            listArr.value = props.list;
            if(!(Object.keys(props.initKey).length==0)){
                let newList = ConvertKey(listArr.value,props.initKey,props.childKey);
                listArr.value = newList;
            }
        }
    })

    const getDataList = () =>{
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

    const toSelectUser = (data: any) =>{//选择用户
        if(props.onSelect){
            props.onSelect(data)
        }
    }

    const delSelectUser = (index: any,uindex: number) =>{//删除用户
        let nData = listArr.value[index].operator;
        let uData = listArr.value[index].operator[uindex]
        nData.splice(nData.findIndex((lItem: any)=>lItem.userId==uData.userId),1)
        console.log(listArr.value);
        if(props.onChange){
            props.onChange(listArr.value)
        }
    }

</script>

<style lang="scss" scoped>
    @import "../../static/css/process";
    .appoint-user-box{
        width: 100%;
    }
    .appoint-user-title{
        width: 100%;
        text-align: left;
        padding:5px 8px 8px;
        box-sizing: border-box;
    }
    .appoint-user-title .user-node,.appoint-user-title .user-select{
        display: inline-block;
        font-style: normal;
        vertical-align: middle;
    }
    .appoint-user-title .user-select{
        margin: 0 8px;
        font-size: 14px;
        font-weight: bold;
        color: #0badf9;
        cursor: pointer;
    }
    .appoint-user-item{
        width: 100%;
    }
</style>
