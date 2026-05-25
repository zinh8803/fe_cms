<script setup lang="ts">
import { onMounted } from 'vue';
import ToastContainer from './components/ToastContainer.vue';
import { useConfigStore } from './store/config';

const configStore = useConfigStore();

onMounted(() => {
  document.documentElement.setAttribute('data-theme', configStore.theme);
});
</script>

<template>
  <router-view />
  <ToastContainer />
</template>

