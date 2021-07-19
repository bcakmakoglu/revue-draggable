import { getCurrentInstance, onBeforeUnmount, onUpdated } from 'vue-demi';
import { createEventHook } from '@vueuse/core';
import log from '../utils/log';
import {
  DraggableCoreOptions,
  DraggableEventHandler,
  DraggableHook,
  DraggableOptions,
  DraggableState,
  TransformedData,
  UseDraggable
} from '../utils/types';
import { canDragX, canDragY, createDraggableData, getBoundPosition } from '../utils/positionFns';
import { createCSSTransform, createSVGTransform } from '../utils/domFns';
import useDraggableCore from './useDraggableCore';

const useDraggableState = (state: Partial<DraggableState> = {}) => ({
  _state: state as DraggableState,
  get state() {
    return this._state;
  },
  set state(state: DraggableState) {
    Object.assign(this._state, state);
  }
});

const useDraggable = ({
  nodeRef,
  position,
  positionOffset,
  scale = 1,
  onStart = () => {},
  onStop = () => {},
  onDrag: onDragProp = () => {},
  axis = 'both',
  defaultClassNameDragging = 'revue-draggable-dragging',
  defaultClassNameDragged = 'revue-draggable-dragged',
  defaultClassName = 'revue-draggable',
  defaultPosition = { x: 0, y: 0 },
  bounds,
  update,
  ...rest
}: Partial<DraggableOptions>): UseDraggable => {
  if (!nodeRef) {
    console.warn(
      'You are trying to use <Draggable> without passing a valid node reference. This will cause errors down the line.'
    );
  }

  const instance = getCurrentInstance();
  const emitter =
    instance?.emit ??
    ((arg, data) => {
      const event = new CustomEvent(arg, { detail: data });
      nodeRef?.dispatchEvent(event);
    });

  const draggable = useDraggableState({
    ...rest,
    nodeRef,
    position,
    positionOffset,
    scale,
    onStart,
    onStop,
    onDrag: onDragProp,
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

  const onDragStartHook = createEventHook<DraggableHook>(),
    onDragHook = createEventHook<DraggableHook>(),
    onDragStopHook = createEventHook<DraggableHook>(),
    onTransformedHook = createEventHook<TransformedData>(),
    onUpdateHook = createEventHook<Partial<DraggableState>>();

  if (position && !(onDragProp || onStop)) {
    console.warn(
      'A `position` was applied to this <Draggable>, without drag handlers. This will make this ' +
        'component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the ' +
        '`position` of this element.'
    );
  }

  const onDragStart: DraggableEventHandler = (e, data) => {
    log('Draggable: onDragStart: %j', data);

    const uiData = createDraggableData({
      data,
      x: draggable.state.x,
      y: draggable.state.y,
      scale: draggable.state.scale
    });
    const shouldStart = onStart(e, uiData);
    emitter('drag-start', { event: e, data: uiData });
    onDragStartHook.trigger({ event: e, data: uiData });
    if (shouldStart === false || draggable.state.update === false) return false;

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

    const shouldUpdate = onDragProp(e, uiData);
    emitter('drag-move', { event: e, data: uiData });
    onDragHook.trigger({ event: e, data: uiData });
    if (shouldUpdate === false || draggable.state.update === false) return false;
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
    const shouldContinue = onStop(e, uiData);
    emitter('drag-stop', { event: e, data: uiData });
    onDragStopHook.trigger({ event: e, data: uiData });
    if (shouldContinue === false || draggable.state.update === false) return false;

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
      nodeRef?.setAttribute('transform', svgTransform);
    }
    Object.keys(styles).forEach((style) => {
      // @ts-ignore
      nodeRef.style[style] = styles[style];
    });
    Object.keys(classes).forEach((cl) => {
      classes[cl] ? nodeRef?.classList.toggle(cl, true) : nodeRef?.classList.toggle(cl, false);
    });

    const transformedData = {
      style: styles,
      transform: svgTransform,
      classes
    } as TransformedData;

    emitter('transformed', transformedData);
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
    },
    onMounted: () => {
      // Check to see if the element passed is an instanceof SVGElement
      if (typeof window.SVGElement !== 'undefined' && nodeRef instanceof window.SVGElement) {
        draggable.state.isElementSVG = true;
      }
      transform();
    },
    onBeforeUnmount: () => {
      draggable.state.dragging = false; // prevents invariant if unmounted while dragging
    }
  };

  if (instance) {
    onUpdated(() => {
      lifeCycleHooks.onUpdated();
    }, instance);

    onBeforeUnmount(() => {
      draggable.state.dragging = false;
    }, instance);
  }

  lifeCycleHooks.onMounted();

  const { updateState } = useDraggableCore({
    nodeRef,
    scale,
    onStart: onDragStart,
    onDrag,
    onStop: onDragStop,
    ...rest
  } as DraggableCoreOptions);

  onUpdateHook.on((state) => {
    log('Draggable: State Updated %j', state);
    updateState(state);
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
