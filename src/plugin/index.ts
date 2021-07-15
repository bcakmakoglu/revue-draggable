import { isVue2, Plugin, Vue2 } from 'vue-demi';
import DraggableDirective from '../directives/DraggableDirective';
import DraggableCoreDirective from '../directives/DraggableCoreDirective';
import Draggable from '../components/Draggable';
import DraggableCore from '../components/DraggableCore';

let plugin: Plugin = (app) => {
  app.directive('draggable', DraggableDirective);
  app.directive('draggable-core', DraggableCoreDirective);
  app.component('Draggable', Draggable);
  app.component('DraggableCore', DraggableCore);
};
if (isVue2) {
  plugin = (app: typeof Vue2) => {
    app.directive('draggable', DraggableDirective);
    app.directive('draggable-core', DraggableCoreDirective);
  };
}
const DraggablePlugin = plugin;

export default DraggablePlugin;
