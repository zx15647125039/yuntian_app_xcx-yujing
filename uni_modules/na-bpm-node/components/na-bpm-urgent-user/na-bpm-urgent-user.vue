<template>
    <view class="reject-popup-user">
        <view class="reject-popup-user-l" v-if="props.title">{{props.title}}至<text>*</text></view>
        <view class="reject-popup-user-r">
            <view class="popup-user-r-cont">
                <view class="user-r-cont-r" v-if="listArr?.length>0">
                    <view v-if="props?.multiple">
                        <checkbox-group @change="changeCheckbox">
                            <view class="reject-user-box" v-for="(item,index) in listArr" :key="index">
                                <view class="reject-user-cont">
                                    <label class="reject-user-item-t" style="display:block">
                                        <view class="reject-user-item-avagetext">
                                            <text>{{item.userName?item.userName.substring(item.userName.length-3):''}}</text>
                                        </view>
                                        <view class="user-delete-btn btn-no-bg">
                                            <checkbox :value="item.userId" :checked="item.checked" :disabled="item.disabled" style="transform:scale(0.7)" :color="props.color" />
                                        </view>
                                    </label>
                                    <view class="reject-user-item-b">{{item.userName}}</view>
                                </view>
                            </view>
                        </checkbox-group>
                    </view>
                    <view v-else>
                        <radio-group @change="changeRadio">
                            <view class="reject-user-box" v-for="(item,index) in listArr" :key="index">
                                <view class="reject-user-cont">
                                    <label class="reject-user-item-t" style="display:block">
                                        <view class="reject-user-item-avagetext">
                                            <text>{{item.userName?item.userName.substring(item.userName.length-3):''}}</text>
                                        </view>
                                        <view class="user-delete-btn btn-no-bg">
                                            <radio style="transform:scale(0.7)" :color="props.color" :disabled="item.disabled" :value="item.userId" :checked="item.userId === result"/>
                                        </view>
                                    </label>
                                    <view class="reject-user-item-b">{{item.userName}}</view>
                                </view>
                            </view>
                        </radio-group>
                    </view>
                </view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
    import { onMounted, ref} from 'vue'
    import {ConvertKey,ConvertObj} from "../na-utils/format";
    import service from "../na-utils/service";
    const props = defineProps({
        title:{
            type:String,
            default:'催办'
        },
        multiple:{
            type:Boolean,
            default:true
        },
        color:{
            type: String,
            default: '#ea0a2a',
        },
        data:{
            type: [String,Number,Array],
            default: null,
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
        result.value = props?.data;
        let items: any[] = [];
        listArr.value.length>0 && listArr.value.map((item: any)=>{
            if(props?.multiple){
                item.checked = false;
                if(result.value?.length>0 && result.value.includes(item.userId)){
                    item.checked = true;
                    items.push(item)
                }
            }else{
                if(item.userId == result.value){
                    items.push(item)
                }
            }
        })
        if(props.onChange){
            props.onChange(result.value,props?.multiple?items:items[0]);
        }
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

    const changeCheckbox = (evt: any) =>{
        let values = evt.detail.value;
        let items: any[] = [];
        let lists = listArr.value;
        for (let i = 0; i < lists.length; i++){
            const item = lists[i];
            if(values.includes(item.userId)){
                items.push(item);
            }
        }
        if(props.onChange){
            let newItem = items;
            if(!(Object.keys(props.initKey).length==0)){
                //操作数据后不改变原数据
                newItem = ConvertKey(JSON.parse(JSON.stringify(items)),ConvertObj(JSON.parse(JSON.stringify(props.initKey))));
            }
            props.onChange(values,newItem);
        }
    }

    interface radioItem{
        userId:string | number,
        userName:string
    }

    const changeRadio = (evt: any) =>{
        let item:radioItem = {
            userId:'',
            userName:''
        };
        let lists = listArr.value;
        for (let i = 0; i < lists.length; i++) {
            if(lists[i].userId == evt.detail.userId){
                item = lists[i];
                break;
            }
        }
        if(props.onChange){
            let newItem = item;
            if(!(Object.keys(props.initKey).length==0)){
                //操作数据后不改变原数据
                newItem = ConvertKey(JSON.parse(JSON.stringify([item])),ConvertObj(JSON.parse(JSON.stringify(props.initKey))))[0];
            }
            props.onChange(item.userId,newItem)
        }
    }

</script>

<style lang="scss" scoped>
    @import "../../static/css/process";
</style>
