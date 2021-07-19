---
title: Controlled vs. Uncontrolled
description: 'Revue Draggable'
category: Guide
position: 4
---

`v-draggable` or `useDraggable` is a 'batteries-included' function that manages its own state. 
If you want to completely control the lifecycle of the element, use `v-draggable:core` or `useDraggableCore`.

For some users, they may want the nice state management that `v-draggable` or `useDraggable` provides, 
but occasionally want to programmatically reposition their components. 
`v-draggable` or `useDraggable` allows this customization.

If the prop position: {x: number, y: number} is defined, 
the `v-draggable` or `useDraggable` will ignore its internal state and use the provided position instead. 
Alternatively, you can seed the position using defaultPosition. 
Technically, since `v-draggable` or `useDraggable` works only on position deltas, you could also seed the initial position using CSS top/left.
We allow dragging while a component is controlled. 
We then expect you to use at least an onDrag or onStop handler to synchronize state.

To disable dragging while controlled, send the prop disabled = true - 
at this point the `v-draggable` or `useDraggable`` will operate like a completely static component.
