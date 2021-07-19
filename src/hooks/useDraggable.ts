import { watchEffect } from 'vue-demi';
import { createEventHook, MaybeRef, tryOnUnmounted, unrefElement } from '@vueuse/core';
import log from '../utils/log';
import {
  DraggableCoreOptions,
  DraggableEventHandler,
  DraggableEvent,
  DraggableOptions,
  DraggableState,
  TransformEvent,
  UseDraggable
} from '../utils/types';
import { canDragX, canDragY, createDraggableData, getBoundPosition } from '../utils/positionFns';
import { createCSSTransform, createSVGTransform } from '../utils/domFns';
import useDraggableCore from './useDraggableCore';

const useDraggableState = (target: MaybeRef<any>, state: Partial<DraggableState> = {}) => ({
  _state: state as DraggableState,
  _node: target,
  get state() {
    return this._state;
  },
  set state(state: DraggableState) {
    Object.assign(this._state, state);
  },
  get node() {
    return unrefElement(this._node);
  }
});

const useDraggable = (
  target: MaybeRef<any>,
  {
    position,
    positionOffset,
    scale = 1,
    axis = 'both',
    defaultClassNameDragging = 'revue-draggable-dragging',
    defaultClassNameDragged = 'revue-draggable-dragged',
    defaultClassName = 'revue-draggable',
    defaultPosition = { x: 0, y: 0 },
    bounds,
    update,
    ...rest
  }: Partial<DraggableOptions>
): UseDraggable => {
  if (!target) {
    console.warn('You are trying to use <Draggable> without passing a valid target reference.');
  }

  const draggable = useDraggableState(target, {
    ...rest,
    position,
    positionOffset,
    scale,
    axis,
    defaultClassNameDragging,
    defaultClassNameDragged,
    defaultClassName,
    defaultPosition,
    bounds,
    dragging: false,
    dragged: false,
    x: position ? position.x : defaultPosition.x,
    y: position ? position.y : defaultPosition.y,
    prevPropsPosition: position ? { ...position } : { x: 0, y: 0 },
    slackX: 0,
    slackY: 0,
    isElementSVG: false,
    update
  } as DraggableState);

  const onDragStartHook = createEventHook<DraggableEvent>(),
    onDragHook = createEventHook<DraggableEvent>(),
    onDragStopHook = createEventHook<DraggableEvent>(),
    onTransformedHook = createEventHook<TransformEvent>(),
    onUpdateHook = createEventHook<Partial<DraggableState>>();

  const onDragStart: DraggableEventHandler = (e, data) => {
    log('Draggable: onDragStart: %j', data);

    const uiData = createDraggableData({
      data,
      x: draggable.state.x,
      y: draggable.state.y,
      scale: draggable.state.scale
    });

    onDragStartHook.trigger({ event: e, data: uiData });
    if (draggable.state.update === false) return false;

    draggable.state.dragging = true;
    draggable.state.dragged = true;
    transform();
  };

  const onDrag: DraggableEventHandler = (e, data) => {
    if (!draggable.state.dragging) return false;
    log('Draggable: onDrag: %j', data);

    const uiData = createDraggableData({
      data,
      x: draggable.state.x,
      y: draggable.state.y,
      scale: draggable.state.scale
    });

    const newState = {
      x: uiData.x,
      y: uiData.y,
      slackX: NaN,
      slackY: NaN
    };

    if (draggable.state.bounds) {
      const { x, y } = newState;

      newState.x += draggable.state.slackX;
      newState.y += draggable.state.slackY;

      const [newStateX, newStateY] = getBoundPosition({
        bounds: draggable.state.bounds,
        x: newState.x,
        y: newState.y,
        node: data.node
      });
      newState.x = newStateX;
      newState.y = newStateY;

      newState.slackX = draggable.state.slackX + (x - newState.x);
      newState.slackY = draggable.state.slackY + (y - newState.y);

      uiData.x = newState.x;
      uiData.y = newState.y;
      uiData.deltaX = newState.x - draggable.state.x;
      uiData.deltaY = newState.y - draggable.state.y;
    }

    onDragHook.trigger({ event: e, data: uiData });
    if (draggable.state.update === false) return false;
    draggable.state.x = newState.x;
    draggable.state.y = newState.y;
    if (newState.slackX) draggable.state.slackX = newState.slackX;
    if (newState.slackY) draggable.state.slackY = newState.slackY;
    transform();
  };

  const onDragStop: DraggableEventHandler = (e, data) => {
    if (!draggable.state.dragging) return false;

    const uiData = createDraggableData({
      scale: draggable.state.scale,
      x: draggable.state.x,
      y: draggable.state.y,
      data
    });
    onDragStopHook.trigger({ event: e, data: uiData });
    if (draggable.state.update === false) return false;

    log('Draggable: onDragStop: %j', data);

    const controlled = Boolean(draggable.state.position);
    if (controlled && draggable.state.position) {
      draggable.state.x = draggable.state.position.x;
      draggable.state.y = draggable.state.position.y;
    }

    draggable.state.dragging = false;
    draggable.state.slackX = 0;
    draggable.state.slackY = 0;
    transform();
  };

  const transform = () => {
    // If this is controlled, we don't want to move it - unless it's dragging.
    const controlled = Boolean(draggable.state.position);
    const canDrag = !controlled || draggable.state.dragging;

    const validPosition = draggable.state.position || draggable.state.defaultPosition;

    const transformOpts = () => {
      return {
        // Set left if horizontal drag is enabled
        x: canDragX(draggable.state.axis) && canDrag ? draggable.state.x : validPosition.x,

        // Set top if vertical drag is enabled
        y: canDragY(draggable.state.axis) && canDrag ? draggable.state.y : validPosition.y
      };
    };

    const styles =
      !draggable.state.isElementSVG && createCSSTransform(transformOpts(), positionOffset as DraggableOptions['positionOffset']);
    const svgTransform =
      draggable.state.isElementSVG && createSVGTransform(transformOpts(), positionOffset as DraggableOptions['positionOffset']);
    const classes = {
      [defaultClassName]: true,
      [defaultClassNameDragging]: draggable.state.dragging,
      [defaultClassNameDragged]: draggable.state.dragged
    };

    if (typeof svgTransform === 'string') {
      draggable.node?.setAttribute('transform', svgTransform);
    }
    Object.keys(styles).forEach((style) => {
      // @ts-ignore
      draggable.node.style[style] = styles[style];
    });
    Object.keys(classes).forEach((cl) => {
      classes[cl] ? draggable.node?.classList.toggle(cl, true) : draggable.node?.classList.toggle(cl, false);
    });

    const transformedData = {
      style: styles,
      transform: svgTransform,
      classes
    } as TransformEvent;
    onTransformedHook.trigger(transformedData);
  };

  const lifeCycleHooks = {
    onUpdated: () => {
      if (
        draggable.state.position &&
        (!draggable.state.prevPropsPosition ||
          draggable.state.position.x !== draggable.state.prevPropsPosition.x ||
          draggable.state.position.y !== draggable.state.prevPropsPosition.y)
      ) {
        log('Draggable: Updated %j', {
          position: draggable.state.prevPropsPosition,
          prevPropsPosition: draggable.state.prevPropsPosition
        });
        draggable.state.x = draggable.state.position.x;
        draggable.state.y = draggable.state.position.y;
        draggable.state.prevPropsPosition = { ...draggable.state.position };
      }
      transform();
    }
  };

  tryOnUnmounted(() => {
    draggable.state.dragging = false;
    transform();
  });

  const {
    onDragStart: coreStart,
    onDrag: coreDrag,
    onDragStop: coreStop
  } = useDraggableCore(target, {
    scale,
    ...rest
  } as DraggableCoreOptions);

  coreDrag(({ event, data }) => {
    onDrag(event, data);
  });
  coreStart(({ event, data }) => {
    onDragStart(event, data);
  });
  coreStop(({ event, data }) => {
    onDragStop(event, data);
  });

  watchEffect(() => {
    if (draggable.node && update !== false) {
      // Check to see if the element passed is an instanceof SVGElement
      if (typeof window.SVGElement !== 'undefined' && draggable.node instanceof window.SVGElement) {
        draggable.state.isElementSVG = true;
      }
      lifeCycleHooks.onUpdated();

      transform();
    }
  });

  onUpdateHook.on((state) => {
    log('Draggable: State Updated %j', state);
    draggable.state = state as DraggableState;
    lifeCycleHooks.onUpdated();
  });

  return {
    updateState: (state) => {
      onUpdateHook.trigger(state);
      return draggable.state;
    },
    onDragStart: onDragStartHook.on,
    onDrag: onDragHook.on,
    onDragStop: onDragStopHook.on,
    onTransformed: onTransformedHook.on
  };
};

export default useDraggable;
