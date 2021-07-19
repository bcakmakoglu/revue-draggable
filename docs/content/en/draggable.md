---
title: Draggable
description: 'Revue Draggable'
category: Guide
position: 2
---

A `<Draggable>` element wraps an existing element and extends it with new event handlers and styles. 
It does not create a wrapper element in the DOM.

Draggable items move using CSS Transforms.
This allows items to be dragged regardless of their current positioning (relative, absolute, or static). 
Elements can also be moved between drags without incident.

If the item you are dragging already has a CSS Transform applied, it will be overwritten by `<Draggable>`. 
Use an intermediate wrapper (`<Draggable><span>...</span></Draggable>`) in this case.

## Usage

View the [Demo](https://revue-draggable.vercel.app/) or its [source](https://github.com/bcakmakoglu/revue-draggable/blob/master/example/App.vue) for more examples.

```vue {}[App.vue]
<template>
  <Draggable :on-start="onStart" :on-stop="onStop">
    <div class="box">I can be dragged anywhere</div>
  </Draggable>
</template>

<script lang="ts">
import { defineComponent } from 'vue';
import Draggable from '@braks/revue-draggable';

export default defineComponent({
  name: 'App',
  components: {
    Draggable
  },
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

The <Draggable/> component transparently adds draggability to its children.

Note: Only a single child is allowed or an Error will be thrown.

For the <Draggable/> component to correctly attach itself to its child, the child element must provide support for the following props:

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

type DraggableEvent = {
    e: MouseTouchEvent;
    data: DraggableData;
};

type TransformedEvent = {
    style: Record<string, string> | false;
    transform: string | false;
    classes: {
        [x: string]: boolean;
    };
};

interface DraggableProps extends DraggableCoreProps {
    axis: 'both' | 'x' | 'y' | 'none';
    bounds: DraggableBounds | string | false;
    defaultClassName: string;
    defaultClassNameDragging: string;
    defaultClassNameDragged: string;
    defaultPosition: ControlPosition;
    positionOffset: PositionOffsetControlPosition;
    position: ControlPosition;
}

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
    props: {
        axis: {
            type: String as PropType<DraggableProps['axis']>,
            default: 'both'
        },
        bounds: {
            type: [Object, String, Boolean] as PropType<DraggableProps['bounds']>,
            default: false
        },
        defaultClassName: {
            type: String as PropType<DraggableProps['defaultClassName']>,
            default: 'revue-draggable'
        },
        defaultClassNameDragging: {
            type: String as PropType<DraggableProps['defaultClassNameDragging']>,
            default: 'revue-draggable-dragging'
        },
        defaultClassNameDragged: {
            type: String as PropType<DraggableProps['defaultClassNameDragged']>,
            default: 'revue-draggable-dragged'
        },
        defaultPosition: {
            type: Object as PropType<DraggableProps['defaultPosition']>,
            default: () => ({ x: 0, y: 0 })
        },
        scale: {
            type: Number as PropType<DraggableProps['scale']>,
            default: 1
        },
        position: {
            type: Object as PropType<DraggableProps['position']>,
            default: undefined
        },
        positionOffset: {
            type: Object as PropType<DraggableProps['positionOffset']>,
            default: undefined
        },
        allowAnyClick: {
            type: Boolean as PropType<DraggableProps['allowAnyClick']>,
            default: true
        },
        disabled: {
            type: Boolean as PropType<DraggableProps['disabled']>,
            default: false
        },
        enableUserSelectHack: {
            type: Boolean as PropType<DraggableProps['enableUserSelectHack']>,
            default: true
        },
        onStart: {
            type: Function as PropType<DraggableProps['onStart']>,
            default: () => {}
        },
        onDrag: {
            type: Function as PropType<DraggableProps['onDrag']>,
            default: () => {}
        },
        onStop: {
            type: Function as PropType<DraggableProps['onStop']>,
            default: () => {}
        },
        onMouseDown: {
            type: Function as PropType<DraggableProps['onMouseDown']>,
            default: () => {}
        },
        cancel: {
            type: String as PropType<DraggableProps['cancel']>,
            default: undefined
        },
        offsetParent: {
            type: Object as PropType<DraggableProps['offsetParent']>,
            default: () => {}
        },
        grid: {
            type: Array as unknown as PropType<DraggableProps['grid']>,
            default: undefined
        },
        handle: {
            type: String as PropType<DraggableProps['handle']>,
            default: undefined
        }
    }
}
```

### Events

Instead of passing callback functions you can use typical vue event handlers.
The drawback here is that `<Draggable>` allows you to return false from a callback to stop the update of the current event handler.
You might have to handle this case yourself if that is an issue or just pass the function as a prop.

```vue
<template>
  <Draggable @drag-start="dragStart">
    <div>Drag me!</div>
  </Draggable>
</template>
... the rest of your code

```

#### Emittable Events

* `drag-start` - Called after native `mousedown` or `touchstart` event and `start` event of `<DraggableCore>`. Emits `DraggableData`.
* `drag-move` - Called after native `mousemove` or `touchmove` event and `move` event of `<DraggableCore>`. Emits `DraggableData`.
* `drag-stop` - Called after native `mouseup` or `touchend` event and `stop` event of `<DraggableCore>`. Emits `DraggableData`.
* `transformed` - Called after the element has been transformed (i.e., styles to move it have been applied). Emits `TransformedData`

## useDraggable

Instead of using the wrapper component you can compose your own 
draggable element using the useDraggable hook.
If provided a valid node reference useDraggable will add all event handlers and
transformations directly onto the node.
```ts
// useDraggable return
export interface UseDraggable {
    onDragStart: EventHookOn<DraggableHook>;
    onDrag: EventHookOn<DraggableHook>;
    onDragStop: EventHookOn<DraggableHook>;
    onTransformed: EventHookOn<TransformedData>;
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
export default {
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

## Directive
Lastly, you have the option of just using the DraggableDirective directly on your element.
The directive accepts `<Draggable>` props as a directive binding value.
It will bind the necessary events to the element and will move it (i.e., apply transformation styles).
````vue {}[App.vue]
<template>
  <div 
    v-draggable="{ onStart, onStop } /* <- Pass DraggableProps as binding value here */" 
    class="box"
    @drag-start="" /* you can still hook to events */
    @drag=""
    @drag-stop="" 
   >
    I use a directive to make myself draggable
   </div>
</template>
<script>
... the rest of your code
````
