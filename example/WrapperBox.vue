<template>
  <Draggable v-bind="draggableOptions" @start="start" @move="move" @stop="stop">
    <div
      style="z-index: 0"
      :class="`bg-${color}`"
      class="max-w-xs h-60 w-xs py-4 px-8 shadow-lg rounded-2xl mx-4 my-2 mix-blend-normal border-solid border-black border-1/2"
    >
      <div>
        <h2 class="text-dark-800 text-2xl font-semibold mt-2 mb-0">{{ title }}</h2>
        <p class="text-dark-800 text-xl mt-2">{{ description }}</p>
        <slot></slot>
      </div>
    </div>
  </Draggable>
</template>
<script lang="ts">
import { Draggable } from '../src';
import { colors } from './colors';

export default {
  components: { Draggable },
  emits: ['start', 'move', 'stop'],
  props: {
    title: String,
    description: String,
    draggableOptions: Object
  },
  data() {
    return {
      state: {}
    };
  },
  methods: {
    start(e) {
      this.$emit('start', e);
    },
    move(e) {
      this.$emit('move', e);
    },
    stop(e) {
      this.$emit('stop', e);
    }
  },
  setup() {
    const randomInt = (min, max) => {
      min = Math.ceil(min);
      max = Math.floor(max);
      return Math.floor(Math.random() * (max - min + 1)) + min;
    };
    const shuffle = (a: string[]) => {
      for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
      }
      return a;
    };
    const randomColor = () => {
      const keys = shuffle(Object.keys(colors));
      const bgKey = randomInt(3, 6);
      return `${keys[randomInt(0, keys.length)] || 'pink'}-${bgKey}00` || '#fff';
    };

    return {
      color: randomColor()
    };
  }
};
</script>
