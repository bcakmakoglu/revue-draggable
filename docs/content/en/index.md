---
title: Introduction
description: 'Revue Draggable'
category: ''
position: 1
features:
- Make any element (including svg) draggable
- Add your own Callbacks, extend Events
- Use the Core for full control
- Built for composition
- Usable in Vue3 (component, directive, hooks)
- Usable in Vue2 (directive, hooks)
---

Make your Vue components draggable.
Based on [React Draggable](https://www.npmjs.com/package/react-draggable#draggablecore).

[Demo](https://revue-draggable.vercel.app/)
[Repo](https://github.com/bcakmakoglu/revue-draggable)

## Features

<list :items="features"></list>

## 🛠 Setup

```bash
# install revue draggable
$ yarn add @braks/revue-draggable

# or
$ npm i --save @braks/revue-draggable
```

For Vue2 add the composition-api to your dependencies.
```bash
# install revue flow
$ yarn add @braks/revue-draggable @vue/composition-api

# or
$ npm i --save @braks/revue-draggable @vue/composition-api
```

For [Nuxt](https://nuxtjs.org/) make sure to include
```ts {}[nuxt.config.ts]
// nuxt.config.ts
export default {
    build: {
        transpile: ['@braks/revue-draggable']
    }
}
```

### 🔌 Registering Draggable

```ts {}[main.ts]
// Vue3
import { createApp } from 'vue';
import Draggable, { DraggablePlugin, DraggableDirective } from '@braks/revue-draggable';

const app = createApp();

// Use as Plugin (registers directives and components)
app.use(DraggablePlugin);

// or register only what you need
app.directive('draggable', DraggableDirective)
app.component('Draggable', Draggabl)

app.moun('#root');
```

```ts {}[main.ts]
// Vue2 
import Vue from 'vue';
import { DraggablePlugin, DraggableDirective } from '@braks/revue-draggable';

// Use as Plugin
Vue.use(DraggablePlugin)

// or
Vue.directive('draggable', DraggableDirective)
// Vue.component('Draggable, Draggable) <Draggable> components should not be registered in Vue2, as it won't work.
```

## 🎮 Quickstart

The easiest way to make your elements draggable is by using the **DraggableDirective** which will handle everything for you
with no configuration necessary.

````vue {}[App.vue]
<template>
  <div v-draggable="/* Pass DraggableProps as binding value here */" class="box">I use a directive to make myself draggable</div>
</template>
<script>
... the rest of your code
````

### 📝 Examples

### Vue3

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

For full control use `<DraggableCore>` instead. DraggableCore will simply abstract over touch and mouse events but provides
no transformation. Without callbacks, it does not provide any meaningful functionality. Alternatively you can just use
the useDraggable and useDraggableCore abstractions which will provide you with the necessary callbacks and reactive
fields to make your element draggable.

### Vue2

The components cannot be used in Vue2 as they're written in Vue3 JSX, which sadly is not downward compatible. You can
use the useDraggable and useDraggableCore hooks to add draggability to your elements.

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
import {useDraggable} from '@braks/revue-draggable';

export default {
  mounted() {
    const draggable = useDraggable(this.$refs.dragme, {});
    this.onMouseUp = draggable.core.onMouseUp;
    this.onMouseDown = draggable.core.onMouseDown;
    this.onTouchEnd = draggable.core.onTouchEnd;
  },
  methods: {
    onMouseUp() {
    },
    onMouseDown() {
    },
    onTouchEnd() {
    }
  }
}
</script>
```

## 🧪 Development
This project uses [Vite](https://vitejs.dev/) for development and [Rollup](https://rollupjs.org/) to create a distribution.

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
