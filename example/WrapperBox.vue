<template>
  <Draggable v-bind="draggableOptions" @start="start" @move="move" @stop="stop">
    <div :class="`bg-${color}`" class="wrapper-box">
      <div>
        <h2 class="flex items-center text-dark-800 text-2xl font-semibold mt-2 mb-0">
          {{ title }}
        </h2>
        <InfoIcon class="fixed right-8 top-6 cursor-info" @click="showInfo = true" />
        <p class="text-dark-800 text-xl mt-2">{{ description }}</p>
        <slot></slot>
      </div>
      <InfoBox :info="info" :color="color" :title="title" :show="showInfo" @close="showInfo = false" />
    </div>
  </Draggable>
</template>
<script lang="ts">
import { Draggable } from '../src';
import { colors } from './colors';
import InfoBox from './InfoBox.vue';
import InfoIcon from './assets/info.svg';

export default {
  components: { InfoBox, Draggable, InfoIcon },
  emits: ['start', 'move', 'stop'],
  props: {
    title: String,
    description: String,
    draggableOptions: Object,
    info: String
  },
  data() {
    return {
      showInfo: false
    };
  },
  methods: {
    start(e) {
      this.$emit('start', e, this.title);
    },
    move(e) {
      this.$emit('move', e, this.title);
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
<style>
.wrapper-box {
  @apply max-w-70 lg:max-w-xs
  h-60
  w-xs
  py-4
  px-8
  shadow-lg
  rounded-2xl
  mx-4
  my-2
  mix-blend-normal
  border-solid border-black border-1/2;
}

.cursor-info {
  cursor: url("data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg'  width='40' height='48' viewport='0 0 100 100' style='fill:black;font-size:24px;'><text y='50%'>🕵🏻‍♂️</text></svg>")
      16 0,
    auto;
}

.revue-draggable-dragging {
  z-index: 999;
}
</style>
