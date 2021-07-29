import { watchEffect, computed, isVue3, ref, Ref, watch } from 'vue-demi';
import { controlledRef, createEventHook, get, MaybeRef, tryOnUnmounted, unrefElement } from '@vueuse/core';
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
import useDraggableCore from './useDraggableCore';
import equal from 'fast-deep-equal/es6';

const useDraggable = (target: MaybeRef<any>, options: Partial<DraggableOptions>): UseDraggable => {
  if (!target) {
    console.warn('You are trying to use <Draggable> without passing a valid target reference.');
  }

  const stateObj: DraggableState = Object.assign(
    {
      allowAnyClick: true,
      cancel: '',
      handle: '',
      disabled: false,
      enableUserSelectHack: true,
      offsetParent: undefined,
      grid: undefined,
      start: () => {},
      move: () => {},
      stop: () => {},
      position: undefined as any,
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
      slackX: 0,
      slackY: 0,
      isElementSVG: false,
      update: true
    },
    options
  );

  const node = computed(() => unrefElement(target));
  let state: Ref<DraggableState>;
  if (isVue3) {
    state = controlledRef<DraggableState>(stateObj, {
      onBeforeChange(val, oldVal) {
        if (equal(val, oldVal)) {
          return;
        }
        coreState.value = { ...coreState.value, ...val };
      },
      onChanged(val) {
        onUpdated();
        onUpdateHook.trigger(val);
      }
    });
  } else {
    state = ref<DraggableState>(stateObj);
    watch(state, (val, oldVal) => {
      if (equal(val, oldVal)) {
        return;
      }
      coreState.value = { ...coreState.value, ...val };
      onUpdated();
      onUpdateHook.trigger(val);
    });
  }

  const onDragStartHook = createEventHook<DraggableEvent>(),
    onDragHook = createEventHook<DraggableEvent>(),
    onDragStopHook = createEventHook<DraggableEvent>(),
    onTransformedHook = createEventHook<TransformEvent>(),
    onUpdateHook = createEventHook<Partial<DraggableState>>();

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
    transform();
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
      y: uiData.y,
      slackX: NaN,
      slackY: NaN
    };

    if (get(state).bounds) {
      const { x, y } = newState;

      newState.x += get(state).slackX;
      newState.y += get(state).slackY;

      const [boundX, boundY] = getBoundPosition({
        bounds: get(state).bounds,
        x: newState.x,
        y: newState.y,
        node: data.node
      });
      newState.x = boundX;
      newState.y = boundY;

      newState.slackX = get(state).slackX + (x - newState.x);
      newState.slackY = get(state).slackY + (y - newState.y);

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
    if (newState.slackX) get(state).slackX = newState.slackX;
    if (newState.slackY) get(state).slackY = newState.slackY;
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

    get(state).dragging = false;
    get(state).slackX = 0;
    get(state).slackY = 0;
    transform();
  };

  const transform = () => {
    if (!get(node) || get(state).update === false) return;
    // If this is controlled, we don't want to move it - unless it's dragging.
    const controlled = Boolean(get(state).position);
    const canDrag = !controlled || get(state).dragging;
    const validPosition = get(state).position || get(state).defaultPosition;

    const transformOpts = () => {
      return {
        // Set left if horizontal drag is enabled
        x: canDragX(get(state).axis) && canDrag ? get(state).x : validPosition.x,

        // Set top if vertical drag is enabled
        y: canDragY(get(state).axis) && canDrag ? get(state).y : validPosition.y
      };
    };

    const offset = get(state).positionOffset;
    const isSvg = get(state).isElementSVG;
    const styles = (!isSvg && createCSSTransform(transformOpts(), offset)) || false;
    const svgTransform = (isSvg && createSVGTransform(transformOpts(), offset)) || false;
    const classes = {
      [get(state).defaultClassName]: !get(state).disabled,
      [get(state).defaultClassNameDragging]: get(state).dragging,
      [get(state).defaultClassNameDragged]: get(state).dragged
    };

    if (typeof svgTransform === 'string') {
      get(node).setAttribute('transform', svgTransform);
    }
    Object.keys(styles).forEach((style) => {
      if (styles) get(node).style[style] = styles[style];
    });
    Object.keys(classes).forEach((cl) => {
      classes[cl] ? get(node).classList.toggle(cl, true) : get(node).classList.toggle(cl, false);
    });

    const transformedData: TransformEvent = {
      el: get(node),
      style: styles,
      transform: svgTransform,
      classes
    };
    onTransformedHook.trigger(transformedData);
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
    transform();
  };

  tryOnUnmounted(() => {
    get(state).dragging = false;
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

  watchEffect(
    () => {
      transform();
    },
    { flush: 'post' }
  );

  return {
    state,
    onUpdated: onUpdateHook.on,
    onDragStart: onDragStartHook.on,
    onDrag: onDragHook.on,
    onDragStop: onDragStopHook.on,
    onTransformed: onTransformedHook.on
  };
};

export default useDraggable;
