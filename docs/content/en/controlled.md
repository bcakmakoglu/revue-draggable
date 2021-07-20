---
title: Controlled vs. Uncontrolled
description: 'Revue Draggable'
category: Guide
position: 4
---

`<Draggable>` / `v-draggable` / `useDraggable` are a 'batteries-included' implementation that manages its own state.
They do not create a wrapper DOM element.
If you want to completely control the lifecycle of the component, use `<DraggableCore>` / `v-draggable:core` or `useDraggableCore`.

For some users, they may want the nice state management that `<Draggable>` provides,
but occasionally want to programmatically reposition their components.
`<Draggable>` allows this customization.

If the prop position: {x: number, y: number} is defined,
the `<Draggable>` will ignore its internal state and use the provided position instead.
Alternatively, you can seed the position using defaultPosition.
Technically, since `<Draggable>` works only on position deltas, you could also seed the initial position using CSS top/left.
We allow dragging while a component is controlled.
We then expect you to use at least an onDrag or onStop handler to synchronize state.

To disable dragging while controlled, send the prop disabled = true -
at this point the `<Draggable>` will operate like a completely static component.
