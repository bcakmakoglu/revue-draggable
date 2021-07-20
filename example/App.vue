<template>
  <h1>Revue Draggable</h1>
  <p>Active DragHandlers: {{ activeDrags }}</p>
  <p>
    <a href="https://github.com/bcakmakoglu/revue-draggable">Github</a>
  </p>
  <div class="box" v-draggable @start="onStart" @stop="onStop">I can be dragged anywhere</div>
  <div class="box cursor-x" v-draggable="{ axis: 'x' }" @start="onStart" @stop="onStop">
    I can only be dragged horizonally (x axis)
  </div>
  <div class="box cursor-y" v-draggable="{ axis: 'y' }" @start="onStart" @stop="onStop">
    I can only be dragged vertically (y axis)
  </div>
  <div class="box" v-draggable="{ update: false }">I don't want to be dragged</div>
  <div class="box" v-draggable @move="handleDrag" @start="onStart" @stop="onStop">
    <div>I track my deltas</div>
    <div>x: {{ deltaPosition.x.toFixed(0) }}, y: {{ deltaPosition.y.toFixed(0) }}</div>
  </div>
  <div class="box no-cursor" v-draggable="{ handle: 'strong' }" @start="onStart" @stop="onStop">
    <strong class="cursor">
      <div>Drag here</div>
    </strong>
    <div>You must click my handle to drag me</div>
  </div>
  <div class="box" v-draggable="{ bounds: 'body' }" @start="onStart" @stop="onStop">
    I can only be moved within the confines of the body element.
  </div>
  <div
    class="box no-cursor"
    style="display: flex; flex-direction: column"
    v-draggable="{ handle: 'strong' }"
    @start="onStart"
    @stop="onStop"
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
  <div class="box" v-draggable="{ cancel: 'strong' }" @start="onStart" @stop="onStop">
    <strong class="no-cursor">Can't drag here</strong>
    <div>Dragging here works</div>
  </div>
  <div class="box" v-draggable="{ grid: [25, 25] }" @start="onStart" @stop="onStop">I snap to a 25 x 25 grid</div>
  <div class="box" v-draggable="{ grid: [50, 50] }" @start="onStart" @stop="onStop">I snap to a 50 x 50 grid</div>
  <div
    v-draggable
    class="box drop-target"
    @mouseenter="onDropAreaMouseEnter"
    @mouseleave="onDropAreaMouseLeave"
    @start="onStart"
    @stop="onStop"
  >
    I can detect drops from the next box.
  </div>
  <div v-draggable @start="onStart" @stop="onDrop" :class="`box ${activeDrags ? 'no-pointer-events' : ''}`">
    I can be dropped onto another box.
  </div>
  <div class="box" style="height: 500px; width: 500px; position: relative; overflow: auto; padding: 0">
    <div style="height: 1000px; width: 1000px; padding: 10px">
      <div class="box" v-draggable="{ bounds: 'parent' }" @start="onStart" @stop="onStop">
        I can only be moved within my offsetParent.<br /><br />
        Both parent padding and child margin work properly.
      </div>
      <div class="box" v-draggable="{ bounds: 'parent' }" @start="onStart" @stop="onStop">
        I also can only be moved within my offsetParent.<br /><br />
        Both parent padding and child margin work properly.
      </div>
    </div>
  </div>
  <div class="box" style="position: absolute; bottom: 100px; right: 100px" v-draggable @start="onStart" @stop="onStop">
    I already have an absolute position.
  </div>
  <div class="box" v-draggable="{ defaultPosition: { x: 25, y: 25 } }" @start="onStart" @stop="onStop">
    {{ "I have a default position of {x: 25, y: 25}, so I'm slightly offset." }}
  </div>
  <div class="box" v-draggable="{ positionOffset: { x: '-10%', y: '-10%' } }" @start="onStart" @stop="onStop">
    {{ "I have a default position based on percents {x: '-10%', y: '-10%'}, so I'm slightly offset." }}
  </div>
  <div class="box" v-draggable="{ position: controlledPosition }" @move="onControlledDrag" @start="onStart" @stop="onStop">
    My position can be changed programmatically. <br />
    I have a drag handler to sync state.
    <div>
      <a href="#" @click="adjustXPos">Adjust x ({{ controlledPosition.x }})</a>
    </div>
    <div>
      <a href="#" @click="adjustYPos">Adjust y ({{ controlledPosition.y }})</a>
    </div>
  </div>
  <div class="box" v-draggable="{ position: controlledPosition }" @start="onStart" @stop="onControlledDragStop">
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
    @start="onStart"
    @stop="onStop"
  >
    I use <span style="font-weight: 700">rem</span> instead of <span style="font-weight: 700">px</span> for my transforms. I also
    have absolute positioning.

    <br /><br />
    I depend on a CSS hack to avoid double absolute positioning.
  </div>
  <DraggableCore @start="onStart" @stop="onStop">
    <ExampleComponent>
      <span>I'm in a nested component</span>
    </ExampleComponent>
  </DraggableCore>
  <Draggable @start="onStart" @stop="onStop">
    <div class="box">I use a custom made Draggable Component using composable hooks.</div>
    <div class="box">I use a custom made Draggable Component using composable hooks.</div>
    <div class="box">I use a custom made Draggable Component using composable hooks.</div>
  </Draggable>
</template>

<script lang="ts">
import { defineComponent } from 'vue-demi';
import ExampleComponent from './ExampleComponent.vue';
import Draggable from '../src/components/Draggable';
import DraggableCore from '../src/components/DraggableCore';

export default defineComponent({
  name: 'App',
  components: { DraggableCore, ExampleComponent, Draggable },
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
        x: x + e.detail.data.deltaX,
        y: y + e.detail.data.deltaY
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
