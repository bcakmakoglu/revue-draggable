<template>
  <Draggable>
    <div>Drag me!</div>
  </Draggable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Draggable from './lib/Draggable';
import RevueDraggable from './lib/RevueDraggable.vue';
import SimpleDrag from './lib/SimpleDrag';

export default defineComponent({
  name: 'App',
  components: {
    Draggable,
    RevueDraggable,
    SimpleDrag
  }
});
</script>

<style>
.revue-draggable {
  cursor: move;
}
</style>
