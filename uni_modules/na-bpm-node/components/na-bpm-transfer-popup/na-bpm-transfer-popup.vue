<template>
    <naBpmPublicPopup :title="'转办'">
        <template #default>
            <naBpmUserSource :title="'转办'" />
        </template>
    </naBpmPublicPopup>
</template>


<script setup lang="ts">
    import naBpmPublicPopup from '../na-bpm-public-popup/na-bpm-public-popup.vue'
    import naBpmUserSource from '../na-bpm-user-source/na-bpm-user-source.vue'
</script>

<style lang="scss" scoped>

</style>
