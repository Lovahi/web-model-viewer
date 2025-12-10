<script setup lang="ts">
import ThreeScene from './components/ThreeViewer.vue'
</script>

<template>
  <ThreeScene />
</template>

<style>
html,
body,
#app {
  margin: 0;
  padding: 0;
  width: 100%;
  height: 100%;
  overflow: hidden;
  user-select: none;
}

main {
  width: 100%;
  height: 100%;
}
</style>
