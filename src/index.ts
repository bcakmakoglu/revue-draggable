import { isVue3, DefineComponent } from 'vue-demi';
import { DraggableCoreProps, DraggableProps } from './utils/types';

export * from './utils/types';
export { default as useDraggableCore } from './useDraggableCore';
export { default as useDraggable } from './useDraggable';
export { default as DraggableCoreDirective } from './DraggableCoreDirective';
export { default as DraggableDirective } from './DraggableDirective';

export const DraggableCore: DefineComponent<DraggableCoreProps> = (isVue3
  ? import('./DraggableCore')
  : () => {}) as unknown as DefineComponent<DraggableCoreProps>;
const Draggable: DefineComponent<DraggableProps> = (isVue3
  ? import('./Draggable')
  : () => {}) as unknown as DefineComponent<DraggableProps>;
export default Draggable;
