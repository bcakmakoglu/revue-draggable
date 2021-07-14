import { Plugin } from 'vue-demi';
import DraggableDirective from '../directives/DraggableDirective';
import DraggableCoreDirective from '../directives/DraggableCoreDirective';
import Draggable from '../components/Draggable';
import DraggableCore from '../components/DraggableCore';

const DraggablePlugin: Plugin = (app) => {
  app.directive('draggable', DraggableDirective);
  app.directive('draggable-core', DraggableCoreDirective);
  app.component('Draggable', Draggable);
  app.component('DraggableCore', DraggableCore);
};

export default DraggablePlugin;
