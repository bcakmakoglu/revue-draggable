import { Directive, DirectiveHook, getCurrentInstance, isVue3 } from 'vue-demi';
import { DraggableProps, EventHandler } from '../utils/types';
import useDraggable from '../hooks/useDraggable';

const draggableDirective: DirectiveHook<HTMLElement, any, DraggableProps> = (el, binding) => {
  const instance = getCurrentInstance();
  const draggable = useDraggable({
    ...binding.value,
    nodeRef: el
  });
  if (instance && instance.isUnmounted) {
    draggable.onBeforeUnmount();
  } else {
    el.onmousedown = draggable.core.onMouseDown as EventHandler<MouseEvent>;
    el.onmouseup = draggable.core.onMouseUp as EventHandler<MouseEvent>;
    el.ontouchend = draggable.core.onTouchEnd as EventHandler<TouchEvent>;
    draggable.onUpdated();
  }
};
const DraggableDirective: Directive<HTMLElement, DraggableProps> = {
  [isVue3 ? 'mounted' : 'inserted']: draggableDirective
};

export default DraggableDirective;
