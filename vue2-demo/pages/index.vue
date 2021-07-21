<template>
  <div id="app">
    <h1 class="title" v-draggable @start="onStart" @stop="onStop" @move="onMove">
      <a href="https://github.com/bcakmakoglu/revue-draggable">Revue Draggable</a> 🤏
    </h1>
    <h2 class="subtitle" v-draggable @start="onStart" @stop="onStop" @move="onMove">
      Make any Vue component / DOM element draggable!
    </h2>

    <h3 class="demo-info" v-draggable @start="onStart" @stop="onStop" @move="onMove">Try to drag each box.</h3>

    <div class="grid grid-cols-3">
      <h4 class="active-handlers col-span-1" v-draggable @start="onStart" @stop="onStop" @move="onMove">
        Active DragHandlers: {{ activeDrags }}
      </h4>
      <h4 class="text-1xl dark:text-light col-span-2" v-draggable @start="onStart" @stop="onStop" @move="onMove">
        Event: {{ event }}
      </h4>
    </div>
    <div class="demo-boxes">
      <div class="box" v-draggable @start="onStart" @stop="onStop" @move="onMove">I can be dragged anywhere</div>
      <div class="box cursor-x" v-draggable="{ axis: 'x' }" @start="onStart" @stop="onStop" @move="onMove">
        I can only be dragged horizonally (x axis)
      </div>
      <div class="box cursor-y" v-draggable="{ axis: 'y' }" @start="onStart" @stop="onStop" @move="onMove">
        I can only be dragged vertically (y axis)
      </div>
      <div class="box" v-draggable="{ update: false }">I don't want to be dragged</div>
      <div class="box" v-draggable @move="handleDrag" @start="onStart" @stop="onStop">
        <div>I track my deltas</div>
        <div>x: {{ deltaPosition.x.toFixed(0) }}, y: {{ deltaPosition.y.toFixed(0) }}</div>
      </div>
      <div class="box no-cursor" v-draggable="{ handle: 'strong' }" @start="onStart" @stop="onStop" @move="onMove">
        <strong class="cursor">
          <div>Drag here</div>
        </strong>
        <div>You must click my handle to drag me</div>
      </div>
      <div class="box" v-draggable="{ bounds: 'body' }" @start="onStart" @stop="onStop" @move="onMove">
        I can only be moved within the confines of the body element.
      </div>
      <div
        class="box no-cursor"
        style="display: flex; flex-direction: column"
        v-draggable="{ handle: 'strong' }"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
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
      <div class="box" v-draggable="{ cancel: 'strong' }" @start="onStart" @stop="onStop" @move="onMove">
        <strong class="no-cursor">Can't drag here</strong>
        <div>Dragging here works</div>
      </div>
      <div class="box" v-draggable="{ grid: [25, 25] }" @start="onStart" @stop="onStop" @move="onMove">
        I snap to a 25 x 25 grid
      </div>
      <div class="box" v-draggable="{ grid: [50, 50] }" @start="onStart" @stop="onStop" @move="onMove">
        I snap to a 50 x 50 grid
      </div>
      <div
        v-draggable
        class="box drop-target"
        @mouseenter="onDropAreaMouseEnter"
        @mouseleave="onDropAreaMouseLeave"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      >
        I can detect drops from the next box.
      </div>
      <div v-draggable @start="onStart" @stop="onDrop" :class="`box ${activeDrags ? 'no-pointer-events' : ''}`">
        I can be dropped onto another box.
      </div>
      <div class="box" style="height: 500px; width: 500px; position: relative; overflow: auto; padding: 0">
        <div style="height: 1000px; width: 1000px; padding: 10px">
          <div class="box" v-draggable="{ bounds: 'parent' }" @start="onStart" @stop="onStop" @move="onMove">
            I can only be moved within my offsetParent.<br /><br />
            Both parent padding and child margin work properly.
          </div>
          <div class="box" v-draggable="{ bounds: 'parent' }" @start="onStart" @stop="onStop" @move="onMove">
            I also can only be moved within my offsetParent.<br /><br />
            Both parent padding and child margin work properly.
          </div>
        </div>
      </div>
      <div
        class="box"
        style="position: absolute; bottom: 100px; right: 100px"
        v-draggable
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      >
        I already have an absolute position.
      </div>
      <div class="box" v-draggable="{ defaultPosition: { x: 25, y: 25 } }" @start="onStart" @stop="onStop" @move="onMove">
        {{ "I have a default position of {x: 25, y: 25}, so I'm slightly offset." }}
      </div>
      <div class="box" v-draggable="{ positionOffset: { x: '-10%', y: '-10%' } }" @start="onStart" @stop="onStop" @move="onMove">
        {{ "I have a default position based on percents {x: '-10%', y: '-10%'}, so I'm slightly offset." }}
      </div>
      <div class="box" v-draggable="{ position: controlledPosition }" @move="onControlledDrag" @start="onStart" @stop="onStop">
        My position can be changed programmatically. <br />
        I have a drag handler to sync state.
        <div>
          <button @click="adjustXPos">Adjust x ({{ controlledPosition.x }})</button>
        </div>
        <div>
          <button @click="adjustYPos">Adjust y ({{ controlledPosition.y }})</button>
        </div>
      </div>
      <div
        class="box"
        v-draggable="{ position: controlledPosition }"
        @move="onMove"
        @start="onStart"
        @stop="onControlledDragStop"
      >
        My position can be changed programmatically. <br />
        I have a dragStop handler to sync state.
        <div>
          <button @click="adjustXPos">Adjust x ({{ controlledPosition.x }})</button>
        </div>
        <div>
          <button @click="adjustYPos">Adjust y ({{ controlledPosition.y }})</button>
        </div>
      </div>
      <div
        :transform="translateTransformToRem(transform, 16)"
        class="box rem-position-fix"
        style="position: absolute; bottom: 6.25rem; right: 18rem"
        v-draggable
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      >
        I use <span style="font-weight: 700">rem</span> instead of <span style="font-weight: 700">px</span> for my transforms. I
        also have absolute positioning. I depend on a CSS hack to avoid double absolute positioning.
      </div>
      <Draggable @start="onStart" @stop="onStop" @move="onMove">
        <div class="box">3 Slots in a single Draggable Wrapper</div>
        <div class="box">3 Slots in a single Draggable Wrapper</div>
        <div class="box">3 Slots in a single Draggable Wrapper</div>
      </Draggable>
    </div>
  </div>
</template>
<script>
import { DraggablePlugin } from '@braks/revue-draggable';
import { Vue2, defineComponent } from 'vue-demi';

Vue2.use(DraggablePlugin);

export default defineComponent({
  data() {
    return {
      currentEvent: {},
      eventData: {},
      active: false,
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
  computed: {
    event() {
      return {
        ...this.currentEvent
      };
    }
  },
  methods: {
    toggleDraggable() {
      this.active = !this.active;
    },
    handleDrag(e) {
      this.currentEvent = e.detail;
      const { x, y } = this.deltaPosition;
      this.deltaPosition = {
        x: x + e.detail.data.deltaX,
        y: y + e.detail.data.deltaY
      };
    },
    onMove(e) {
      this.currentEvent = e.detail;
    },
    onStart(e) {
      this.currentEvent = e.detail;
      this.activeDrags++;
    },
    onStop() {
      this.currentEvent = {};
      this.activeDrags--;
    },
    onDrop(e) {
      this.currentEvent = {};
      this.activeDrags--;
      // get the original event
      if (e.detail.event.target.classList.contains('drop-target')) {
        alert('Dropped!');
        e.detail.event.target.classList.remove('hovered');
      }
    },
    onDropAreaMouseEnter(e) {
      this.currentEvent = e;
      if (this.activeDrags) {
        e.target.classList.add('hovered');
      }
    },
    onDropAreaMouseLeave(e) {
      this.currentEvent = e;
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
      this.currentEvent = e;
      const { x, y } = e.detail.data;
      this.controlledPosition.x = x;
      this.controlledPosition.y = y;
    },
    onControlledDragStop(e) {
      this.currentEvent = {};
      this.onControlledDrag(e);
      this.onStop();
    },
    translateTransformToRem(transform = 'translate(0rem, 0rem)', remBaseline = 16) {
      const convertedValues = transform
        .replace('translate(', '')
        .replace(')', '')
        .split(',')
        .map((px) => px.replace('px', ''))
        .map((px) => parseInt(px, 10) / remBaseline)
        .map((x) => `${x}rem`);
      const [x, y] = convertedValues;

      return (this.transform = `translate(${x}, ${y})`);
    }
  }
});
</script>
<style>
#app {
  @apply min-h-100vh flex flex-col justify-center p-12 dark:bg-black;
}

.title {
  @apply font-extrabold text-6xl self-start dark:text-primary;
}

.subtitle {
  @apply font-bold text-4xl self-start dark:text-secondary mb-4;
}

.demo-info {
  @apply font-bold text-3xl self-start dark:text-accent;
}

.active-handlers {
  @apply text-2xl self-start dark:text-gray-200 mt-4;
}

.demo-boxes {
  @apply flex flex-row flex-1 flex-wrap mt-4;
}

* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
}

body {
  font-family: 'Helvetica Neue', sans-serif;
  font-weight: 200;
}

.revue-draggable,
.cursor {
  cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>🤏</text></svg>")
      16 0,
    auto;
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
  @apply bg-gray-200;
  border: 1px solid #999;
  border-radius: 3px;
  display: block;
  margin-bottom: 10px;
  padding: 3px 5px;
  text-align: center;
}

.box {
  @apply bg-light;
  border: 1px solid #999;
  border-radius: 3px;
  width: 180px;
  height: 180px;
  margin: 10px;
  padding: 10px;
}

.no-pointer-events {
  @apply pointer-none;
}

.hovered {
  @apply bg-gray-500;
}

.rem-position-fix {
  @apply static;
}

button {
  @apply font-bold text-blue-500;
}
</style>
