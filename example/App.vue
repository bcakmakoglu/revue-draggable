<template>
  <h1>Revue Draggable</h1>
  <p>Active DragHandlers: {{ activeDrags }}</p>
  <p>
    <a href="https://github.com/bcakmakoglu/revue-draggable">Github</a>
  </p>
  <div class="box" v-draggable @drag-start="onStart" @drag-stop="onStop">I can be dragged anywhere</div>
  <div class="box cursor-x" v-draggable="{ axis: 'x' }" @drag-start="onStart" @drag-stop="onStop">
    I can only be dragged horizonally (x axis)
  </div>
  <div class="box cursor-y" v-draggable="{ axis: 'y' }" @drag-start="onStart" @drag-stop="onStop">
    I can only be dragged vertically (y axis)
  </div>
  <div class="box" v-draggable="{ update: false }">I don't want to be dragged</div>
  <div class="box" v-draggable @drag-move="handleDrag" @drag-start="onStart" @drag-stop="onStop">
    <div>I track my deltas</div>
    <div>x: {{ deltaPosition.x.toFixed(0) }}, y: {{ deltaPosition.y.toFixed(0) }}</div>
  </div>
  <div class="box no-cursor" v-draggable="{ handle: 'strong' }" @drag-start="onStart" @drag-stop="onStop">
    <strong class="cursor">
      <div>Drag here</div>
    </strong>
    <div>You must click my handle to drag me</div>
  </div>
  <div
    class="box no-cursor"
    style="display: flex; flex-direction: column"
    v-draggable="{ handle: 'strong' }"
    @drag-start="onStart"
    @drag-stop="onStop"
  >
    <strong class="cursor">
      <div>Drag here</div>
    </strong>
    <div style="overflow: scroll">
      <div style="background: yellow; white-space: pre-wrap">
        I have long scrollable content with a handle
        {{ '\n' + Array(40).fill('x').join('\n') }}
      </div>
    </div>
  </div>
  <div class="box" v-draggable="{ cancel: 'strong' }" @drag-start="onStart" @drag-stop="onStop">
    <strong class="no-cursor">Can't drag here</strong>
    <div>Dragging here works</div>
  </div>
  <div class="box" v-draggable="{ grid: [25, 25] }" @drag-start="onStart" @drag-stop="onStop">I snap to a 25 x 25 grid</div>
  <div class="box" v-draggable="{ grid: [50, 50] }" @drag-start="onStart" @drag-stop="onStop">I snap to a 50 x 50 grid</div>
  <div
    class="box"
    v-draggable="{ position: controlledPosition }"
    @drag-start="onStart"
    @drag-stop="onStop"
    @drag-move="onControlledDrag"
  >
    My position can be changed programmatically. <br />
    I have a drag handler to sync state.
    <div>
      <a href="#" @click="adjustXPos">Adjust x ({{ controlledPosition.x }})</a>
    </div>
    <div>
      <a href="#" @click="adjustYPos">Adjust y ({{ controlledPosition.y }})</a>
    </div>
  </div>
  <div class="box" v-draggable="{ position: controlledPosition }" @drag-start="onStart" @drag-stop="onControlledDragStop">
    My position can be changed programmatically. <br />
    I have a dragStop handler to sync state.
    <div>
      <a href="#" @click="adjustXPos">Adjust x ({{ controlledPosition.x }})</a>
    </div>
    <div>
      <a href="#" @click="adjustYPos">Adjust y ({{ controlledPosition.y }})</a>
    </div>
  </div>
  <div
    :transform="translateTransformToRem(transform, 16)"
    class="box rem-position-fix"
    style="position: absolute; bottom: 6.25rem; right: 18rem"
    v-draggable
    @drag-start="onStart"
    @drag-stop="onStop"
  >
    I use <span style="font-weight: 700">rem</span> instead of <span style="font-weight: 700">px</span> for my transforms. I also
    have absolute positioning.

    <br /><br />
    I depend on a CSS hack to avoid double absolute positioning.
  </div>
  <ExampleComponent v-draggable @drag-start="onStart" @drag-stop="onStop">
    <span>I'm a component slot</span>
  </ExampleComponent>
  <Draggable @drag-start="onStart" @drag-stop="onStop">
    <div class="box">I use a custom made Draggable Component using composable hooks.</div>
  </Draggable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import ExampleComponent from './ExampleComponent.vue';
import Draggable from './Draggable';

export default defineComponent({
  name: 'App',
  components: { ExampleComponent, Draggable },
  data() {
    return {
      transform: 'translate(0rem, 0rem)',
      activeDrags: 0,
      deltaPosition: {
        x: 0,
        y: 0
      },
      controlledPosition: {
        x: 0,
        y: 0
      }
    };
  },
  methods: {
    handleDrag(e) {
      const { x, y } = this.deltaPosition;
      this.deltaPosition = {
        x: x + e.detail.deltaX,
        y: y + e.detail.deltaY
      };
    },
    onStart() {
      this.activeDrags++;
    },
    onStop() {
      this.activeDrags--;
    },
    onDrop(e) {
      this.activeDrags--;
      // get the original event
      if (e.detail.event.target.classList.contains('drop-target')) {
        alert('Dropped!');
        e.detail.event.target.classList.remove('hovered');
      }
    },
    onDropAreaMouseEnter(e) {
      if (this.activeDrags) {
        e.target.classList.add('hovered');
      }
    },
    onDropAreaMouseLeave(e) {
      e.target.classList.remove('hovered');
    },
    // For controlled component
    adjustXPos(e) {
      e.preventDefault();
      e.stopPropagation();
      const { x, y } = this.controlledPosition;
      this.controlledPosition = { x: x - 10, y };
    },
    adjustYPos(e) {
      e.preventDefault();
      e.stopPropagation();
      const { x, y } = this.controlledPosition;
      this.controlledPosition = { x, y: y - 10 };
    },
    onControlledDrag(e) {
      const { x, y } = e.detail.data;
      this.controlledPosition.x = x;
      this.controlledPosition.y = y;
    },
    onControlledDragStop(e) {
      this.onControlledDrag(e);
      this.onStop();
    },
    translateTransformToRem(transform = 'translate(0rem, 0rem)', remBaseline = 16) {
      const convertedValues = transform
        .replace('translate(', '')
        .replace(')', '')
        .split(',')
        .map((px: string) => px.replace('px', ''))
        .map((px: string) => parseInt(px, 10) / remBaseline)
        .map((x: number) => `${x}rem`);
      const [x, y] = convertedValues;

      return (this.transform = `translate(${x}, ${y})`);
    },
    log(e) {
      console.log(e);
    }
  }
});
</script>

<style>
* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

body {
  color: #222;
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 200;
  margin: 0 50px;
}

.revue-draggable,
.cursor {
  cursor: move;
}

.no-cursor {
  cursor: auto;
}

.cursor-y {
  cursor: ns-resize;
}

.cursor-x {
  cursor: ew-resize;
}

.revue-draggable strong {
  background: #ddd;
  border: 1px solid #999;
  border-radius: 3px;
  display: block;
  margin-bottom: 10px;
  padding: 3px 5px;
  text-align: center;
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

.no-pointer-events {
  pointer-events: none;
}

.hovered {
  background-color: gray;
}

.rem-position-fix {
  position: static !important;
}
</style>
