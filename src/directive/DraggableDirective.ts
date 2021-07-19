import { Directive, DirectiveHook, getCurrentInstance, isVue3, VNode } from 'vue-demi';
import { DraggableOptions, UseDraggable } from '../utils/types';
import useDraggable from '../hooks/useDraggable';
import useDraggableCore from '../hooks/useDraggableCore';

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
    const { onDrag, onDragStop, onDragStart, updateState } = useDraggableCore(el, { ...binding.value });
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
    el['revue-draggable'] = updateState;
  } else {
    const { onDrag, onDragStop, onDragStart, updateState, onTransformed } = useDraggable(el, { ...binding.value });
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
    el['revue-draggable'] = updateState;
  }
};

const onUpdated: DirectiveHook<HTMLElement | VNode, any, DraggableOptions> = (el, binding) => {
  // typehack as we store the draggable instance on the element, see the comment above
  const element = el as any;
  if (typeof element['revue-draggable'] !== 'undefined' && binding.value) {
    const updateState = element['revue-draggable'] as UseDraggable['updateState'];
    updateState(binding.value);
  }
};

const DraggableDirective: Directive<HTMLElement | VNode, DraggableOptions> = {
  [isVue3 ? 'mounted' : 'inserted']: onMounted,
  [isVue3 ? 'updated' : 'componentUpdated']: onUpdated
};

export default DraggableDirective;
