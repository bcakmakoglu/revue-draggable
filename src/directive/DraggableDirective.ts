import { Directive, DirectiveHook, getCurrentInstance, isVue3, Ref, VNode } from 'vue-demi';
import { DraggableOptions, DraggableState } from '../utils/types';
import useDraggable from '../hooks/useDraggable';
import useDraggableCore from '../hooks/useDraggableCore';
import equal from 'fast-deep-equal/es6';

const onMounted: DirectiveHook<HTMLElement | VNode, any, DraggableOptions> = (el, binding) => {
  const instance = getCurrentInstance();
  const emitter =
    instance?.emit ??
    ((arg, data) => {
      const event = new CustomEvent(arg, { detail: data });
      (el as HTMLElement).dispatchEvent(event);
    });

  // sort of hacky but we don't want the directive to create multiple instances of the composable and thus apply multiple event listeners etc.
  if (binding.arg === 'core') {
    const { onDrag, onDragStop, onDragStart, state } = useDraggableCore(el, { ...binding.value });
    onDrag((dragEvent) => {
      emitter('move', dragEvent);
    });
    onDragStart((dragStartEvent) => {
      emitter('start', dragStartEvent);
    });
    onDragStop((dragStopEvent) => {
      emitter('stop', dragStopEvent);
    });
    // @ts-ignore
    el['revue-draggable'] = state;
  } else {
    const { onDrag, onDragStop, onDragStart, onTransformed, state } = useDraggable(el, { ...binding.value });
    onDrag((dragEvent) => {
      emitter('move', dragEvent);
    });
    onDragStart((dragStartEvent) => {
      emitter('start', dragStartEvent);
    });
    onDragStop((dragStopEvent) => {
      emitter('stop', dragStopEvent);
    });
    onTransformed((transformEvent) => {
      emitter('transformed', transformEvent);
    });
    // @ts-ignore
    el['revue-draggable'] = state;
  }
};

const onUpdated: DirectiveHook<HTMLElement | VNode, any, DraggableOptions> = (el, binding) => {
  // typehack as we store the draggable instance on the element, see the comment above
  const element = el as any;
  if (typeof element['revue-draggable'] !== 'undefined' && binding.value) {
    const state = element['revue-draggable'] as Ref<Partial<DraggableState>>;
    const updatedState = { ...state.value, ...binding.value };
    if (equal(state.value, updatedState)) return;
    state.value = updatedState;
  }
};

const DraggableDirective: Directive<HTMLElement | VNode, DraggableOptions> = {
  [isVue3 ? 'mounted' : 'inserted']: onMounted,
  [isVue3 ? 'beforeUpdate' : 'update']: onUpdated
};

export default DraggableDirective;
