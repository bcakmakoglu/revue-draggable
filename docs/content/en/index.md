---
title: Introduction 
description: 'Revue Draggable' 
category: ''
position: 1 
features:
- Make any element (including svg) draggable
- Use the Core to gain full control
- Built for composition
- Supports Vue2 and Vue3! No Problemo!
---

**Make your Vue components draggable. 🤏**

**Supports Vue 2 and Vue 3!** Comes with a 🔋 batteries included component / directive / composable or for users who
want more control a simple abstraction over drag events with the core, wich is also available as a component / directive
/ composable.

Based on [React Draggable](https://www.npmjs.com/package/react-draggable#draggablecore).

## Features

<list :items="features"></list>

Check the [Repo 🛠](https://github.com/bcakmakoglu/revue-draggable) and
the [Demo 🪄](https://revue-draggable.vercel.app/) to see Revue Draggable in action.

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
### Using the components
#### Webpack (Vue2)
You'll need to include the full build if you're on Vue2.
I urge you to instead use the composables or the directive.
```js
// webpack.config.js

resolve: {
    alias: {
        vue: 'vue/dist/vue.js'
    }
}
```

#### [Nuxt](https://nuxtjs.org/)
```ts {}[nuxt.config.ts]
// nuxt.config.ts
export default {
    alias: {
        vue: 'vue/dist/vue.js'
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

// or
app.directive('draggable', DraggableDirective)
app.component('Draggable', Draggable);

app.mount('#root');
```

```ts {}[main.ts]
// Vue2 
import Vue from 'vue';
import { DraggablePlugin, DraggableDirective } from '@braks/revue-draggable';

// Use as Plugin
Vue.use(DraggablePlugin)

// or
Vue.directive('draggable', DraggableDirective)
Vue.component('Draggable', Draggable)
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

Or use the component wrapper.
(Though if you're on Vue2 I urge you not to use it, as you'll have to depend on the runtime compiler for it).
````vue {}[App.vue]
<template>
  <Draggable>
    <div class="box">I use a wrapper</div>
  </Draggable>
</template>
<script>
... the rest of your code
````

Check [the example file](./example/App.vue) for more in-detail examples like dropping elements, setting boundaries or syncing states.

## 🐛 Debugging
Set the environment variable `DRAGGABLE_DEBUG` to enable logs on drag handlers.

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

## 🕵🏻‍♂️ Tests
Testing is done with Cypress.
You can find the specs in the [cypress directory](/cypress);
```bash
$ yarn ci // starts test server and runs tests, make sure port 3000 is open
```
