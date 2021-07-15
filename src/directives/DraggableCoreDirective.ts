import { Directive, DirectiveHook, getCurrentInstance, isVue3 } from 'vue-demi';
import { DraggableCoreProps, EventHandler } from '../utils/types';
import useDraggableCore from '../hooks/useDraggableCore';

const draggableCoreDirective: DirectiveHook<HTMLElement, any, DraggableCoreProps> = (el, binding) => {
  const instance = getCurrentInstance();
  const draggable = useDraggableCore({
    ...binding.value,
    nodeRef: el
  });
  if (instance && instance.isUnmounted) {
    draggable.onBeforeUnmount();
    return;
  }
  el.onmousedown = draggable.onMouseDown as EventHandler<MouseEvent>;
  el.onmouseup = draggable.onMouseUp as EventHandler<MouseEvent>;
  el.ontouchend = draggable.onTouchEnd as EventHandler<TouchEvent>;
  el.dispatchEvent(new CustomEvent('draggableCore', { detail: draggable }));
};
const DraggableCoreDirective: Directive<HTMLElement, DraggableCoreProps> = {
  [isVue3 ? 'mounted' : 'inserted']: draggableCoreDirective
};

export default DraggableCoreDirective;
