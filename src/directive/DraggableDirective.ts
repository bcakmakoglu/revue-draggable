import { VNode, DirectiveHook, Directive, isVue3 } from 'vue-demi'
import { DraggableOptions } from '~/utils/types'
import useDraggable from '~/hooks/useDraggable'
import useDraggableCore from '~/hooks/useDraggableCore'

const onMounted: DirectiveHook<HTMLElement | VNode, any, DraggableOptions> = (el, binding) => {
  const instance = getCurrentInstance()
  const emit =
    instance?.emit ??
    ((arg, data) => {
      const event = new CustomEvent(arg, { detail: data })
      ;(el as HTMLElement).dispatchEvent(event)
    })

  // sort of hacky but we don't want the directive to create multiple instances of the composable and thus apply multiple event listeners etc.
  if (binding.arg === 'core') {
    const { onDrag, onDragStop, onDragStart, state } = useDraggableCore(el, binding.value)
    onDrag((dragEvent) => {
      emit('move', dragEvent)
    })
    onDragStart((dragStartEvent) => {
      emit('start', dragStartEvent)
    })
    onDragStop((dragStopEvent) => {
      emit('stop', dragStopEvent)
    })
    // @ts-ignore
    el['revue-draggable'] = state
  } else {
    const { onDrag, onDragStop, onDragStart, onTransformed, state } = useDraggable(el, binding.value)
    onDrag((dragEvent) => {
      emit('move', dragEvent)
    })
    onDragStart((dragStartEvent) => {
      emit('start', dragStartEvent)
    })
    onDragStop((dragStopEvent) => {
      emit('stop', dragStopEvent)
    })
    onTransformed((transformEvent) => {
      emit('transformed', transformEvent)
    })
    // @ts-ignore
    el['revue-draggable'] = state
  }
}

const onUpdated: DirectiveHook<HTMLElement | VNode, any, DraggableOptions> = (el, binding) => {
  // typehack as we store the draggable instance on the element, see the comment above
  const element = el as any
  if (typeof element['revue-draggable'] !== 'undefined' && binding.value) {
    if (JSON.stringify(binding.value) !== JSON.stringify(binding.oldValue)) {
      const state = element['revue-draggable']
      state.value = { ...state.value, ...binding.value }
    }
  }
}

const DraggableDirective: Directive<HTMLElement | VNode, DraggableOptions> = {
  [isVue3 ? 'mounted' : 'inserted']: onMounted,
  [isVue3 ? 'beforeUpdate' : 'update']: onUpdated
}

export default DraggableDirective
