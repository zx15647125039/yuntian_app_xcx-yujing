<template>
    <uni-popup ref="uniPopupRef" type="dialog">
        <uni-popup-dialog ref="uniPopupDialogRef"  mode="base" title="流程审批"
                          :style="{width:props.width>0?`${props.width}px`:'300px'}"
                          @confirm="confirmPopup" @close="cancelPopup">
            <template #default>
                <view class="init-popup-box" :style="{height:props.height>0?`${props.height}px`:'100%',padding:0}">
                    <view><span>审批{{props.title}}意见</span></view>
                    <view class="init-popup-input" style="border:0;padding:0;">
                        <uni-easyinput type="textarea" v-model="inputPopup" :placeholder="`输入审批${title}意见...`" />
                    </view>
                    <slot />
                </view>
            </template>
        </uni-popup-dialog>
    </uni-popup>
</template>


<script setup lang="ts">
    import { ref, defineExpose,onMounted } from 'vue'

    const props = defineProps({
        title:{
            type:String,
            default:'同意'
        },
        height:{//高度，值为-1时为100%
            type:Number,
            default:300
        },
        width:{//宽度，值为-1时为100%
            type:Number,
            default:300
        },
        onClose:{
            type: Function,
            default() {
                return Promise.resolve()
            }
        }
    })

    let inputPopup = ref('')

    let uniPopupRef = ref()

    onMounted(()=>{

    })

    const openPopup = () =>{
        uniPopupRef.value.open()
        inputPopup.value = '';
    }

    const cancelPopup = () =>{
        if(props.onClose){
            props.onClose(inputPopup.value,false)
        }
    }

    const confirmPopup = () =>{
        if(props.onClose){
            props.onClose(inputPopup.value,true)
        }
    }

    defineExpose({
        inputPopup,
        openPopup,
        cancelPopup,
        confirmPopup
    })

</script>

<style lang="scss" scoped>
@import "../../static/css/process";
</style>
