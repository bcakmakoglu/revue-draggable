import { PropType, isVue3 } from 'vue-demi'
import { DraggableCoreOptions } from '../utils'
import { useDraggableCore } from '../composables'

const DraggableCore = defineComponent({
  name: 'DraggableCore',
  props: {
    scale: {
      type: Number as PropType<DraggableCoreOptions['scale']>,
      default: 1
    },
    allowAnyClick: {
      type: Boolean as PropType<DraggableCoreOptions['allowAnyClick']>,
      default: true
    },
    disabled: {
      type: Boolean as PropType<DraggableCoreOptions['disabled']>,
      default: false
    },
    enableUserSelectHack: {
      type: Boolean as PropType<DraggableCoreOptions['enableUserSelectHack']>,
      default: true
    },
    cancel: {
      type: String as PropType<DraggableCoreOptions['cancel']>,
      default: undefined
    },
    offsetParent: {
      type: Object as PropType<DraggableCoreOptions['offsetParent']>,
      default: undefined
    },
    grid: {
      type: Array as unknown as PropType<DraggableCoreOptions['grid']>,
      default: undefined
    },
    handle: {
      type: String as PropType<DraggableCoreOptions['handle']>,
      default: undefined
    },
    onStart: {
      type: Function as PropType<DraggableCoreOptions['start']>,
      default: () => {}
    },
    onMove: {
      type: Function as PropType<DraggableCoreOptions['move']>,
      default: () => {}
    },
    onStop: {
      type: Function as PropType<DraggableCoreOptions['stop']>,
      default: () => {}
    },
    onMouseDown: {
      type: Function as PropType<DraggableCoreOptions['mouseDown']>,
      default: () => {}
    }
  },
  emits: ['start', 'move', 'stop'],
  setup(props, { slots, emit, attrs }) {
    const target = templateRef('core-target', null)

    const { onDrag, onDragStart, onDragStop, state } = useDraggableCore(target, props)

    onDrag((dragEvent) => emit('move', dragEvent))

    onDragStart((dragStartEvent) => emit('start', dragStartEvent))

    onDragStop((dragStopEvent) => emit('stop', dragStopEvent))

    watch(
      () => props,
      (val) => Object.assign(state, val),
      { deep: true, flush: 'post' }
    )

    if (isVue3) {
      return () => {
        if (slots.default) {
          return h(slots.default()[0], { ref: 'core-target', ...attrs }, {})
        }
      }
    } else {
      return () => {
        if (slots.default) {
          return h('div', { ref: 'core-target', ...attrs }, slots.default())
        }
      }
    }
  }
})

export default DraggableCore
