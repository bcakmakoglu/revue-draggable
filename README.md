![Revue Draggable](./docs/static/revue-draggable.gif)

![top-language](https://img.shields.io/github/languages/top/bcakmakoglu/revue-draggable)
[![dependencies Status](https://status.david-dm.org/gh/bcakmakoglu/revue-draggable.svg)](https://david-dm.org/bcakmakoglu/revue-draggable)
[![devDependencies Status](https://status.david-dm.org/gh/bcakmakoglu/revue-draggable.svg?type=dev)](https://david-dm.org/bcakmakoglu/revue-draggable?type=dev)
![vulnerabilities](https://img.shields.io/snyk/vulnerabilities/github/bcakmakoglu/revue-draggable)
![GitHub code size in bytes](https://img.shields.io/github/languages/code-size/bcakmakoglu/revue-draggable)
![GitHub last commit](https://img.shields.io/github/last-commit/bcakmakoglu/revue-draggable)

**Make your Vue components draggable. 🤏**

**Supports Vue 2 and Vue 3!** Comes with a 🔋 batteries included component / directive / composable or
for users who want more control a simple abstraction over drag events with the core, wich is also available
as a component / directive / composable.

Based on [React Draggable](https://www.npmjs.com/package/react-draggable#draggablecore).

Check the [Docs 📔](https://revue-draggable-docs.vercel.app/) for an in-depth explanation and
the [Demo 🪄](https://revue-draggable.vercel.app/) to see Revue Draggable in action.

## Table of Contents

* [🛠 Setup](#-setup)

    * [Registering Revue Draggable ](#-registering-revue-draggable)

* [🎮 Quickstart](#-quickstart)

* [🧪 Development](#-development)

* [🕵🏻‍♂️ Tests](#-tests)

* [💝 Sponsors](#-sponsors)

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

### 🔌 Registering Revue Draggable 

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
(In Vue2 make sure to include the full-build, runtime-build only works for Vue3.)
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

## 🐛 Debugging

Set the environment variable `DRAGGABLE_DEBUG` to enable logs on drag handlers.

## 🕵🏻‍♂️ Tests

Testing is done with Cypress.
You can find the specs in the [cypress directory](/cypress);
```bash
$ yarn ci # starts test server and runs tests, make sure port 3000 is open
```

# 💝 Sponsors

Special thanks go to sponsors!
[jfrueh](https://github.com/jfrueh)
