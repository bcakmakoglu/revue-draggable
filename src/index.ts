import { Component, isVue3 } from 'vue-demi';
import { DraggableCoreProps, DraggableProps } from './utils/types';

export * from './utils/types';
export { default as useDraggableCore } from './useDraggableCore';
export { default as useDraggable } from './useDraggable';

export const DraggableCore: Component<DraggableCoreProps> = isVue3 ? import('./DraggableCore') : () => {};
const Draggable: Component<DraggableProps> = isVue3 ? import('./Draggable') : () => {};
export default Draggable;
