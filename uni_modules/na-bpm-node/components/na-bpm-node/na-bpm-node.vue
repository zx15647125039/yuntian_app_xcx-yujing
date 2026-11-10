<template>
    <!--流程节点组件-->
    <view class="node-row-list-box">
        <view class="node-row-list-main">
            <view class="row-list-content" v-if="listArr?.length>0">
                <view class="row-list-item" v-for="(item,index) in listArr" :key="index" :class="handleBtnClass(item,index)">
                    <view class="list-item-one">
                        <text>{{item?.nodeName ? item.nodeName:`节点${index+1}`}}</text>
                    </view>
                    <view class="list-item-two">
                        <text></text>
                        <view></view>
                    </view>
                    <view class="list-item-three">
                        <view class="item-three-box" v-if="item?.operator?.length>0">
                            <text class="three-box-text three-box-one">{{item.operator[0]?.userName && item.operator[0].userName.substring(item.operator[0]?.userName.length-2)}}</text>
                            <text class="three-box-text three-box-tow">{{item.operator[0]?.userName}}</text>
                            <image class="three-box-img" :src="handleBtnImg(item)" />
                            <text class="three-box-three" style="width:35px" v-if="item?.operator.length>1" @click="doShowUserList">...</text>
                            <view class="three-box-tow-user" v-if="item.operator.length>1" v-show="showUserList">
                                <view v-for="(uitem,uindex) in item.operator" :key="uindex">
                                    <view class="item-three-box" style="" v-if="uindex>=1">
                                        <text class="three-box-one">{{uitem?.userName && uitem.userName.substring(uitem.userName.length-2)}}</text>
                                        <image v-if="uitem.userIcon" class="three-box-one-user" :src="uitem.userIcon" :alt="uitem.userName" />
                                        <text v-else class="three-box-tow">{{uitem.userName}}</text>
                                        <text class="three-box-three"></text>
                                        <image class="three-box-img" :src="handleBtnImg(uitem)" />
                                    </view>
                                </view>
                            </view>
                            <text v-else class="three-box-three"></text>
                        </view>
                    </view>
                    <view class="list-item-line"></view>
                </view>
                <view class="row-list-item" style="min-width:60px;max-width:60px;"></view>
            </view>
            <view class="list-content-empty" v-else>
                <view class="list-load-img"><image class="load-img-empty" src="../../static/image/process/empty.png" alt="暂无数据" /></view>
                <view>暂无相关数据</view>
            </view>
        </view>
    </view>
</template>

<script setup lang="ts">
    import {ref, reactive, computed, onMounted} from "vue";
    import { ConvertKey } from "../na-utils/format";
    import service from "../na-utils/service";

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
        *   aCode:'actionCode',
        *   aName:'actionName',
        *   user:'operator',
        *   //operator下自定义的key
        *   children:{
        *       uId:'userId'
        *       uName:'userName',
        *       uIcon:'userIcon',
        *       aCode:'actionCode',
        *       aName:'actionName'
        *   }
        * }
        * 标准key--{
        *  nodeId:'',
        *  nodeCode:'',
        *  nodeName:'',
        *  operator:[
        *   userId:''
        *   userName:'',
        *   userIcon:'',
        *   actionCode:'',
        *   actionName:''
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
        args:{//接口自定义参数
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

    let loading = ref(false)
    let showUserList = ref(false)
    let listArr = ref()

    onMounted(()=>{
        if(props.url !=''){
            getBpmNodeList()
        }else{
            listArr.value = props.list;
            if(!(Object.keys(props.initKey).length==0)){
                let newList = ConvertKey(listArr.value,props.initKey,props.childKey);
                listArr.value = newList;
            }
        }
    })

    const getBpmNodeList = () =>{
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


    const handleBtnImg = computed(() => (item: any) => {
        /**
         * @param name // 文件名 如 home-bg.png
         * @returns {*|string}
         */
        let path = '';
        const modules = import.meta.globEager('/src/uni_modules/na-bpm-node/static/image/process/*')
        if(item.actionCode){
            if(item.actionCode==props.initCode['reject'] || item.actionCode==props.initCode['abandon']){
                path = `/src/uni_modules/na-bpm-node/static/image/process/card-revert.png`;
                return modules[path].default;
            }else if(item.actionCode=='active'){
                path = ``;
                return path;
            }else{
                path = `/src/uni_modules/na-bpm-node/static/image/process/card-submit.png`;
                return modules[path].default;
            }
        }
    })

    const handleBtnClass = (item: any, index: number) =>{
        let initClass = '';
        switch (item.actionCode) {
            case props.initCode['active']:
                initClass = 'item-active';
                break;
            case props.initCode['reject']:
            case props.initCode['abandon']:
                initClass = 'item-end'
                break;
            default:
        }
        if(index<1){
            initClass = 'item-start';
        }
        return initClass;
    }

    const doShowUserList = () =>{
        showUserList.value = !showUserList.value;
    }

</script>

<style lang="scss" scoped>
    .node-row-list-box{
        width: 100%;
        height: auto;
        overflow-x: scroll;
        box-sizing: border-box;
    }

    .node-row-list-box::-webkit-scrollbar-track-piece {
        background-color: transparent;
    }
    .node-row-list-box::-webkit-scrollbar {
        width: 8px;
        height: 8px;
        background-color: transparent;
    }
    .node-row-list-box::-webkit-scrollbar-thumb {
        border-radius: 5px;
    }
    .node-row-list-box:hover::-webkit-scrollbar-thumb{
        background-color: hsla(220, 4%, 58%, .3);
    }
    .node-row-list-main{
        min-width: 300px;
    }
    .row-list-content{
        width: 100%;
        padding: 0 0 3px;
        box-sizing: border-box;
        display: flex;
    }
    .row-list-item{
        flex: 1;
        position: relative;
        text-align: right;
        min-width: 180px;
    }
    .list-item-line{
        width: 50px;
        height: 10px;
        border-bottom: 2px dashed #00bd96;
        box-sizing: border-box;
        position: absolute;
        left: -52px;
        top: 25px;
    }
    .list-item-one{
        font-size: 14px;
        font-weight: 400;
        color: #00bd96;
        padding-right: 40px;
        height: 20px;
        overflow: hidden;
    }
    .list-item-one>text{
        display: inline-block;
        vertical-align: middle;
        line-height: 20px;
    }
    .list-item-two{
        position: relative;
        box-sizing: border-box;
        padding-right: 50px;
        margin: 5px 0 12px;
        box-sizing: border-box;
    }
    .list-item-two>text{
        display: inline-block;
        width: 12px;
        height: 12px;
        background: #00bd96;
        border-radius: 50%;
        position: absolute;
        top: 3px;
        right: 50px;
        z-index: 5;
    }
    .list-item-two>view{
        width: 100%;
        height: 10px;
        border-bottom: 2px dashed #00bd96;
        box-sizing: border-box;
    }
    .item-three-box{
        display: inline-block;
        height: 30px;
        background: #ffffff;
        border-radius: 15px;
        box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.16);
        position: relative;
    }
    .item-three-box .three-box-text,.item-three-box .three-box-img{
        vertical-align: middle;
    }
    .three-box-one{
        display: inline-block;
        width: 30px;
        height: 30px;
        background: #0badf9;
        border-radius: 50%;
        box-shadow: 0px 0px 6px 0px rgba(0,0,0,0.16);
        font-size: 12px;
        line-height: 30px;
        color: #FFFFFF;
        text-align: center;
        overflow: hidden;
    }
    .three-box-one-user{
        display: inline-block;
        width: 30px;
        height: 30px;
        background-size: cover;
        border-radius: 50%;
        margin: 0;
        padding: 0;
    }
    .three-box-tow{
        display: inline-block;
        height: 30px;
        line-height: 30px;
        padding: 0 10px;
        font-size: 14px;
        font-weight: 400;
        color: #444444;
        max-width: 80px;
        overflow: hidden;
        text-overflow:ellipsis;
        white-space: nowrap;
    }
    .three-box-three{
        display: inline-block;
        width: 12px;
        font-weight: bolder;
        cursor: pointer;
        color: #444444;
        text-align: left;
    }
    .three-box-img{
        display: inline-block;
        position: absolute;
        right: -13px;
        width: 32px;
        height: 32px;
        background-size: cover;
    }
    /*************************/
    .item-start{
        max-width: 180px;
    }
    .item-start .list-item-two>view,.item-start .list-item-line{
        border-bottom-color: transparent;
    }
    .item-active .list-item-two>view,.item-active .list-item-line{
        border-bottom-color: #FF9F00;
    }
    .item-active .list-item-one{
        color: #FF9F00;
    }
    .item-active .list-item-two>text{
        background: #FF9F00;
    }
    .item-end .list-item-two>view,.item-end .list-item-line{
        border-bottom-color: #E64340;
    }
    .item-end .list-item-one{
        color: #E64340;
    }
    .item-end .list-item-two>text{
        background: #E64340;
    }
    .list-content-empty{
        width: 100%;
        color: #888888;
        font-size: 12px;
        text-align: center;
    }
    .list-content-empty>view{
        margin: 0;
        padding: 0;
        line-height: 24px;
    }
    .list-load-img .load-img-empty{
        display: inline-block;
        max-width: 100px;
        max-height: 60px;
        background-size: cover;
    }
    .three-box-tow-user{
        background: #FFFFFF;
        margin-top: 3px;
        padding: 10px;
        border-radius: 5px;
        box-shadow: 0px 1px 6px rgba(0,0,0,0.16);
        box-sizing: border-box;
        overflow: hidden;
    }
</style>
