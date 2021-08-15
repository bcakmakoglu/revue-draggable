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
// Return type of draggable-core composable
interface UseDraggableCore {
    onDragStart: EventHookOn<DraggableEvent>;
    onDrag: EventHookOn<DraggableEvent>;
    onDragStop: EventHookOn<DraggableEvent>;
    state: Ref<Partial<DraggableState>>;
}

// Use this type as your event handler in your component, i.e. @start="handler" , handler should be of  type DraggableEventHandler 
type DraggableEventHandler = (e: MouseEvent, data: DraggableData) => void | false;

// Data returned from a DraggableEvent
type DraggableData = {
    node: HTMLElement;
    x: number;
    y: number;
    deltaX: number;
    deltaY: number;
    lastX: number;
    lastY: number;
};

interface DraggableEvent {
    event: MouseEvent;
    data: DraggableData;
}

// These options can be passed to any of the `DraggableCore` implementations
// So you can pass any of these options to the directive, component or composable
// i.e., v-draggable:core="options" | <DraggableCore :allowAnyClick="true" ... > | useDraggableCorenodeRef, options)
interface DraggableCoreOptions {
    // If set to `true`, will allow dragging on non left-button clicks.
    allowAnyClick: boolean;

    enableUserSelectHack: boolean;

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
    stop: DraggableEventHandler;
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
interface UseDraggableCore {
    onDragStart: EventHookOn<DraggableEvent>;
    onDrag: EventHookOn<DraggableEvent>;
    onDragStop: EventHookOn<DraggableEvent>;
    state: Ref<Partial<DraggableState>>;
}
```
