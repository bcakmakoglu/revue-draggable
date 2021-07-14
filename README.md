# Revue Draggable
![top-language](https://img.shields.io/github/languages/top/bcakmakoglu/revue-draggable)
[![dependencies Status](https://status.david-dm.org/gh/bcakmakoglu/revue-draggable.svg)](https://david-dm.org/bcakmakoglu/revue-draggable)
[![devDependencies Status](https://status.david-dm.org/gh/bcakmakoglu/revue-draggable.svg?type=dev)](https://david-dm.org/bcakmakoglu/revue-draggable?type=dev)
![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/bcakmakoglu/revue-draggable)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/bcakmakoglu/revue-draggable)
![GitHub last commit](https://img.shields.io/github/last-commit/bcakmakoglu/revue-draggable)

Make your Vue components draggable.
Based on [React Draggable](https://www.npmjs.com/package/react-draggable#draggablecore).
Check the [Docs](https://revue-draggable-docs.vercel.app/) for an in-depth explanation.

### Install
```bash
# install revue draggable
$ yarn add @braks/revue-draggable

# or
$ npm i --save @braks/revue-draggable
```

If you plan to use Vue2, add the composition api to your dependencies.
```bash
# install revue flow
$ yarn add @braks/revue-draggable @vue/composition-api

# or
$ npm i --save @braks/revue-draggable @vue/composition-api
```


## Quickstart
The easiest way to make your elements draggable is by using the DraggableDirective
which will handle everything for you with no configuration necessary.

````vue {}[App.vue]
<template>
  <div v-draggable="/* Pass DraggableProps as binding value here */" class="box">I use a directive to make myself draggable</div>
</template>
<script>
... the rest of your code
````

### Example usage (Vue3)
```vue {}[App.vue]
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

For full control use DraggableCore instead.
DraggableCore will simply abstract over touch and mouse events but provides no transformation.
Without callbacks, it does not provide any meaningful functionality.
Alternatively you can just use the useDraggable and useDraggableCore abstractions which will
provide you with the necessary callbacks and reactive fields to make your element draggable.

### Vue2
The components cannot be used in Vue2 as they're written in Vue3 JSX, which sadly is not downward compatible.
You can use the useDraggable and useDraggableCore hooks to add draggability to your elements.

```vue
<template>
  <div
      ref="dragme"
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
  mounted() {
    const draggable = useDraggable(this.$refs.dragme, {});
    this.onMouseUp = draggable.core.onMouseUp;
    this.onMouseDown = draggable.core.onMouseDown;
    this.onTouchEnd = draggable.core.onTouchEnd;
  },
  methods: {
    onMouseUp() {},
    onMouseDown() {},
    onTouchEnd() {}
  }
}
</script>
```

## Plugin
You can add Revue Draggable as a Plugin to your Vue app.

```ts {}[main.ts]
import { createApp } from 'vue';
import { DraggablePlugin } from '@braks/revue-draggable';

const app = createApp();
app.use(DraggablePlugin);
app.moun('#root');
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
