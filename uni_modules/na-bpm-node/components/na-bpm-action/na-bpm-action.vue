<template>
    <view class="node-row-action-box" v-if="listArr?.length>0">
            <view class="node-row-action-content" v-for="(item,index) in listArr" :key="index">
                <button class="action-box-item" v-if="index<props.number" :class="handleBtnClass(item)" @click="handleBtnAction(item)">
                    <image class="box-item-img" :src="handleBtnImg(item)" :alt="item.actionName" />
                    <text>{{item.actionName}}</text>
                </button>
                <button v-if="showElseAction && listArr.length>props.number && index>(props.number-1)" class="action-box-item" :class="handleBtnClass(item)" @click="handleBtnAction(item)">
                    <image class="box-item-img" :src="handleBtnImg(item)" :alt="item.actionName" />
                    <text>{{item.actionName}}</text>
                </button>
            </view>
            <view class="action-box-more" v-if="props.more && listArr.length>props.number" @click="showAllAction">
                <text>{{showElseAction?'收起':'更多'}}</text>
                <image class="box-more-img" src="../../static/image/process/card-right.png" />
            </view>
    </view>
</template>

<script setup lang="ts">
    import {computed, onMounted, ref} from 'vue'
    import {ConvertKey} from "../na-utils/format";
    import service from "../na-utils/service";
    const props = defineProps({
        number:{
            type:Number,
            default:3
        },
        more:{
            type:Boolean,
            default:true
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
        *   aCode:'actionCode',
        *   aName:'actionName',
        *   aIcon:'actionIcon',
        *   color:'color'
        * }
        * 标准key--{
        *  nodeId:'节点唯一标识',
        *  nodeCode:'节点编码',
        *  nodeName:'节点名称',
        *  actionCode:'处理操作编码',
        *  actionName:'处理操作名称',
        *  actionIcon:'处理操作图标',
        *  color:'初始自定义文字颜色'
        * }
        * */
        initKey:{
            type: Object,
            default(){
                return {}
            }
        },
        token:{
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
        onHandle:{
            type: Function,
            default() {
                return Promise.resolve()
            }
        }
    })


    let listArr = ref()

    onMounted(()=>{
        if(props.url !=''){
            getBpmActionList()
        }else{
            listArr.value = props.list;
            if(!(Object.keys(props.initKey).length==0)){
                let newList = ConvertKey(listArr.value,props.initKey);
                listArr.value = newList;
            }
        }
    })

    const getBpmActionList = () =>{
        service({
            url:props.url,
            method:props.way,
            data:props.args,
            token:props.token
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


    const handleBtnClass = (item: any) =>{
        let initClass = '';
        if(item.color){
            initClass = `action-${item.color}`
        }else{
            initClass = `action-black`
        }
        return initClass;
    }

    const handleBtnImg = computed(() => (item: any) => {
        if(item?.actionIcon?.indexOf('http') !== -1 || item?.actionIcon?.indexOf('https') !== -1){
            return item.actionIcon;
        }else{
            /**
             * @param name // 文件名 如 home-bg.png
             * @returns {*|string}
             */
            let path = '';
            const modules = import.meta.globEager('/src/uni_modules/na-bpm-node/static/image/process/*')
            let iconList = ['abandon','approve','communicate','forward','reject','restart','send','submit','transfer','urgent'];
            if(item.actionCode){
                if(iconList.indexOf(item.actionCode)!=-1){
                    path = `/src/uni_modules/na-bpm-node/static/image/process/card-btn-${item.actionCode}.png`
                }else{
                    path = `/src/uni_modules/na-bpm-node/static/image/process/card-btn-submit.png`;
                }
                return modules[path].default;
            }else{
                return path;
            }
        }
    })

    let showElseAction = ref(false);

    const showAllAction = () =>{
        showElseAction.value = !showElseAction.value;
    }


    const handleBtnAction = (item: any) =>{
        if(props.onHandle){
            props.onHandle(item);
        }
    }



</script>

<style lang="scss" scoped>
    .node-row-action-box{
        width: 100%;
        padding-top: 8px;
        box-sizing: border-box;
        text-align: left;
    }
    .node-row-action-content{
        display: inline-block;
    }
    .action-box-item{
        display: inline-block;
        line-height: normal;
        padding: 5px 15px;
        border-radius: 17px;
        outline: none;
        background: #FFFFFF;
        border: 1px solid #cccccc;
        box-sizing: border-box;
        cursor: pointer;
        font-weight: 400;
        margin: 5px 5px;
        position:relative;
        overflow:hidden;
        font-size: 14px;
    }
    .action-box-item .box-item-img,.action-box-item text{
        display: inline-block;
        vertical-align: middle;
    }
    .action-box-item .box-item-img{
        width: 14px;
        height: 14px;
        background-size: cover;
        margin-right: 5px;
        position:relative;
        filter: drop-shadow(100px 0 #FFFFFF);
        -webkit-filter: drop-shadow(100px 0 #FFFFFF);
    }
    .action-box-item:hover{
        color: #FFFFFF;
    }
    .action-box-item:hover .box-item-img{
        transform: translate(-100px, 0);
        -webkit-transform: translate(-100px, 0);
        -ms-transform: translate(-100px, 0);
        -o-transform: translate(-100px, 0);
    }
    .action-blue{
        border-color: #0BADF9;
        color: #0badf9;
    }
    .action-blue:hover{
        background: #0badf9;
    }
    .action-red{
        border-color: #E64340;
        color: #E64340;
    }
    .action-red:hover{
        background: #E64340;
    }
    .action-black{
        border-color: #444444;
    }
    .action-black:hover{
        background: #444444;
    }
    .action-box-more{
        margin: 0 0 0 10px;
        display: inline-block;
        outline: none;
        width: 40px;
        height: 40px;
        background: #ffffff;
        border: 1px solid #ffffff;
        border-radius: 50%;
        box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.16);
        cursor: pointer;
        font-size: 12px;
        font-weight: 400;
        color: #444444;
        overflow: hidden;
        text-align: center;
    }
    .action-box-more:hover{
        box-shadow: 0px 0px 6px 0px #0badf9;
    }
    .action-box-more .box-more-img,.action-box-more text{
        padding-top: 12px;
        display: inline-block;
        vertical-align: middle;
    }
    .action-box-more .box-more-img{
        width: 5px;
        height: 8px;
        background-size: cover;
        margin-left: 3px;
    }
    .action-box-else{
        display: inline-block;
        cursor: pointer;
        margin-left: 20px;
        box-sizing: border-box;
    }
    .action-box-else .box-else-img,.action-box-else>text{
        display: inline-block;
        vertical-align: middle;
        font-size: 14px;
        font-weight: 400;
        color: #444444;
    }
    .action-box-else .box-else-img{
        width: 20px;
        height: 3px;
        background-size: cover;
        padding: 0 5px;
        box-sizing: border-box;
    }
    .action-else-list{
        width: 100%;
        text-align: left;
    }
    .action-else-item{
        width: 100%;
        text-align: left;
        cursor: pointer;
        padding: 5px 0;
        box-sizing: border-box;
    }
    .action-else-item .else-item-img,.action-else-item>text{
        display: inline-block;
        vertical-align: middle;
        font-size: 14px;
        font-weight: 400;
        color: #444444;
    }
    .action-else-item .else-item-img{
        width: 14px;
        height: 14px;
        background-size: cover;
        margin-right: 10px;
        box-sizing: border-box;
        position:relative;
    }
    .action-else-item:hover{
        background: #c0e7fa;
    }
</style>
