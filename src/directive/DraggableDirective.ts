import { Directive, DirectiveHook, isVue3, VNode } from 'vue-demi';
import { DraggableProps, UseDraggable } from '../utils/types';
import useDraggable from '../hooks/useDraggable';
import useDraggableCore from '../hooks/useDraggableCore';

const onMounted: DirectiveHook<HTMLElement | VNode, any, DraggableProps> = (el, binding) => {
  const options: Partial<DraggableProps> = {
    ...binding.value,
    nodeRef: el as HTMLElement
  };

  // sort of hacky but we don't want the directive to create multiple instances of the composable and thus apply multiple event listeners etc.
  if (binding.arg === 'core') {
    // @ts-ignore
    el['revue-draggable'] = useDraggableCore(options);
  } else {
    // @ts-ignore
    el['revue-draggable'] = useDraggable(options);
  }
};

const onUpdated: DirectiveHook<HTMLElement | VNode, any, DraggableProps> = (el, binding) => {
  // typehack as we store the draggable instance on the element, see the comment above
  const element = el as any;
  if (typeof element['revue-draggable'] !== 'undefined' && binding.value) {
    const { updateState } = element['revue-draggable'] as UseDraggable;
    updateState(binding.value);
  }
};

const onUnmounted: DirectiveHook<HTMLElement | VNode, any, DraggableProps> = (el) => {
  const element = el as any;
  if (typeof element['revue-draggable'] !== 'undefined') {
    delete element['revue-draggable'];
  }
};

const DraggableDirective: Directive<HTMLElement | VNode, DraggableProps> = {
  [isVue3 ? 'mounted' : 'inserted']: onMounted,
  [isVue3 ? 'updated' : 'componentUpdated']: onUpdated,
  [isVue3 ? 'unmounted' : 'unbind']: onUnmounted
};

export default DraggableDirective;
