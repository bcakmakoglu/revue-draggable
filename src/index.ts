import { isVue3, DefineComponent } from 'vue-demi';
import { DraggableCoreProps, DraggableProps } from './utils/types';

export * from './utils/types';
export { default as useDraggableCore } from './hooks/useDraggableCore';
export { default as useDraggable } from './hooks/useDraggable';
export { default as DraggableCoreDirective } from './directives/DraggableCoreDirective';
export { default as DraggableDirective } from './directives/DraggableDirective';

export const DraggableCore: DefineComponent<DraggableCoreProps> = (isVue3
  ? import('./components/DraggableCore')
  : () => {}) as unknown as DefineComponent<DraggableCoreProps>;
const Draggable: DefineComponent<DraggableProps> = (isVue3
  ? import('./components/Draggable')
  : () => {}) as unknown as DefineComponent<DraggableProps>;
export default Draggable;
