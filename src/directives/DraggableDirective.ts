import { Directive, DirectiveHook, isVue3 } from 'vue-demi';
import { DraggableProps } from '../utils/types';
import useDraggable from '../hooks/useDraggable';

const draggableDirective: DirectiveHook<HTMLElement, any, DraggableProps> = (el, binding) => {
  useDraggable({
    ...binding.value,
    nodeRef: el
  });
};
const DraggableDirective: Directive<HTMLElement, DraggableProps> = {
  [isVue3 ? 'mounted' : 'inserted']: draggableDirective
};

export default DraggableDirective;
