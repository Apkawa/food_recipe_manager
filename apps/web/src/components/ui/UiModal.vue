<script setup lang="ts">
// interface Props {
//   show: boolean
// }
import {ref} from "vue";

const modalShow = defineModel<boolean>({required: true, default: false})
const modalEl = ref<HTMLElement|null>(null);
const onClickOverlay = (e: Event) => {
  const el = e.target as HTMLElement
  if (el == modalEl.value) {
    modalShow.value = false
  }
}

</script>

<template>
  <div ref="modalEl" class="modal modal-overlay" v-if="modalShow" @click="onClickOverlay">
    <div class="modal-content">
      <slot></slot>
    </div>
  </div>

</template>

<style scoped>
.modal {
  position: fixed;
  /*todo запрет скроллинга body.modal-open {overflow-y: hidden }*/
  overflow-y: hidden;
  top: 0;
  left: 0;


  width: 100vw;
  height: 100vh;
  background: rgb(127, 127, 127, 0.4);

  display: flex;
  align-items: center;
  justify-content: center;
}

.modal .modal-content {
  text-align: center;
  width: 100vw;
  max-width: 640px;
}
</style>