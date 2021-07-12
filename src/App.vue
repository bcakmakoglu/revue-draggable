<template>
  <Draggable>
    <div class="box">Drag me!</div>
  </Draggable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Draggable from './lib/Draggable';

export default defineComponent({
  name: 'App',
  components: {
    Draggable
  }
});
</script>

<style>
.revue-draggable {
  cursor: move;
}
.box {
  background: #fff;
  border: 1px solid #999;
  border-radius: 3px;
  width: 180px;
  height: 180px;
  margin: 10px;
  padding: 10px;
  float: left;
}
</style>
