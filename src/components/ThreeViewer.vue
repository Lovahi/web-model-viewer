<template>
  <div
    ref="container"
    class="viewer-container"
    @dragover.prevent="onDragOver"
    @dragleave.prevent="onDragLeave"
    @drop.prevent="onDrop"
  >
    <Modal :visible="isDragging">
      <i class="pi pi-upload drop-icon"></i>
      <p class="drop-text">{{ $t('drop.message') }}</p>
    </Modal>

    <Modal :visible="messageModalVisible" interactive error>
      <i class="pi pi-exclamation-triangle message-icon"></i>
      <div class="message-content">
        <p v-for="(msg, index) in messages" :key="index">{{ msg }}</p>
      </div>
      <button class="close-btn" @click="closeMessageModal">OK</button>
    </Modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, onBeforeUnmount, ref } from 'vue'
import { useI18n } from 'vue-i18n'
import { Viewer } from '@/core/Viewer'
import Modal from './Modal.vue'

const { t } = useI18n()

const container = ref<HTMLDivElement | null>(null)
const isDragging = ref(false)
const messageModalVisible = ref(false)
const messages = ref<string[]>([])
let viewer: Viewer | null = null

const closeMessageModal = () => {
  messageModalVisible.value = false
  messages.value = []
}

const onDragOver = (e: DragEvent) => {
  isDragging.value = true
}

const onDragLeave = (e: DragEvent) => {
  // Check if we are really leaving the window
  if (e.currentTarget && (e.currentTarget as HTMLElement).contains(e.relatedTarget as Node)) {
    return
  }
  isDragging.value = false
}

const onDrop = async (e: DragEvent) => {
  isDragging.value = false
  if (e.dataTransfer && e.dataTransfer.items) {
    const items = Array.from(e.dataTransfer.items)
    const files: File[] = []

    const scanEntry = (entry: any): Promise<void> => {
      return new Promise((resolve) => {
        if (entry.isFile) {
          entry.file((file: File) => {
            files.push(file)
            resolve()
          })
        } else if (entry.isDirectory) {
          const dirReader = entry.createReader()
          const readEntries = () => {
            dirReader.readEntries(async (entries: any[]) => {
              if (entries.length === 0) {
                resolve()
              } else {
                await Promise.all(entries.map(scanEntry))
                readEntries() // Continue reading
              }
            })
          }
          readEntries()
        } else {
          resolve()
        }
      })
    }

    await Promise.all(
      items.map((item) => {
        const entry = item.webkitGetAsEntry ? item.webkitGetAsEntry() : null
        return entry ? scanEntry(entry) : Promise.resolve()
      }),
    )

    if (viewer && files.length > 0) {
      const missingTextures = new Set<string>()

      await viewer.loadModelFromFiles(files, {
        onTextureMissing: (filename) => {
          missingTextures.add(filename)
        },
        onError: (error) => {
          messages.value.push(t('error.generic', { error: error.message || error }))
          messageModalVisible.value = true
        },
      })

      if (missingTextures.size > 0) {
        // Show summarized missing textures message
        const filenames = Array.from(missingTextures).join(', ')
        messages.value.push(t('error.textures_missing', { filenames }))
        messageModalVisible.value = true
      }
    }
  } else if (e.dataTransfer && e.dataTransfer.files.length > 0) {
    // Fallback for browsers without proper items/entry support
    if (viewer) {
      const missingTextures = new Set<string>()

      await viewer.loadModelFromFiles(e.dataTransfer.files, {
        onTextureMissing: (filename) => {
          missingTextures.add(filename)
        },
        onError: (error) => {
          messages.value.push(t('error.generic', { error: error.message || error }))
          messageModalVisible.value = true
        },
      })

      if (missingTextures.size > 0) {
        const filenames = Array.from(missingTextures).join(', ')
        messages.value.push(t('error.textures_missing', { filenames }))
        messageModalVisible.value = true
      }
    }
  }
}

onMounted(() => {
  if (container.value) {
    viewer = new Viewer(container.value)
  }
})

onBeforeUnmount(() => {
  if (viewer) {
    viewer.dispose()
    viewer = null
  }
})
</script>

<style scoped>
.viewer-container {
  width: 100%;
  height: 100%;
  position: absolute;
  top: 0;
  left: 0;
  background-color: #212121;
}

.drop-icon {
  font-size: 4rem;
  color: #646cff;
}

.drop-text {
  font-size: 1.5rem;
  font-weight: 500;
  margin: 0;
}

.message-icon {
  font-size: 3rem;
  color: #ef4444; /* Red error color */
}

.message-content {
  color: #e5e5e5;
  font-size: 1rem;
  max-width: 300px;
}

.close-btn {
  margin-top: 1rem;
  padding: 0.5rem 1.5rem;
  background-color: #646cff;
  color: white;
  border: none;
  border-radius: 8px;
  cursor: pointer;
  font-size: 1rem;
  transition: background-color 0.2s;
}

.close-btn:hover {
  background-color: #535bf2;
}
</style>
