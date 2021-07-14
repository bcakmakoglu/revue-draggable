import { Directive } from 'vue-demi';
import { DraggableProps, EventHandler, useDraggable } from './index';

const DraggableDirective: Directive<HTMLElement, DraggableProps> = {
  mounted(el, binding) {
    const draggable = useDraggable(el, binding.value);
    el.onmousedown = draggable.core.onMouseDown as EventHandler<MouseEvent>;
    el.onmouseup = draggable.core.onMouseUp as EventHandler<MouseEvent>;
    el.ontouchend = draggable.core.onTouchEnd as EventHandler<TouchEvent>;
    el.dispatchEvent(new CustomEvent('draggable', { detail: draggable }));
    draggable.onUpdated();
    draggable.onMounted();
    draggable.core.onMounted();
  }
};

export default DraggableDirective;
