---
title: Draggable
description: 'Revue Draggable'
category: Guide
position: 2
---
A `<Draggable>` element wraps an existing element and extends it with new event handlers and styles.
You can either use a component wrapper, which creates an element in the DOM, a directive, which will not create
an element or a composable and it's hooks (no element included either).

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
type DraggableEventHandler = (e: MouseEvent, data: DraggableData) => void | false;

type DraggableData = {
    node: HTMLElement;
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
    lastX: number;
    lastY: number;
};

interface DraggableOptions extends DraggableCoreOptions {
    axis: 'both' | 'x' | 'y' | 'none';
    bounds: DraggableBounds | string | false;
    defaultClassName: string;
    defaultClassNameDragging: string;
    defaultClassNameDragged: string;
    defaultPosition: ControlPosition;
    positionOffset: PositionOffsetControlPosition;
    position: ControlPosition;
}

type TransformedData = {
    style: Record<string, string> | false;
    transform: string | false;
    classes: {
        [x: string]: boolean;
    };
};

interface DraggableCoreOptions {
    allowAnyClick: boolean;
    cancel: string;
    disabled: boolean;
    update?: boolean;
    enableUserSelectHack: boolean;
    offsetParent: HTMLElement;
    grid: [number, number];
    handle: string;
    onStart: DraggableEventHandler;
    onDrag: DraggableEventHandler;
    onStop: DraggableEventHandler;
    onMouseDown: (e: MouseEvent) => void;
    scale: number;
}

type DraggableCoreState = State & DraggableCoreOptions;

type DraggableState = State & DraggableOptions;

interface State {
    dragging: boolean;
    dragged: boolean;
    x: number;
    y: number;
    prevPropsPosition: { x: number; y: number };
    slackX: number;
    slackY: number;
    isElementSVG: boolean;
    touch?: number;
}

interface UseDraggable {
    onDragStart: EventHookOn<DraggableHook>;
    onDrag: EventHookOn<DraggableHook>;
    onDragStop: EventHookOn<DraggableHook>;
    onTransformed: EventHookOn<TransformedData>;
    updateState: (state: Partial<DraggableState>) => Partial<DraggableState> | void;
}

type UseDraggableCore = Omit<UseDraggable, 'onTransformed'>;

interface DraggableEvent {
    event: MouseEvent;
    data: DraggableData;
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
    updateState: (state: Partial<DraggableState>) => Partial<DraggableState> | void;
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
    onMounted(() => {
      const { onDrag } = useDraggable({ nodeRef });
      onDrag(() => console.log('dragging')); // called when element is dragged
    })
    
    return {
        nodeRef
    }
  }
}
</script>
```
