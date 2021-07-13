# Revue Draggable
![top-language](https://img.shields.io/github/languages/top/bcakmakoglu/revue-draggable)
[![dependencies Status](https://status.david-dm.org/gh/bcakmakoglu/revue-draggable.svg)](https://david-dm.org/bcakmakoglu/revue-draggable)
[![devDependencies Status](https://status.david-dm.org/gh/bcakmakoglu/revue-draggable.svg?type=dev)](https://david-dm.org/bcakmakoglu/revue-draggable?type=dev)
![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/bcakmakoglu/revue-draggable)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/bcakmakoglu/revue-draggable)
![GitHub last commit](https://img.shields.io/github/last-commit/bcakmakoglu/revue-draggable)

Make your Vue components draggable.
Based on [React Draggable](https://www.npmjs.com/package/react-draggable#draggablecore).
Check the React Draggable Docs for more info on props and usage. It's basically the same.

### Vue3
```bash
# install revue draggable
$ yarn add @braks/revue-draggable

# or
$ npm i --save @braks/revue-draggable
```

```vue
<template>
  <Draggable>
    <div>Drag me!</div>
  </Draggable>
</template>
<script>
import Draggable from '@braks/revue-draggable';

export default {
  components: { Draggable }
}
</script>
```

For full control use <DraggableCore> instead.
DraggableCore will simply abstract over touch and mouse events but provides no transformation.
Without callbacks, it does not provide any meaningful functionality.
Alternatively you can just use the useDraggable and useDraggableCore abstractions which will
provide you with the necessary callbacks and reactive fields to make your element draggable.

### Composition API / Vue2
```bash
# install revue flow
$ yarn add @braks/revue-draggable

# or
$ npm i --save @braks/revue-draggable
```

The components cannot be used in Vue2 as they're written in Vue3 JSX, which sadly is not downward compatible.
You can use the useDraggable and useDraggableCore hooks to add draggability to your elements.

```vue
<template>
  <div
      ref="dragme"
      :class="transform.value.class"
      :style="transform.value.style"
      @mousedown="onMouseDown"
      @mouseup="onMouseUp"
      @touchend="onTouchEnd"
  >
    Drag me please!
  </div>
</template>
<script>
import { useDraggable } from '@braks/revue-draggable';

export default {
  data() {
    return {
      // transform is of type Ref, so it's a reactive field that is passed back by useDraggable
      transform: {
        value: {}
      }  
    }
  },
  mounted() {
    const draggable = useDraggable(this.$refs.dragme, {});
    this.onMouseUp = draggable.core.onMouseUp;
    this.onMouseDown = draggable.core.onMouseDown;
    this.onTouchEnd = draggable.core.onTouchEnd;
    this.transform = draggable.transformation;
  },
  methods: {
    onMouseUp() {},
    onMouseDown() {},
    onTouchEnd() {}
  }
}
</script>
```

## Development
This project uses Vite for development and Rollup to create a distribution.

```bash
# start (dev)
$ yarn dev

# build app
$ yarn build

# serve app from build
$ yarn serve

# build dist
$ yarn build:dist
```
