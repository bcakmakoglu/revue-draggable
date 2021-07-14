import { isVue3, Plugin } from 'vue-demi';
import DraggableDirective from '../directives/DraggableDirective';
import DraggableCoreDirective from '../directives/DraggableCoreDirective';
import Draggable, { DraggableCore } from '../index';

const DraggablePlugin: Plugin = (app) => {
  app.directive('draggable', DraggableDirective);
  app.directive('draggable-core', DraggableCoreDirective);
  if (isVue3) {
    app.component('draggable', Draggable);
    app.component('draggable-core', DraggableCore);
  }
};

export default DraggablePlugin;
