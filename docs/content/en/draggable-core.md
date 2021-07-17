---
title: DraggableCore
description: 'Revue Draggable'
category: Guide
position: 3
---

For users that require absolute control, a `<DraggableCore>` element is available. 
This is useful as an abstraction over touch and mouse events, but with full control.
`<DraggableCore>` has no internal state.

`<DraggableCore>` is a useful building block for other libraries that simply want to abstract browser-specific quirks and receive callbacks when a user attempts to move an element. 
It does not set styles or transforms on itself and thus must have callbacks attached to be useful.

## API

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

type DraggableEvent = {
    e: MouseTouchEvent;
    data: DraggableData;
};

interface DraggableCoreProps {
    allowAnyClick: boolean;
    cancel: string;
    disabled: boolean;
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
```

### Props

```ts
export default {
    scale: {
        type: Number as PropType<DraggableCoreProps['scale']>,
        default: 1
    },
    allowAnyClick: {
        type: Boolean as PropType<DraggableCoreProps['allowAnyClick']>,
        default: true
    },
    disabled: {
        type: Boolean as PropType<DraggableCoreProps['disabled']>,
        default: false
    },
    enableUserSelectHack: {
        type: Boolean as PropType<DraggableCoreProps['enableUserSelectHack']>,
        default: true
    },
    onStart: {
        type: Function as PropType<DraggableCoreProps['onStart']>,
        default: () => {}
    },
    onDrag: {
        type: Function as PropType<DraggableCoreProps['onDrag']>,
        default: () => {}
    },
    onStop: {
        type: Function as PropType<DraggableCoreProps['onStop']>,
        default: () => {}
    },
    onMouseDown: {
        type: Function as PropType<DraggableCoreProps['onMouseDown']>,
        default: () => {}
    },
    cancel: {
        type: String as PropType<DraggableCoreProps['cancel']>,
        default: undefined
    },
    offsetParent: {
        type: Object as PropType<DraggableCoreProps['offsetParent']>,
        default: undefined
    },
    grid: {
        type: Array as unknown as PropType<DraggableCoreProps['grid']>,
        default: undefined
    },
    handle: {
        type: String as PropType<DraggableCoreProps['handle']>,
        default: undefined
    }
}
```
<alert>

Note that there is no start position.
`<DraggableCore>` simply calls drag handlers with the below parameters,
indicating its position (as inferred from the underlying MouseEvent) and deltas.
It is up to the parent to set actual positions on `<DraggableCore>`.

</alert>

Drag callbacks (onStart, onDrag, onStop) are called with the [same arguments as `<Draggable>`](/draggable).

### Events

Instead of passing callback functions you can use typical vue event handlers.
The drawback here is that `<DraggableCore>` allows you to return false from a callback to stop the update of the current event handler.
You might have to handle this case yourself if that is an issue or just pass the function as a prop.

```vue
<template>
  <DraggableCore @start="start">
    <div>Drag me!</div>
  </DraggableCore>
</template>
... the rest of your code

```

#### Emittable Events

* `start` - Called after native `mousedown`. Emits `DraggableData`.
* `move` - Called after native `mouseup`. Emits `DraggableData`.
* `stop` - Called after native `touchend`. Emits `DraggableData`.


## useDraggableCore
Instead of using the wrapper component you can compose your own
draggable element using the useDraggableCore hook.
It will provide you with the necessary callbacks to make your element draggable (i.e., positions etc.).

```ts
// Return Type
interface UseDraggableCore {
  onMounted: () => void;
  onBeforeUnmount: () => void;
  onMouseUp: EventHandler<MouseTouchEvent>;
  onMouseDown: EventHandler<MouseTouchEvent>;
  onTouchEnd: EventHandler<MouseTouchEvent>;
  onTouchStart: EventHandler<MouseTouchEvent>;
}
```

## Directive
Lastly, you can just use the DraggableCoreDirective directly on your element.
The directive accepts `<DraggableCore>` props as a directive binding value.
It will bind the necessary events to the element but will not apply any transformation styles.

```vue {}[App.vue]
<template>
  <div 
    v-draggable-core="{}" /* Pass DraggableCoreProps here */" 
    @start="start" /* You can hook to events here too */
    @stop=""
    @move=""
    class="box"
  >
    I use a directive to make myself draggable
  </div>
</template>
<script>
... the rest of your code
```
