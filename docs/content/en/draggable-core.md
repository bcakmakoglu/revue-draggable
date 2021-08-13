---
title: DraggableCore
description: 'Revue Draggable'
category: Guide
position: 3
---

For users that require absolute control, the `DraggableCore` is provided.
You can use it either as a component `DraggableCore`, a directive `v-draggable:core` or composable `useDraggableCore`.
This is useful as an abstraction over touch and mouse events, but with full control.

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

export interface DraggableCoreOptions {
    allowAnyClick: boolean;
    enableUserSelectHack: boolean;
    disabled: boolean;
    update: boolean;
    offsetParent?: HTMLElement;
    grid?: [number, number];
    handle: string;
    cancel: string;
    scale: number;
    start: DraggableEventHandler;
    move: DraggableEventHandler;
    stop: DraggableEventHandler;
}

type DraggableCoreState = State & DraggableCoreOptions;

interface State {
    dragging: boolean;
    dragged: boolean;
    slackX: number;
    slackY: number;
    touch?: number;
}
```

<alert>

Note that there is no start position.
`<DraggableCore>` simply calls drag handlers with the below parameters,
indicating its position (as inferred from the underlying MouseEvent) and deltas.
It is up to the parent to set actual positions on `<DraggableCore>`.

</alert>

### Events
```vue
<template>
  <div v-draggable:core @start="start">Drag me!</div>
</template>
... the rest of your code

```

#### Emittable Events

* `start` - Called after native `mousedown`. Emits `DraggableEvent`.
* `move` - Called after native `mouseup`. Emits `DraggableEvent`.
* `stop` - Called after native `touchend`. Emits `DraggableEvent`.


## useDraggableCore

Instead of using the directive you can compose your own
draggable element using the useDraggable hook.
It will add the necessary events directly to the node to receive the data to make it draggable (i.e., positions etc.).

```ts
interface UseDraggable {
    onDragStart: EventHookOn<DraggableHook>;
    onDrag: EventHookOn<DraggableHook>;
    onDragStop: EventHookOn<DraggableHook>;
    onTransformed: EventHookOn<TransformedData>;
    state: Ref<DraggableState>;
}

// useDraggableCore hooks
export type UseDraggableCore = Omit<UseDraggable, 'onTransformed'>;
```
