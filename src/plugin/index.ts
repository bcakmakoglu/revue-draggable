import { Plugin } from 'vue-demi';
import DraggableDirective from '../directive/DraggableDirective';

const plugin: Plugin = (app) => {
  app.directive('draggable', DraggableDirective);
};

export default plugin;
