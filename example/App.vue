<template>
  <h1>Revue Draggable</h1>
  <p>Active DragHandlers: {{ activeDrags }}</p>
  <p>
    <a href="https://github.com/bcakmakoglu/revue-draggable">Github</a>
  </p>
  <Draggable :on-start="onStart" :on-stop="onStop">
    <div class="box">I can be dragged anywhere</div>
  </Draggable>
  <Draggable axis="x" :on-start="onStart" :on-stop="onStop">
    <div class="box cursor-x">I can only be dragged horizonally (x axis)</div>
  </Draggable>
  <Draggable axis="y" :on-start="onStart" :on-stop="onStop">
    <div class="box cursor-y">I can only be dragged vertically (y axis)</div>
  </Draggable>
  <Draggable :onStart="() => false">
    <div class="box">I don't want to be dragged</div>
  </Draggable>
  <Draggable :on-drag="handleDrag" :on-start="onStart" :on-stop="onStop">
    <div class="box">
      <div>I track my deltas</div>
      <div>x: {{ deltaPosition.x.toFixed(0) }}, y: {{ deltaPosition.y.toFixed(0) }}</div>
    </div>
  </Draggable>
  <Draggable handle="strong" :on-start="onStart" :on-stop="onStop">
    <div class="box no-cursor">
      <strong class="cursor">
        <div>Drag here</div>
      </strong>
      <div>You must click my handle to drag me</div>
    </div>
  </Draggable>
  <Draggable handle="strong">
    <div class="box no-cursor" style="display: flex; flex-direction: column">
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
  </Draggable>
  <Draggable cancel="strong" :on-start="onStart" :on-stop="onStop">
    <div class="box">
      <strong class="no-cursor">Can't drag here</strong>
      <div>Dragging here works</div>
    </div>
  </Draggable>
  <Draggable :grid="[25, 25]" :on-start="onStart" :on-stop="onStop">
    <div class="box">I snap to a 25 x 25 grid</div>
  </Draggable>
  <Draggable :grid="[50, 50]" :on-start="onStart" :on-stop="onStop">
    <div class="box">I snap to a 50 x 50 grid</div>
  </Draggable>
  <Draggable :bounds="{ top: -100, left: -100, right: 100, bottom: 100 }" :on-start="onStart" :on-stop="onStop">
    <div class="box">I can only be moved 100px in any direction.</div>
  </Draggable>
  <Draggable :on-start="onStart" :on-stop="onStop">
    <div class="box drop-target" @mouseenter="onDropAreaMouseEnter" @mouseleave="onDropAreaMouseLeave">
      I can detect drops from the next box.
    </div>
  </Draggable>
  <Draggable :on-start="onStart" :on-stop="onDrop">
    <div :class="`box ${activeDrags ? 'no-pointer-events' : ''}`">I can be dropped onto another box.</div>
  </Draggable>
  <div class="box" style="height: 500px; width: 500px; position: relative; overflow: auto; padding: 0">
    <div style="height: 1000px; width: 1000px; padding: 10px">
      <Draggable bounds="parent" :on-start="onStart" :on-stop="onStop">
        <div class="box">
          I can only be moved within my offsetParent.<br /><br />
          Both parent padding and child margin work properly.
        </div>
      </Draggable>
      <Draggable bounds="parent" :on-start="onStart" :on-stop="onStop">
        <div class="box">
          I also can only be moved within my offsetParent.<br /><br />
          Both parent padding and child margin work properly.
        </div>
      </Draggable>
    </div>
  </div>
  <Draggable bounds="body" :on-start="onStart" :on-stop="onStop">
    <div class="box">I can only be moved within the confines of the body element.</div>
  </Draggable>
  <Draggable :on-start="onStart" :on-stop="onStop">
    <div class="box" style="position: absolute; bottom: 100px; right: 100px">I already have an absolute position.</div>
  </Draggable>
  <Draggable :default-position="{ x: 25, y: 25 }" :on-start="onStart" :on-stop="onStop">
    <div class="box">
      {{ "I have a default position of {x: 25, y: 25}, so I'm slightly offset." }}
    </div>
  </Draggable>
  <Draggable :position-offset="{ x: '-10%', y: '-10%' }" :on-start="onStart" :on-stop="onStop">
    <div class="box">
      {{ "I have a default position based on percents {x: '-10%', y: '-10%'}, so I'm slightly offset." }}
    </div>
  </Draggable>
  <Draggable :position="controlledPosition" :on-start="onStart" :on-stop="onStop" :on-drag="onControlledDrag">
    <div class="box">
      My position can be changed programmatically. <br />
      I have a drag handler to sync state.
      <div>
        <a href="#" @click="adjustXPos">Adjust x ({{ controlledPosition.x }})</a>
      </div>
      <div>
        <a href="#" @click="adjustYPos">Adjust y ({{ controlledPosition.y }})</a>
      </div>
    </div>
  </Draggable>
  <Draggable :position="controlledPosition" :on-start="onStart" :on-stop="onControlledDragStop">
    <div class="box">
      My position can be changed programmatically. <br />
      I have a dragStop handler to sync state.
      <div>
        <a href="#" @click="adjustXPos">Adjust x ({{ controlledPosition.x }})</a>
      </div>
      <div>
        <a href="#" @click="adjustYPos">Adjust y ({{ controlledPosition.y }})</a>
      </div>
    </div>
  </Draggable>
  <Draggable :on-start="onStart" :on-stop="onStop">
    <div
      :transform="translateTransformToRem(transform, 16)"
      class="box rem-position-fix"
      style="position: absolute; bottom: 6.25rem; right: 18rem"
    >
      I use <span style="font-weight: 700">rem</span> instead of <span style="font-weight: 700">px</span> for my transforms. I
      also have absolute positioning.

      <br /><br />
      I depend on a CSS hack to avoid double absolute positioning.
    </div>
  </Draggable>
  <div v-draggable="{ onStart, onStop }" class="box">I use a directive to make myself draggable</div>
  <Draggable :on-start="onStart" :on-stop="onStop">
    <ExampleComponent>
      <span>I'm a Vue component</span>
    </ExampleComponent>
  </Draggable>
  <Draggable @drag-start="onStart" @drag-stop="onStop">
    <div class="box">I use event handlers instead of callbacks passed as props</div>
  </Draggable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Draggable from '../src';
import ExampleComponent from './ExampleComponent.vue';

export default defineComponent({
  name: 'App',
  components: { Draggable, ExampleComponent },
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
        y: 200
      }
    };
  },
  methods: {
    handleDrag(e, ui) {
      const { x, y } = this.deltaPosition;
      this.deltaPosition = {
        x: x + ui.deltaX,
        y: y + ui.deltaY
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
      if (e.target.classList.contains('drop-target')) {
        alert('Dropped!');
        e.target.classList.remove('hovered');
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
    onControlledDrag(e, position) {
      const { x, y } = position;
      this.controlledPosition.x = x;
      this.controlledPosition.y = y;
    },
    onControlledDragStop(e, position) {
      this.onControlledDrag(e, position);
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
