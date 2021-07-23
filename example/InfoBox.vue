<template>
  <div>
    <teleport to="body">
      <div
        v-if="show"
        class="
          overflow-x-hidden overflow-y-auto
          fixed
          inset-0
          z-50
          outline-none
          focus:outline-none
          justify-center
          items-center
          flex
        "
      >
        <div class="relative w-auto my-6 mx-auto max-w-6xl">
          <!--content-->
          <div class="border-0 rounded-lg shadow-lg relative flex flex-col w-full bg-white outline-none focus:outline-none">
            <!--header-->
            <div
              :class="`bg-${color}`"
              class="flex items-start justify-between p-5 border-b border-solid border-blueGray-200 rounded-t"
            >
              <h3 class="text-3xl font-semibold">{{ title }}</h3>
              <button
                class="
                  p-1
                  ml-auto
                  bg-transparent
                  border-0
                  text-black
                  opacity-5
                  float-right
                  text-3xl
                  leading-none
                  font-semibold
                  outline-none
                  focus:outline-none
                "
                @click="close"
              >
                <span class="bg-transparent text-black opacity-5 h-6 w-6 text-2xl block outline-none focus:outline-none">
                  ×
                </span>
              </button>
            </div>
            <!--body-->
            <div class="relative p-6 flex-auto">
              <pre><code> {{ info }}</code></pre>
            </div>
            <!--footer-->
            <div class="flex items-center justify-end p-6 border-t border-solid border-blueGray-200 rounded-b">
              <button
                class="
                  text-red-500
                  bg-transparent
                  border border-solid border-red-500
                  hover:bg-red-500 hover:text-white
                  active:bg-red-600
                  font-bold
                  uppercase
                  text-sm
                  px-6
                  py-3
                  rounded
                  outline-none
                  focus:outline-none
                  mr-1
                  mb-1
                  ease-linear
                  transition-all
                  duration-150
                "
                type="button"
                @click="close"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
      <div v-if="show" class="opacity-25 fixed inset-0 z-40 bg-black"></div>
    </teleport>
  </div>
</template>

<script>
export default {
  name: 'InfoBox',
  emits: ['close'],
  props: {
    title: String,
    info: String,
    color: String,
    show: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const close = () => emit('close');

    return { close };
  }
};
</script>
<style>
pre {
  white-space: pre-wrap;
  background: hsl(30, 80%, 90%);
}
</style>
