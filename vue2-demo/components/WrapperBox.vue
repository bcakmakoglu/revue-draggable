<template>
  <Draggable v-bind="draggableOptions" @start="start" @move="move" @stop="stop">
    <div :class="`bg-${color}`" class="wrapper-box">
      <div>
        <h2 class="flex items-center text-dark-800 text-2xl font-semibold mt-2 mb-0">
          {{ title }}
        </h2>
        <p class="text-dark-800 text-xl mt-2">{{ description }}</p>
        <slot></slot>
      </div>
    </div>
  </Draggable>
</template>
<script lang="ts">
import { defineComponent, ref } from '@vue/composition-api';
import { Draggable, DraggableEvent } from '@braks/revue-draggable';
import windiColors from 'windicss/colors';

export default defineComponent({
  components: { Draggable },
  props: {
    title: String,
    description: String,
    draggableOptions: Object
  },
  setup(props, { emit }) {
    const colors = {
      primary: {
        '50': '#fcf9ff',
        '100': '#f8f3ff',
        '200': '#eee1fe',
        '300': '#e4cffe',
        '400': '#cfaafd',
        '500': '#BB86FC',
        '600': '#a879e3',
        '700': '#8c65bd',
        '800': '#705097',
        '900': '#5c427b',
        DEFAULT: '#BB86FC'
      },
      secondary: {
        '50': '#c4fef9',
        '100': '#9df7ef',
        '200': '#77f0e4',
        '300': '#50e8da',
        '400': '#2ae1cf',
        '500': '#03dac5',
        '600': '#03ae9d',
        '700': '#028276',
        '800': '#02564e',
        '900': '#012a26',
        DEFAULT: '#03dac5'
      },
      accent: {
        '50': '#e6d4ff',
        '100': '#ccaafc',
        '200': '#b17ff8',
        '300': '#9755f5',
        '400': '#7c2af1',
        '500': '#6200ee',
        '600': '#5000c1',
        '700': '#3d0095',
        '800': '#2b0068',
        '900': '#18003b',
        DEFAULT: '#6200ee'
      },
      light: windiColors.light,
      gray: windiColors.coolGray,
      blue: windiColors.lightBlue,
      red: windiColors.rose,
      pink: windiColors.fuchsia,
      indigo: windiColors.indigo,
      orange: windiColors.orange,
      amber: windiColors.amber
    };
    const randomInt = (min: number, max: number) => {
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

    const start = (e: DraggableEvent) => {
      emit('start', e, props.title);
    };
    const move = (e: DraggableEvent) => {
      emit('move', e, props.title);
    };
    const stop = (e: DraggableEvent) => {
      emit('stop', e);
    };

    return {
      color: randomColor(),
      start,
      move,
      stop
    };
  }
});
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
