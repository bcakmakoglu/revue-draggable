<template>
  <div id="demo">
    <div class="grid grid-cols-2">
      <div class="flex flex-col justify-center items-start">
        <h1 v-draggable class="title" @start="onStart" @stop="onStop" @move="onMove">Revue Draggable 🤏</h1>
        <h2 v-draggable class="subtitle" @start="onStart" @stop="onStop" @move="onMove">Make anything draggable!</h2>
      </div>

      <div
        style="z-index: 9999"
        class="flex flex-col bg-light-500 w-lg py-4 px-8 shadow-lg rounded-bl-2xl absolute right-0 top-0"
      >
        <h4 class="active-handlers col-span-1">Active: {{ name }}</h4>
        <h4 class="demo-info col-span-2">Event: {{ event.data }}</h4>
      </div>
    </div>
    <div id="demo-boxes" class="demo-boxes">
      <WrapperBox
        title="🎮 Quickstart"
        description="I don't use any options. Just Plug and Play fun!"
        info="<Draggable>
    <div>Quickstart with component</div>
 </Draggable>

 // or

 <div v-draggable>Quickstart with directive</div> "
        @start="onStart"
        @move="onMove"
        @stop="onStop"
      />

      <WrapperBox
        class="cursor-x"
        title="🔒 X-axis"
        description="I can only be dragged horizontally (x-axis)."
        info='<Draggable axis="x">
    <div>X-Axis with component</div>
 </Draggable>

 // or

 <div v-draggable="{ axis: &apos;x&apos; }">X-Axis with directive</div> '
        :draggable-options="{ axis: 'x' }"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      />

      <WrapperBox
        class="cursor-y"
        title="🔒 Y-axis"
        description="I can only be dragged vertically (y-axis)."
        info='<Draggable axis="y">
    <div>Y-Axis with component</div>
 </Draggable>

 // or

 <div v-draggable="{ axis: &apos;y&apos; }">Y-Axis with directive</div> '
        :draggable-options="{ axis: 'y' }"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      />

      <WrapperBox
        :title="active ? '✅ Draggable' : '❌ Undraggable'"
        description="I don't want to be dragged until my update options is set to a non-false value. Click on me to toggle draggability."
        info='<Draggable :update="active"> // update expects a boolean
    <div>Toggle drag with component</div>
 </Draggable>

 // or

 <div v-draggable="{ update: active }">Toggle drag with directive</div> '
        :draggable-options="{ update: active }"
        @click="toggleDraggable"
      />

      <WrapperBox
        title="🖲 Tracking"
        description="I track my deltas. Useful if you need to know my position!"
        info='<Draggable @move="handleDrag">
    <div><!-- show current pos from event data here --></div>
 </Draggable>

 // or

 <div v-draggable @move="handleDrag"><!-- show current pos from event data here --></div> '
        @move="handleDrag"
        @start="onStart"
        @stop="onStop"
      >
        <div>x: {{ deltaPosition.x.toFixed(0) }}, y: {{ deltaPosition.y.toFixed(0) }}</div>
      </WrapperBox>

      <WrapperBox
        title="✋ Handle"
        description="I can only be dragged by my handle. I use querySelector under the hood."
        info='<Draggable handle="strong">
    <div>Drag handle with component</div>
 </Draggable>

 // or

 <div v-draggable="{ handle: &apos;strong&apos; }">Drag handle with directive</div> '
        :draggable-options="{ handle: 'strong' }"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      >
        <strong class="cursor">
          <div>Drag here</div>
        </strong>
      </WrapperBox>

      <WrapperBox
        title="🖼 Bounds"
        description="I can only be moved withing the confines of the body element."
        info='<Draggable bounds="body">
    <div>Bounds with component</div>
 </Draggable>

 // or

 <div v-draggable="{ bounds: &apos;body&apos; }">Bounds with directive</div> '
        :draggable-options="{ bounds: 'body' }"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      />

      <WrapperBox
        title="🤸‍♀️ Scrollable content"
        :draggable-options="{ handle: 'strong' }"
        info='<Draggable handle="strong">
    <div style="display: flex; flex-direction: column; max-height: 140px">
        <strong class="cursor"> Drag here </strong>
        <div style="overflow: scroll">
          <div class="bg-gray-500" style="white-space: pre-wrap">
            I have long scrollable content and a handle ✋.
          </div>
        </div>
     </div>
 </Draggable>

 // or

 <div v-draggable="{ handle: &apos;strong&apos; }">
   <strong class="cursor"> Drag here </strong>
      <div style="overflow: scroll">
        <div class="bg-gray-500" style="white-space: pre-wrap">
          I have long scrollable content and a handle ✋.
        </div>
      </div>
   </div>
 </div> '
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      >
        <div style="display: flex; flex-direction: column; max-height: 140px">
          <strong class="cursor"> Drag here </strong>
          <div style="overflow: scroll">
            <div class="bg-gray-500" style="white-space: pre-wrap">
              I have long scrollable content and a handle ✋.
              {{ '\n' + Array(40).fill('x').join('\n') }}
            </div>
          </div>
        </div>
      </WrapperBox>

      <WrapperBox
        title="👎 Non-draggable handle"
        info='<Draggable cancel="strong">
   <strong class="no-cursor">Can&apos;t drag here</strong>
   <div>Dragging here works</div>
 </Draggable>

 // or

 <div v-draggable="{ cancel: &apos;strong&apos; }">
   <strong class="no-cursor">Can&apos;t drag here</strong>
   <div>Dragging here works</div>
 </div> '
        :draggable-options="{ cancel: 'strong' }"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      >
        <strong class="no-cursor">Can't drag here</strong>
        <div>Dragging here works</div>
      </WrapperBox>

      <WrapperBox
        title="🧩 Grid"
        description="I snap to a 25 x 25 grid"
        info='<Draggable :grid="[25, 25]">
    <div>Grid with component</div>
 </Draggable>

 // or

 <div v-draggable="{ grid: [25, 25] }">Grid with directive</div> '
        :draggable-options="{ grid: [25, 25] }"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      />

      <WrapperBox
        title="🧩 Grid"
        description="I snap to a 50 x 50 grid"
        info='<Draggable :grid="[50, 50]">
    <div>Grid with component</div>
 </Draggable>

 // or

 <div v-draggable="{ grid: [50, 50] }">Grid with directive</div> '
        :draggable-options="{ grid: [50, 50] }"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      />

      <WrapperBox
        title="🏈 Drag and Drop"
        description="I can detect drops from the other Drag and Drop box."
        info='<Draggable
        class="drop-target"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
        @mouseenter="onDropAreaMouseEnter"
        @mouseleave="onDropAreaMouseLeave"
        >
    <div>Drag and Drop example</div>
 </Draggable>

// ...
onMove(e, name) {
  this.currentEvent = e;
},
onStart(e, name) {
  this.activeDrags++;
},
 onStop() {
   this.activeDrags--;
},
onDropAreaMouseEnter(e) {
    if (this.activeDrags) {
      e.target.classList.add(&apos;hovered&apos;);
    }
},
onDropAreaMouseLeave(e) {
   e.target.classList.remove(&apos;hovered&apos;);
} '
        class="drop-target"
        @mouseenter="onDropAreaMouseEnter"
        @mouseleave="onDropAreaMouseLeave"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      />

      <WrapperBox
        title="🏈 Drag and Drop"
        description="I can be dropped onto the other Drag and Drop box."
        info='<Draggable
        @start="onStart"
        @stop="onDrop"
        @move="onMove"
        >
    <div>Drag and Drop example</div>
 </Draggable>

// ...
onMove(e, name) {
  this.currentEvent = e;
},
onStart(e, name) {
  this.activeDrags++;
},
 onStop() {
   this.activeDrags--;
},
onDropAreaMouseEnter(e) {
    if (this.activeDrags) {
      e.target.classList.add(&apos;hovered&apos;);
    }
},
onDropAreaMouseLeave(e) {
   e.target.classList.remove(&apos;hovered&apos;);
} '
        :class="`${activeDrags ? 'no-pointer-events' : ''}`"
        @start="onStart"
        @stop="onDrop"
        @move="onMove"
      />

      <WrapperBox
        title="🧪 Programmatic usage"
        description="I sync my state with a dragHandler."
        info='<Draggable :position="controlledPosition" @move="onControlledDrag">
    <div>Controlled Drag example</div>
 </Draggable>

// ...
onControlledDrag(e) {
   const { x, y } = e.data;
   this.controlledPosition.x = x;
   this.controlledPosition.y = y;
}, '
        :draggable-options="{ position: controlledPosition }"
        @move="onControlledDrag"
        @start="onStart"
        @stop="onStop"
      >
        <div>
          <a href="#" @click="adjustXPos">Adjust x ({{ controlledPosition.x }})</a>
        </div>
        <div>
          <a href="#" @click="adjustYPos">Adjust y ({{ controlledPosition.y }})</a>
        </div>
      </WrapperBox>

      <WrapperBox
        title="🧪 Programmatic usage"
        description="I have a dragStop handler to sync state."
        info='<Draggable :position="controlledPosition" @stop="onControlledStop">
    <div>Controlled Drag example</div>
 </Draggable>

// ...
onControlledDrag(e) {
   const { x, y } = e.data;
   this.controlledPosition.x = x;
   this.controlledPosition.y = y;
},
onControlledDragStop(e) {
  this.onControlledDrag(e);
}, '
        :draggable-options="{ position: controlledPosition }"
        @move="onMove"
        @start="onStart"
        @stop="onControlledDragStop"
      >
        <div>
          <a href="#" @click="adjustXPos">Adjust x ({{ controlledPosition.x }})</a>
        </div>
        <div>
          <a href="#" @click="adjustYPos">Adjust y ({{ controlledPosition.y }})</a>
        </div>
      </WrapperBox>

      <WrapperBox
        title="🎨 Styling"
        description="I already have an absolute position."
        info='<Draggable>
    <div style="position: absolute; bottom: 10px; right: 0">Styling with component</div>
 </Draggable>

// or
<div v-draggable style="position: absolute; bottom: 10px; right: 0">Styling with directive</div> '
        style="position: absolute; bottom: 10px; right: 0"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      />

      <WrapperBox
        title="📔 Default position"
        description="I have a default position of { x: 25, y: 25 }, so I'm slightly offset."
        info='<Draggable :default-position="{ x: 25, y: 25 }">
    <div>Default position with component</div>
 </Draggable>

// or
<div v-draggable="{ defaultPosition: { x: 25, y: 25 } }">Default position with directive</div> '
        :draggable-options="{ defaultPosition: { x: 25, y: 25 } }"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      />

      <WrapperBox
        title="🏌️‍♀️ Offset"
        description="I have a default position based on percents { x: '-10%', y: '-10%' }, so I'm slightly offset."
        info='<Draggable :position-offset="{ x: "-10%", y: "-10%" }">
    <div>Position offset with component</div>
 </Draggable>

// or
<div v-draggable="{ positionOffset: { x: "-10%", y: "-10%" } }">Position offset with directive</div> '
        :draggable-options="{ positionOffset: { x: '-10%', y: '-10%' } }"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      />

      <WrapperBox
        title="🪄 Rem or Px positioning"
        info="<Draggable
        class=&quot;rem-position-fix&quot;
        :transform=&quot;translateTransformToRem(transform, 16)&quot;
        style=&quot;position: absolute; bottom: 0; right: 22rem&quot;
        >
    <div>Controlled Drag example</div>
 </Draggable>

// ...
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

<style>
.rem-position-fix {
  position: static;
}
</style>"
        class="rem-position-fix"
        style="position: absolute; bottom: 0; right: 22rem"
        @start="onStart"
        @stop="onStop"
        @move="onMove"
        @transformed="translateTransformToRem(transform, 16)"
      >
        I use <span style="font-weight: 700">rem</span> instead of <span style="font-weight: 700">px</span> for my transforms. I
        also have absolute positioning. I depend on a CSS hack to avoid double absolute positioning.
      </WrapperBox>

      <WrapperBox
        title="🐥 Nested"
        info="<Draggable>
  <FoobarComponent>
    <div>Nested</div>
  </FoobarComponent>
 </Draggable> "
        @start="onStart"
        @stop="onStop"
        @move="onMove"
      >
        <ExampleComponent>
          <span>I' m in a nested component! </span>
        </ExampleComponent>
      </WrapperBox>

      <div class="box" style="height: 400px; width: 400px; position: relative; overflow: auto; padding: 0">
        <div style="height: 1000px; width: 1000px; padding: 10px">
          <WrapperBox
            title="👨‍👨‍👧 Parent boundaries"
            description="I can only be moved within my offsetParent. Both parent padding and child margin work properly."
            info='<div style="height: 400px; width: 400px; position: relative; overflow: auto; padding: 0">
  <div style="height: 1000px; width: 1000px; padding: 10px">
    <Draggable bounds="parent">
      <div>Bound to parent</div>
    </Draggable>
  </div>
</div> '
            :draggable-options="{ bounds: 'parent' }"
            @start="onStart"
            @stop="onStop"
            @move="onMove"
          >
          </WrapperBox>
          <WrapperBox
            title="👨‍👨‍👧 Parent boundaries"
            description="I'm stuck in here too..."
            info='<div style="height: 400px; width: 400px; position: relative; overflow: auto; padding: 0">
  <div style="height: 1000px; width: 1000px; padding: 10px">
    <Draggable bounds="parent">
      <div>Bound to parent</div>
    </Draggable>
  </div>
</div> '
            :draggable-options="{ bounds: 'parent' }"
            @start="onStart"
            @stop="onStop"
            @move="onMove"
          >
          </WrapperBox>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
import { defineComponent } from 'vue-demi'
import ExampleComponent from './ExampleComponent.vue'
import WrapperBox from './WrapperBox.vue'

export default defineComponent({
  components: { WrapperBox, ExampleComponent },
  data() {
    return {
      name: '',
      currentEvent: {},
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
    }
  },
  computed: {
    event() {
      return {
        data: { ...this.currentEvent.data }
      }
    }
  },
  methods: {
    toggleDraggable() {
      this.active = !this.active
    },
    handleDrag(e) {
      this.currentEvent = e
      const { x, y } = this.deltaPosition
      this.deltaPosition = {
        x: x + e.data.deltaX,
        y: y + e.data.deltaY
      }
    },
    onMove(e, name) {
      this.name = name
      this.currentEvent = e
    },
    onStart(e, name) {
      this.name = name
      this.currentEvent = e
      this.activeDrags++
    },
    onStop() {
      this.currentEvent = {}
      this.name = ''
      this.activeDrags--
    },
    onDrop(e) {
      this.currentEvent = {}
      this.activeDrags--
      if (e.event.target.classList.contains('drop-target')) {
        alert('Dropped!')
        e.event.target.classList.remove('hovered')
      }
    },
    onDropAreaMouseEnter(e) {
      if (this.activeDrags) {
        e.target.classList.add('hovered')
      }
    },
    onDropAreaMouseLeave(e) {
      e.target.classList.remove('hovered')
    },
    // For controlled component
    adjustXPos(e) {
      e.preventDefault()
      e.stopPropagation()
      const { x, y } = this.controlledPosition
      this.controlledPosition = { x: x - 10, y }
    },
    adjustYPos(e) {
      e.preventDefault()
      e.stopPropagation()
      const { x, y } = this.controlledPosition
      this.controlledPosition = { x, y: y - 10 }
    },
    onControlledDrag(e) {
      this.currentEvent = e
      const { x, y } = e.data
      this.controlledPosition = { x, y }
    },
    onControlledDragStop(e) {
      this.currentEvent = {}
      this.onControlledDrag(e)
      this.onStop()
    },
    translateTransformToRem(transform = 'translate(0rem, 0rem)', remBaseline = 16) {
      const convertedValues = transform
        .replace('translate(', '')
        .replace(')', '')
        .split(',')
        .map((px) => px.replace('px', ''))
        .map((px) => parseInt(px, 10) / remBaseline)
        .map((x) => `${x}rem`)
      const [x, y] = convertedValues

      return (this.transform = `translate(${x}, ${y})`)
    }
  }
})
</script>
<style>
#demo {
  @apply min-h-100vh flex flex-col justify-center p-12 dark:bg-dark-800;
  overflow: scroll;
}

.title {
  @apply font-extrabold text-6xl self-start dark:text-primary my-4;
}

.subtitle {
  @apply font-bold text-4xl self-start dark:text-secondary mb-4 mt-2;
}

.demo-info {
  @apply font-semibold text-xl dark:text-secondary;
}

.active-handlers {
  @apply text-2xl font-semibold self-start dark:text-accent-400 m-0;
}

.demo-boxes {
  @apply flex flex-row flex-1 flex-wrap mt-16;
}

* {
  box-sizing: border-box;
}

html,
body {
  height: 100%;
  overflow: scroll;
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
  @apply bg-light-500;
  border: 1px solid #999;
  border-radius: 3px;
  width: 180px;
  height: 180px;
  margin: 10px;
  padding: 10px;
}

.no-pointer-events {
  pointer-events: none;
}

.hovered {
  @apply bg-gray-500;
}

.rem-position-fix {
  @apply static;
}

a {
  text-decoration-line: none;
}
</style>
