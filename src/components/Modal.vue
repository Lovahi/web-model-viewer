<template>
  <Transition name="fade">
    <div v-if="visible" class="modal-overlay" :class="{ interactive: interactive, error: error }">
      <div class="modal-card">
        <slot></slot>
      </div>
    </div>
  </Transition>
</template>

<script setup lang="ts">
defineProps<{
  visible: boolean
  interactive?: boolean
  error?: boolean
}>()
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  inset: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.75); /* más limpio que el blur */
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 50;
}

.modal-card {
  text-align: center;
  color: white;
  font-family: 'Inter', sans-serif;
  background-color: #2c2c2c;
  padding: 3rem 4rem;
  border-radius: 16px;
  border: 2px dashed #646cff;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 1rem;
  transform: scale(1);
  transition: transform 0.3s ease;
}

/* Estado de error */
.modal-overlay.error .modal-card {
  border-color: #ef4444;
  background-color: #1f1f1f;
}

/* Animaciones */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.fade-enter-active .modal-card {
  animation: popIn 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275);
}

.fade-leave-active .modal-card {
  animation: popIn 0.2s reverse ease-in;
}

@keyframes popIn {
  from {
    transform: scale(0.8);
    opacity: 0;
  }
  to {
    transform: scale(1);
    opacity: 1;
  }
}
</style>
