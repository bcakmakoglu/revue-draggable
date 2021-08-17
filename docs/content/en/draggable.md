---
title: Draggable
description: 'Revue Draggable'
category: Guide
position: 2
---
A `<Draggable>` element wraps an existing element and extends it with new event handlers and styles.
You can either use a component wrapper, which creates an element in the DOM, a directive, which will not create
an element or a composable, and it's hooks (no element included either).

Draggable items move using CSS Transforms.
This allows items to be dragged regardless of their current positioning (relative, absolute, or static). 
Elements can also be moved between drags without incident.

If the item you are dragging already has a CSS Transform applied, it will be overwritten by Revue Draggable. 
Use an intermediate wrapper (`<div v-draggable><span>...</span></div>`) in this case.

## Usage

View the [Demo](https://revue-draggable.vercel.app/) or its [source](https://github.com/bcakmakoglu/revue-draggable/blob/master/example/App.vue) for more examples.

```vue {}[App.vue]
<template>
  <div class="box" v-draggable @drag-start="onStart" @drag-stop="onStop">I can be dragged anywhere</div>
</template>

<script lang="ts">
import { defineComponent } from 'vue';

default defineComponent({
  name: 'App',
  methods: {
    onStart() {
      this.activeDrags++;
    },
    onStop() {
      this.activeDrags--;
    }
  }
});
</script>
```

## API

`Revue Draggable` transparently adds draggability to its children.

Note: Only a single child is allowed or an Error will be thrown.

For `Revue Draggable` to correctly attach itself to its child, the child element must provide support for the following props:

  * style is used to give the transform css to the child.
  * class is used to apply the proper classes to the object being dragged. 
  * onMouseDown, onMouseUp, onTouchStart, and onTouchEnd are used to keep track of dragging state.

### Types

```ts
// Return type of draggable composable
interface UseDraggable {
    onDragStart: EventHookOn<DraggableEvent>;
    onDrag: EventHookOn<DraggableEvent>;
    onDragStop: EventHookOn<DraggableEvent>;
    onTransformed: EventHookOn<TransformEvent>;
    state: Ref<Partial<DraggableState>>;
}

interface DraggableEvent {
    event: MouseEvent;
    data: DraggableData;
}

// Data returned from a Draggable Event (start, move, stop)
type DraggableData = {
    node: HTMLElement;
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
    lastX: number;
    lastY: number;
};

// Data returned from Transformed Event (transformed)
interface TransformEvent {
    el: any;
    style: Record<string, string> | false;
    transform: string | false;
    classes: {
        [x: string]: boolean;
    };
}

// These options can be passed to any of the `Draggable` implementations
// So you can pass any of these options to the directive, component or composable
// i.e., v-draggable="options" | <Draggable axis="x" ... > | useDraggable(nodeRef, options)
interface DraggableOptions {
    // Determines which axis the draggable can move. This only affects
    // flushing to the DOM. Callbacks will still include all values.
    // Accepted values:
    // - `both` allows movement horizontally and vertically (default).
    // - `x` limits movement to horizontal axis.
    // - `y` limits movement to vertical axis.
    // - 'none' stops all movement.
    axis: 'both' | 'x' | 'y' | 'none';

    // Specifies movement boundaries. Accepted values:
    // - `parent` restricts movement within the node's offsetParent
    //    (nearest node with position relative or absolute), or
    // - a selector, restricts movement within the targeted node
    // - An object with `left, top, right, and bottom` properties.
    //   These indicate how far in each direction the draggable
    //   can be moved.
    bounds: { left?: number, top?: number, right?: number, bottom?: number } | string | false;

    // Class names for draggable UI.
    // Default to 'react-draggable', 'revue-draggable-dragging', and 'revue-draggable-dragged'    
    defaultClassName: string;
    defaultClassNameDragging: string;
    defaultClassNameDragged: string;

    /* Specifies the `x` and `y` that the dragged item should start at.
       This is generally not necessary to use (you can use absolute or relative
       positioning of the child directly), but can be helpful for uniformity in
       your callbacks and with css transforms.
     */
    defaultPosition: { x: number, y: number };
    
    // A position offset to start with. Useful for giving an initial position
    // to the element. Differs from `defaultPosition` in that it does not
    // affect the postiion returned in draggable callbacks, and in that it
    // accepts strings, like `{x: '10%', y: '10%'}`.
    positionOffset: { x: number | string, y: number | string };
    
    // If this property is present, the item
    // becomes 'controlled' and is not responsive to user input. Use `position`
    // if you need to have direct control of the element.
    position: { x: number, y: number };

    // If set to `true`, will allow dragging on non left-button clicks.
    allowAnyClick: boolean;

    enableUserSelectHack: boolean;
    
    // If true, `Draggable` will remove transformation on dragend and apply a position (default `relative`)
    // and a top & left position. 
    // This will fix blurriness you might experience on Chrome or IE
    // be aware that this will overwrite pre-existing position, top and left values.
    enableTransformFix: boolean | { position: 'absolute' | 'relative' }; 

    // If true, will not call any drag handlers.
    disabled: boolean;

    // If true, will cancel the action (i.e. drag-start, drag-move, drag-end will be canceled)
    update: boolean;

    // If desired, you can provide your own offsetParent for drag calculations.
    // By default, we use the Draggable's offsetParent. This can be useful for elements
    // with odd display types or floats.
    offsetParent?: HTMLElement;

    // Specifies the x and y that dragging should snap to.
    grid?: [number, number];

    // Specifies a selector to be used as the handle that initiates drag.
    // Example: '.handle'
    handle: string;

    // Specifies a selector to be used to prevent drag initialization. The string is passed to
    // Element.matches, so it's possible to use multiple selectors like `.first, .second`.
    // Example: '.body'
    cancel: string;

    // Specifies the scale of the canvas your are dragging this element on. This allows
    // you to, for example, get the correct drag deltas while you are zoomed in or out via
    // a transform or matrix in the parent of this element.
    scale: number;

    // Called whenever the user mouses down. Called regardless of handle or
    // disabled status.
    mouseDown: (e: MouseEvent) => void;

    // Called when dragging starts. If `false` is returned any handler,
    // the action will cancel. 
    // Canceling only works if passed as callback (prop or option, not if used as event handler, i.e. @start="handler")
    start: DraggableEventHandler;

    // Called while dragging.
    drag: DraggableEventHandler;

    // Called when dragging stops.
    stop: DraggableEventHandler,
}
```

### Events

```vue
<template>
  <div v-draggable @start="dragStart">Drag me!</div>
</template>
... the rest of your code

```

#### Emittable Events

* `start` - Called after native `mousedown` or `touchstart` event and `start` event of `<DraggableCore>`. Emits `DraggableEvent`.
* `move` - Called after native `mousemove` or `touchmove` event and `move` event of `<DraggableCore>`. Emits `DraggableEvent`.
* `stop` - Called after native `mouseup` or `touchend` event and `stop` event of `<DraggableCore>`. Emits `DraggableEvent`.
* `transformed` - Called after the element has been transformed (i.e., styles to move it have been applied). Emits `TransformEvent`


#### Scoped Slot

A scoped slot is available containing the state of the Draggable component.
Overwriting the state will trigger Draggable to transform and update it's internal state.

```vue
<Draggable>
    <template #default="props">
      <div @click="reset(props.state)"></div> 
    </template>
</Draggable>

...
<script>
export default {
  methods: {
    // reset the elements state back to its initial position
    reset(state) {
      state.value = { ...state.value, position:{ x: 0, y: 0 } };
    }
  }
}
</script>
```

## useDraggable

Instead of using the directive you can compose your own 
draggable element using the useDraggable hooks.
If provided a valid node reference useDraggable will add all event handlers and
transformations directly onto the node.

```ts
// useDraggable hooks
interface UseDraggable {
    onDragStart: EventHookOn<DraggableHook>;
    onDrag: EventHookOn<DraggableHook>;
    onDragStop: EventHookOn<DraggableHook>;
    onTransformed: EventHookOn<TransformedData>;
    state: Ref<DraggableState>;
}
```

### Example

```vue {}[DraggableElement.vue]
<template>
    <div :ref="nodeRef">
      I am draggable
    </div>
</template>
<script>
default {
setup() {
    const nodeRef = ref<HTMLElement | null>(null);
    const options = { defaultPosition: { x: 10, y: 0 } };
    onMounted(() => {
      const { onDrag } = useDraggable(nodeRef, options);
      onDrag(() => console.log('dragging')); // called when element is dragged
    })
    
    return {
        nodeRef
    }
  }
}
</script>
```
