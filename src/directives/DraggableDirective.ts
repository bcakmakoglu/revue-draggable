import { Directive, DirectiveHook, isVue3 } from 'vue-demi';
import { DraggableProps, EventHandler, useDraggable } from '../index';

const draggableDirective: DirectiveHook<HTMLElement, any, DraggableProps> = (el, binding) => {
  const draggable = useDraggable(el, binding.value);
  el.onmousedown = draggable.core.onMouseDown as EventHandler<MouseEvent>;
  el.onmouseup = draggable.core.onMouseUp as EventHandler<MouseEvent>;
  el.ontouchend = draggable.core.onTouchEnd as EventHandler<TouchEvent>;
  el.dispatchEvent(new CustomEvent('draggable', { detail: draggable }));
  draggable.onUpdated();
  draggable.onMounted();
  draggable.core.onMounted();
};
const DraggableDirective: Directive<HTMLElement, DraggableProps> = {
  [isVue3 ? 'mounted' : 'inserted']: draggableDirective
};

export default DraggableDirective;
