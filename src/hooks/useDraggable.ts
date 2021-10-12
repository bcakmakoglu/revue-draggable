import { ref, Ref, watch } from 'vue-demi';
import { createEventHook, get, MaybeRef, tryOnMounted, tryOnUnmounted, unrefElement } from '@vueuse/core';
import log from '../utils/log';
import {
  DraggableEventHandler,
  DraggableEvent,
  DraggableOptions,
  DraggableState,
  TransformEvent,
  UseDraggable
} from '../utils/types';
import { canDragX, canDragY, createDraggableData, getBoundPosition } from '../utils/positionFns';
import { createCSSTransform, createSVGTransform } from '../utils/domFns';
import { deepEqual } from '../utils/shims';
import useDraggableCore from './useDraggableCore';

const useDraggable = (target: MaybeRef<any>, options: Partial<DraggableOptions>): UseDraggable => {
  const initState = (initialState: Partial<DraggableState>): DraggableState =>
    Object.assign(
      {
        allowAnyClick: false,
        cancel: '',
        handle: '',
        disabled: false,
        enableUserSelectHack: true,
        enableTransformFix: false,
        offsetParent: undefined,
        grid: undefined,
        start: () => {},
        move: () => {},
        stop: () => {},
        mouseDown: () => {},
        position: undefined,
        positionOffset: undefined,
        scale: 1,
        axis: 'both',
        defaultClassNameDragging: 'revue-draggable-dragging',
        defaultClassNameDragged: 'revue-draggable-dragged',
        defaultClassName: 'revue-draggable',
        defaultPosition: { x: 0, y: 0 },
        bounds: false,
        dragging: false,
        dragged: false,
        x: 0,
        y: 0,
        prevPropsPosition: { x: 0, y: 0 },
        isElementSVG: false,
        update: true
      },
      initialState
    );

  let node = ref();
  const state = ref(initState(options)) as Ref<DraggableState>;
  watch(state, (val, oldVal) => {
    if (deepEqual(val, oldVal)) return;
    coreState.value = { ...coreState.value, ...val };
    onUpdated();
  });

  const onDragStartHook = createEventHook<DraggableEvent>(),
    onDragHook = createEventHook<DraggableEvent>(),
    onDragStopHook = createEventHook<DraggableEvent>(),
    onTransformedHook = createEventHook<TransformEvent>();

  const onDragStart: DraggableEventHandler = (e, data) => {
    log('Draggable: onDragStart: %j', data);

    const uiData = createDraggableData({
      data,
      x: get(state).x,
      y: get(state).y,
      scale: get(state).scale
    });

    const shouldUpdate = get(state).start?.(e, uiData);
    onDragStartHook.trigger({ event: e, data: uiData });
    if ((shouldUpdate || get(state).update) === false) return false;

    get(state).dragging = true;
    get(state).dragged = true;
  };

  const onDrag: DraggableEventHandler = (e, data) => {
    if (!get(state).dragging) return false;
    log('Draggable: onDrag: %j', data);

    const uiData = createDraggableData({
      data,
      x: get(state).x,
      y: get(state).y,
      scale: get(state).scale
    });

    const newState = {
      x: uiData.x,
      y: uiData.y
    };

    if (get(state).bounds) {
      const [boundX, boundY] = getBoundPosition({
        bounds: get(state).bounds,
        x: newState.x,
        y: newState.y,
        node: data.node
      });
      newState.x = boundX;
      newState.y = boundY;

      uiData.x = newState.x;
      uiData.y = newState.y;
      uiData.deltaX = newState.x - get(state).x;
      uiData.deltaY = newState.y - get(state).y;
    }

    const shouldUpdate = get(state).move?.(e, uiData);
    onDragHook.trigger({ event: e, data: uiData });
    if ((shouldUpdate || get(state).update) === false) return false;

    get(state).x = newState.x;
    get(state).y = newState.y;
    transform();
  };

  const onDragStop: DraggableEventHandler = (e, data) => {
    if (!get(state).dragging) return false;

    const uiData = createDraggableData({
      scale: get(state).scale,
      x: get(state).x,
      y: get(state).y,
      data
    });

    const shouldUpdate = get(state).stop?.(e, uiData);
    onDragStopHook.trigger({ event: e, data: uiData });
    if ((shouldUpdate || get(state).update) === false) return false;

    log('Draggable: onDragStop: %j', data);

    const pos = get(state).position;
    const controlled = Boolean(pos);
    if (controlled && pos) {
      get(state).x = pos.x;
      get(state).y = pos.y;
    }
    if (get(state).enableTransformFix) applyTransformFix();

    get(state).dragging = false;
  };

  const applyTransformFix = () => {
    const target = get(node);
    if (!target) return;
    target.style.transform = '';
    target.style.left = '';
    target.style.top = '';
    target.style.position = 'relative';
    const { x, y } = transformOpts();
    target.style.left = Math.round(parseInt(<string>get(state).positionOffset?.x) || 0) + Math.round(Number(x)) + 'px';
    target.style.top = Math.round(parseInt(<string>get(state).positionOffset?.y) || 0) + Math.round(Number(y)) + 'px';
  };

  const removeTransformFix = () => {
    const target = get(node);
    if (!target) return;
    target.style.transform = '';
    target.style.position = '';
    target.style.left = '';
    target.style.top = '';
  };

  // If this is controlled, we don't want to move it - unless it's dragging.
  const canDrag = () => Boolean(get(state).position) || get(state).dragging;
  const validPosition = () => get(state).position || get(state).defaultPosition;
  const transformOpts = () => ({
    // Set left if horizontal drag is enabled
    x: canDragX(get(state).axis) && canDrag() ? get(state).x : validPosition().x,

    // Set top if vertical drag is enabled
    y: canDragY(get(state).axis) && canDrag() ? get(state).y : validPosition().y
  });

  const transform = () => {
    if (!get(node) || get(state).update === false) return;
    if (get(state).enableTransformFix) removeTransformFix();

    const offset = get(state).positionOffset;
    const isSvg = get(state).isElementSVG;
    const styles = (!isSvg && createCSSTransform(transformOpts(), offset)) || false;
    const svgTransform = (isSvg && createSVGTransform(transformOpts(), offset)) || false;
    const classes = addClasses();

    if (typeof svgTransform === 'string') {
      get(node).setAttribute('transform', svgTransform);
    }
    Object.keys(styles).forEach((style) => {
      if (styles) get(node).style[style] = styles[style];
    });

    const transformedData: TransformEvent = {
      el: get(node),
      style: styles,
      transform: svgTransform,
      classes
    };
    onTransformedHook.trigger(transformedData);
  };

  const addClasses = () => {
    const classes = {
      [get(state).defaultClassName]: !get(state).disabled,
      [get(state).defaultClassNameDragging]: get(state).dragging,
      [get(state).defaultClassNameDragged]: get(state).dragged
    };

    Object.keys(classes).forEach((cl) => {
      classes[cl] ? get(node).classList.toggle(cl, true) : get(node).classList.toggle(cl, false);
    });

    return classes;
  };

  const onUpdated = () => {
    const pos = get(state).position;
    if (
      pos &&
      (!get(state).prevPropsPosition || pos.x !== get(state).prevPropsPosition.x || pos.y !== get(state).prevPropsPosition.y)
    ) {
      log('Draggable: Updated %j', {
        position: get(state).prevPropsPosition,
        prevPropsPosition: get(state).prevPropsPosition
      });
      get(state).x = pos.x;
      get(state).y = pos.y;
      get(state).prevPropsPosition = { ...pos };
    }
    if (get(state).enableTransformFix) {
      applyTransformFix();
    } else {
      transform();
    }
  };

  tryOnUnmounted(() => {
    get(state).dragging = false;
  });

  tryOnMounted(() => {
    node = unrefElement(target);
    if (!node) {
      console.error('You are trying to use <Draggable> without passing a valid target reference.');
      return;
    }
    const x =
      (get(state).position ? get(state).position?.x : get(state).defaultPosition.x) || parseInt(get(node).style.top, 10) || 0;
    const y =
      (get(state).position ? get(state).position?.x : get(state).defaultPosition.x) || parseInt(get(node).style.left, 10) || 0;
    get(state).defaultPosition = { x, y };
    get(state).x = x;
    get(state).y = y;
    addClasses() && onUpdated();
  });

  const { onDragStart: coreStart, onDrag: coreDrag, onDragStop: coreStop, state: coreState } = useDraggableCore(target, options);

  coreDrag(({ event, data }) => {
    onDrag(event, data);
  });
  coreStart(({ event, data }) => {
    onDragStart(event, data);
  });
  coreStop(({ event, data }) => {
    onDragStop(event, data);
  });

  return {
    state,
    onDragStart: onDragStartHook.on,
    onDrag: onDragHook.on,
    onDragStop: onDragStopHook.on,
    onTransformed: onTransformedHook.on
  };
};

export default useDraggable;
