import log from '../utils/log';
import {
  DraggableCoreProps,
  DraggableEvent,
  DraggableEventHandler,
  DraggableProps,
  TransformedEvent,
  UseDraggable
} from '../utils/types';
import { canDragX, canDragY, createDraggableData, getBoundPosition } from '../utils/positionFns';
import { createCSSTransform, createSVGTransform } from '../utils/domFns';
import useDraggableCore from './useDraggableCore';
import { getCurrentInstance, onBeforeUnmount, onUpdated } from 'vue-demi';

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
  ...rest
}: Partial<DraggableProps>): UseDraggable => {
  const instance = getCurrentInstance();
  if (!nodeRef) {
    console.warn(
      'You are trying to use <Draggable> without passing a valid node reference. This will cause errors down the line.'
    );
  }
  let dragging = false;
  let dragged = false;
  let stateX = 0;
  let stateY = 0;
  let prevPropsPosition = { x: 0, y: 0 };
  let slackX = 0;
  let slackY = 0;
  let isElementSVG = false;
  stateX = position ? position.x : defaultPosition.x;
  stateY = position ? position.y : defaultPosition.y;
  prevPropsPosition = position ? { ...position } : { x: 0, y: 0 };
  if (position && !(onDragProp || onStop)) {
    console.warn(
      'A `position` was applied to this <Draggable>, without drag handlers. This will make this ' +
        'component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the ' +
        '`position` of this element.'
    );
  }

  const onDragStart: DraggableEventHandler = (e, coreData) => {
    log('Draggable: onDragStart: %j', coreData);

    const shouldStart = onStart(
      e,
      createDraggableData({
        coreData,
        x: stateX,
        y: stateY,
        scale: scale
      })
    );
    instance?.emit('drag-start', { event: e, data: coreData } as DraggableEvent);
    if (shouldStart === false) return false;

    dragging = true;
    dragged = true;
    transform();
  };

  const onDrag: DraggableEventHandler = (e, coreData) => {
    if (!dragging) return false;
    log('Draggable: onDrag: %j', coreData);

    const uiData = createDraggableData({
      coreData,
      x: stateX,
      y: stateY,
      scale: scale
    });

    const newState = {
      x: uiData.x,
      y: uiData.y,
      slackX: NaN,
      slackY: NaN
    };

    if (bounds) {
      const { x, y } = newState;

      newState.x += slackX;
      newState.y += slackY;

      const [newStateX, newStateY] = getBoundPosition({
        bounds: bounds,
        x: newState.x,
        y: newState.y,
        node: coreData.node
      });
      newState.x = newStateX;
      newState.y = newStateY;

      newState.slackX = slackX + (x - newState.x);
      newState.slackY = slackY + (y - newState.y);

      uiData.x = newState.x;
      uiData.y = newState.y;
      uiData.deltaX = newState.x - stateX;
      uiData.deltaY = newState.y - stateY;
    }

    const shouldUpdate = onDragProp(e, uiData);
    instance?.emit('drag', { event: e, data: coreData } as DraggableEvent);
    if (shouldUpdate === false) return false;
    stateX = newState.x;
    stateY = newState.y;
    if (newState.slackX) slackX = newState.slackX;
    if (newState.slackY) slackY = newState.slackY;
    transform();
  };

  const onDragStop: DraggableEventHandler = (e, coreData) => {
    if (!dragging) return false;

    const shouldContinue = onStop(
      e,
      createDraggableData({
        scale: scale,
        x: stateX,
        y: stateY,
        coreData
      })
    );
    instance?.emit('drag-stop', { event: e, data: coreData } as DraggableEvent);
    if (shouldContinue === false) return false;

    log('Draggable: onDragStop: %j', coreData);

    const controlled = Boolean(position);
    if (controlled && position) {
      stateX = position.x;
      stateY = position.y;
    }

    dragging = false;
    slackX = 0;
    slackY = 0;
    transform();
  };

  const transform = () => {
    // If this is controlled, we don't want to move it - unless it's dragging.
    const controlled = Boolean(position);
    const draggable = !controlled || dragging;

    const validPosition = position || defaultPosition;
    const transformOpts = () => {
      return {
        // Set left if horizontal drag is enabled
        x: canDragX(axis) && draggable ? stateX : validPosition.x,

        // Set top if vertical drag is enabled
        y: canDragY(axis) && draggable ? stateY : validPosition.y
      };
    };

    const styles = !isElementSVG && createCSSTransform(transformOpts(), positionOffset as DraggableProps['positionOffset']);
    const svgTransform = isElementSVG && createSVGTransform(transformOpts(), positionOffset as DraggableProps['positionOffset']);
    const classes = {
      [defaultClassName]: true,
      [defaultClassNameDragging]: dragging,
      [defaultClassNameDragged]: dragged
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
    instance?.emit('transformed', {
      style: styles,
      transform: svgTransform,
      classes
    } as TransformedEvent);
  };

  const lifeCycleHooks = {
    onUpdated: () => {
      if (position && (!prevPropsPosition || position.x !== prevPropsPosition.x || position.y !== prevPropsPosition.y)) {
        log('Draggable: Updated %j', {
          position: position,
          prevPropsPosition: prevPropsPosition
        });
        stateX = position.x;
        stateY = position.y;
        prevPropsPosition = { ...position };
      }
      transform();
    },
    onMounted: () => {
      // Check to see if the element passed is an instanceof SVGElement
      if (typeof window.SVGElement !== 'undefined' && nodeRef instanceof window.SVGElement) {
        isElementSVG = true;
      }
    },
    onBeforeUnmount: () => {
      dragging = false; // prevents invariant if unmounted while dragging
    }
  };

  if (instance) {
    onUpdated(() => {
      lifeCycleHooks.onUpdated();
    }, instance);

    onBeforeUnmount(() => {
      dragging = false;
    }, instance);
  }

  lifeCycleHooks.onMounted();
  return {
    core: {
      ...useDraggableCore({
        nodeRef,
        scale,
        onStart: onDragStart,
        onDrag,
        onStop: onDragStop,
        ...rest
      } as DraggableCoreProps)
    },
    ...lifeCycleHooks
  };
};

export default useDraggable;
