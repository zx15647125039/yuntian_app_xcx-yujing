<template>
    <view class="reject-popup-user">
        <view class="reject-popup-user-l" v-if="props.title">{{props.title}}至<text>*</text></view>
        <view class="reject-popup-user-r">
            <view class="popup-user-r-cont">
                <view class="user-r-cont-l">
                    <view class="reject-add-btn" @click="handleSelect">
                        <text>+</text>
                    </view>
                </view>
                <view class="user-r-cont-r" v-if="listArr?.length>0">
                    <view class="reject-user-box" v-for="(item,index) in listArr" :key="index">
                        <view class="reject-user-cont">
                            <view class="reject-user-item-t">
                                <view class="reject-user-item-avagetext">
                                    <text>{{item.userName?item.userName.substring(item.userName.length-3):''}}</text>
                                </view>
                                <text class="user-delete-btn" @click="deleteSelect(item)">-</text>
                            </view>
                            <view class="reject-user-item-b">{{item.userName}}</view>
                        </view>
                    </view>
                </view>
            </view>
            <view class="popup-user-r-cont" v-if="result && result.value">
                <view class="user-r-cont-r">
                    <view class="reject-user-box" style="margin:0">
                        <view class="reject-user-cont">
                            <view class="reject-user-item-t">
                                <view class="reject-user-item-avagetext">
                                    <span>{{result.userName?result.userName.substring(result.userName.length-3):''}}</span>
                                </view>
                            </view>
                            <view class="reject-user-item-init">{{result.userName}}（原始节点人）</view>
                        </view>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
    import { onMounted, ref} from 'vue'
    import {ConvertKey, ConvertObj} from "../na-utils/format";
    import service from "../na-utils/service";

    const props = defineProps({
        title:{
            type:String,
            default:'转办'
        },
        list:{
            type:Array,
            default:()=>[]
        },
        data:{
            type:Object,
            default(){
                return {}
            }
        },
        /*
       * 重组的key格式，如
       * {
       *   id:'userId',
       *   name:'userName'
       * }
       * */
        initKey:{
            type: Object,
            default(){
                return {}
            }
        },
        url:{
            type: String,
            default: ''
        },
        way:{
            type: String,
            default: 'post'
        },
        args:{
            type: Object,
            default(){
                return {}
            }
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
    let result = ref()

    onMounted(()=>{
        if(props.url !=''){
            getDataList()
        }else{
            listArr.value = props.list;
            if(!(Object.keys(props.initKey).length==0)){
                let newList = ConvertKey(listArr.value,props.initKey);
                listArr.value = newList;
            }
        }
        result.value = props?.data || {};
    })

    const getDataList = () =>{
        service({
            url:props.url,
            method:props.way,
            data:props.args,
        }).then((res:any)=>{
            if(res?.length>0){
                listArr.value = res;
                if(!(Object.keys(props.initKey).length==0)){
                    let newList = ConvertKey(res,props.initKey);
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

    const deleteSelect = (item: object) =>{
        if(item?.userId){
            listArr.value.length>0 && listArr.value.splice(listArr.value.findIndex((lItem: any)=>lItem.userId==item.userId),1)
            if(props.onChange){
                let newItem = listArr.value;
                if(!(Object.keys(props.initKey).length==0)){
                    //操作数据后不改变原数据
                    newItem = ConvertKey(JSON.parse(JSON.stringify(newItem)),ConvertObj(JSON.parse(JSON.stringify(props.initKey))));
                }
                props.onChange(newItem)
            }
        }
    }

    const handleSelect = () =>{
        if(props.onSelect){
            let newItem = listArr.value;
            if(!(Object.keys(props.initKey).length==0)){
                //操作数据后不改变原数据
                newItem = ConvertKey(JSON.parse(JSON.stringify(newItem)),ConvertObj(JSON.parse(JSON.stringify(props.initKey))));
            }
            props.onSelect(newItem);
        }
    }


</script>

<style lang="scss" scoped>
    @import "../../static/css/process";
</style>
