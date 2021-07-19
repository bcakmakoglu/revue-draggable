import { Plugin } from 'vue-demi';
import DraggableDirective from '../directive/DraggableDirective';
import Draggable from '../components/Draggable';
import DraggableCore from '../components/DraggableCore';

const plugin: Plugin = (app) => {
  app.component('Draggable', Draggable);
  app.component('DraggableCore', DraggableCore);
  app.directive('draggable', DraggableDirective);
};

export default plugin;
