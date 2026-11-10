<template>
    <naBpmPublicPopup :title="'催办'">
        <template #default>
            <naBpmNotifyWay />
            <naBpmUrgentUser :title="'催办'" />
        </template>
    </naBpmPublicPopup>
</template>

<script setup lang="ts">
    import naBpmPublicPopup from '../na-bpm-public-popup/na-bpm-public-popup.vue'
    import naBpmNotifyWay from '../na-bpm-notify-way/na-bpm-notify-way.vue'
    import naBpmUrgentUser from '../na-bpm-urgent-user/na-bpm-urgent-user.vue'
</script>

<style lang="scss" scoped>
@import "../../static/css/process";
</style>
