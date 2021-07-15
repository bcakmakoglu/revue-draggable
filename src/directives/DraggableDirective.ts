import { Directive, DirectiveHook, getCurrentInstance, isVue3 } from 'vue-demi';
import { DraggableProps, EventHandler, MouseTouchEvent } from '../utils/types';
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
    el.onmousedown = (e) => {
      draggable.core.onMouseDown(e as MouseTouchEvent);
      instance?.emit('mousedown', e);
    };
    el.onmouseup = draggable.core.onMouseUp as EventHandler<MouseEvent>;
    el.ontouchend = draggable.core.onTouchEnd as EventHandler<TouchEvent>;
    el.dispatchEvent(new CustomEvent('draggable', { detail: draggable }));
    draggable.onUpdated();
  }
};
const DraggableDirective: Directive<HTMLElement, DraggableProps> = {
  [isVue3 ? 'mounted' : 'inserted']: draggableDirective
};

export default DraggableDirective;
