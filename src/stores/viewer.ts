import { defineStore } from 'pinia'
import { ref } from 'vue'

export const useViewerStore = defineStore('viewer', () => {
  const isReady = ref(false)

  function setReady(ready: boolean) {
    isReady.value = ready
  }

  return { isReady, setReady }
})
