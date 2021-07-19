---
title: DraggableCore
description: 'Revue Draggable'
category: Guide
position: 3
---

For users that require absolute control, the `core` argument can be passed to `v-draggable` (i.e., `v-draggable:core`).
Or you can use the composable `useDraggableCore`.
This is useful as an abstraction over touch and mouse events, but with full control.

Revue Draggable Core is a useful building block for other libraries that simply want to abstract browser-specific quirks and receive callbacks when a user attempts to move an element. 
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
    nodeRef: HTMLElement;
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
```vue
<template>
  <div v-draggable:core @core-start="start">Drag me!</div>
</template>
... the rest of your code

```

#### Emittable Events

* `core-start` - Called after native `mousedown`. Emits `DraggableData`.
* `core-move` - Called after native `mouseup`. Emits `DraggableData`.
* `core-stop` - Called after native `touchend`. Emits `DraggableData`.


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
    updateState: (state: Partial<DraggableState>) => Partial<DraggableState> | void;
}

// useDraggableCore return
export type UseDraggableCore = Omit<UseDraggable, 'onTransformed'>;
```
