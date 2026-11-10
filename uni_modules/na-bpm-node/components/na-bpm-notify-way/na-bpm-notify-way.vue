<template>
    <div class="reject-popup-user">
        <div class="reject-popup-user-l">通知方式<text>*</text></div>
        <div class="reject-popup-user-r">
            <div class="init-notify-box">
                <checkbox-group @change="changeCheckbox">
                    <label v-for="(item,index) in list" :key="index" :class="`group-${props.mode}`">
                        <checkbox :value="item.value" :checked="item.checked" :disabled="item.disabled" style="transform:scale(0.7)" :color="props.color" />
                        <text>{{item.text}}</text>
                    </label>
                </checkbox-group>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref} from 'vue'
    import {ConvertKey,ConvertObj} from "../na-utils/format";
    import service from "../na-utils/service";

    const props = defineProps({
        color:{
            type: String,
            default: '#0badf9',
        },
        mode:{//排版方式，level:水平,vertical:垂直
            type: String,
            default: 'level'
        },
        data:{
            type: Array,
            default(){
                return []
            }
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
    let result = ref()

    onMounted(()=>{
        if(props.url !=''){
            getCheckboxList()
        }else{
            list.value = props.list;
            if(!(Object.keys(props.initKey).length==0)){
                let newList = ConvertKey(list.value,props.initKey);
                list.value = newList;
            }
        }
        result.value = props?.data || [];
        if(result.value.length>0){
            let items: any[] = [];
            list.value.length>0 && list.value.map((item: any)=>{
                item.checked = false;
                if(result.value.length>0 && result.value.includes(item.value)){
                    item.checked = true;
                    items.push(item)
                }
            })
            if(props.onChange){
                props.onChange(result.value,items);
            }
        }
    })

    const getCheckboxList = () =>{
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

    const changeCheckbox = (evt: any) =>{
        let values = evt.detail.value;
        let items: any[] = [];
        let lists = list.value;
        for (let i = 0; i < lists.length; i++){
            const item = lists[i];
            if(values.includes(item.value)){
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
</script>

<style lang="scss" scoped>
    @import "../../static/css/process";
    .group-level{
        display: inline-block;
    }
    .group-vertical{
        display: block;
    }
</style>
