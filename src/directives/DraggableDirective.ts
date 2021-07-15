import { Directive, DirectiveHook, isVue3 } from 'vue-demi';
import { DraggableProps, EventHandler } from '../utils/types';
import useDraggable from '../hooks/useDraggable';

const draggableDirective: DirectiveHook<HTMLElement, any, DraggableProps> = (el, binding) => {
  const draggable = useDraggable({
    ...binding.value,
    nodeRef: el
  });
  el.onmousedown = draggable.core.onMouseDown as EventHandler<MouseEvent>;
  el.onmouseup = draggable.core.onMouseUp as EventHandler<MouseEvent>;
  el.ontouchend = draggable.core.onTouchEnd as EventHandler<TouchEvent>;
  el.dispatchEvent(new CustomEvent('draggable', { detail: draggable }));
  draggable.onUpdated();
};
const DraggableDirective: Directive<HTMLElement, DraggableProps> = {
  [isVue3 ? 'mounted' : 'inserted']: draggableDirective
};

export default DraggableDirective;
