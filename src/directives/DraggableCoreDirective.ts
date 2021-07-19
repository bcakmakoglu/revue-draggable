import { Directive, DirectiveHook, isVue3 } from 'vue-demi';
import { DraggableCoreProps } from '../utils/types';
import useDraggableCore from '../hooks/useDraggableCore';

const draggableCoreDirective: DirectiveHook<HTMLElement, any, DraggableCoreProps> = (el, binding) => {
  useDraggableCore({
    ...binding.value,
    nodeRef: el
  });
};
const DraggableCoreDirective: Directive<HTMLElement, DraggableCoreProps> = {
  [isVue3 ? 'mounted' : 'inserted']: draggableCoreDirective
};

export default DraggableCoreDirective;
