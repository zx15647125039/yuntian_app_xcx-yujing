<template>
    <naBpmPublicPopup :title="'驳回'">
        <template #default>
            <div class="reject-popup-user">
                <div class="reject-popup-user-l">{{title}}至<text>*</text></div>
                <div class="reject-popup-user-r">
                    <radio-group @change="changeRadio">
                        <view v-for="(item, index) in list" :key="index">
                            <label>
                                <radio style="transform:scale(0.7)" :color="props.color" :disabled="props.disabled" :value="item.value" :checked="item.value === result"/>
                                <text>{{item.text}}</text>
                            </label>
                        </view>
                    </radio-group>
                </div>
            </div>
        </template>
    </naBpmPublicPopup>
</template>


<script setup lang="ts">
    import naBpmPublicPopup from '../na-bpm-public-popup/na-bpm-public-popup.vue'
    import { onMounted, ref} from 'vue'
    import {ConvertKey,ConvertObj} from "../na-utils/format";
    import service from "../na-utils/service";

    const props = defineProps({
        title:{
            type:String,
            default:'驳回'
        },
        data:{
            type: [String,Number],
            default: '',
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
        *   id:'value',
        *   name:'text'
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
        color:{
            type: String,
            default: '#0badf9',
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

    let list = ref()
    let result = ref( )

    onMounted(()=>{
        if(props.url !=''){
            getRadioList()
        }else{
            list.value = props.list;
            if(!(Object.keys(props.initKey).length==0)){
                let newList = ConvertKey(list.value,props.initKey);
                list.value = newList;
            }
        }
        result.value = props?.data;
    })

    const getRadioList = () =>{
        service({
            url:props.url,
            method:props.way,
            data:props.args,
        }).then((res:any)=>{
            if(res?.length>0){
                list.value = res;
                if(!(Object.keys(props.initKey).length==0)){
                    let newList = ConvertKey(res,props.initKey);
                    list.value = newList;
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

    interface radioItem{
        value:string | number,
        text:string
    }

    const changeRadio = (evt: any) =>{
        let item:radioItem = {
            value:'',
            text:''
        };
        let lists = list.value;
        for (let i = 0; i < lists.length; i++) {
            if(lists[i].value == evt.detail.value){
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
            props.onChange(item.value,newItem)
        }
    }

</script>

<style lang="scss" scoped>
    @import "../../static/css/process";
</style>
