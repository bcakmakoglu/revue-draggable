import { Directive } from 'vue-demi';
import { DraggableProps, EventHandler, useDraggableCore } from './index';

const DraggableCoreDirective: Directive<HTMLElement, DraggableProps> = {
  mounted(el, binding) {
    const draggable = useDraggableCore(el, binding.value);
    el.onmousedown = draggable.onMouseDown as EventHandler<MouseEvent>;
    el.onmouseup = draggable.onMouseUp as EventHandler<MouseEvent>;
    el.ontouchend = draggable.onTouchEnd as EventHandler<TouchEvent>;
    el.dispatchEvent(new CustomEvent('draggableCore', { detail: draggable }));
    draggable.onMounted();
  }
};

export default DraggableCoreDirective;
