import { ref, Ref, watch, computed } from 'vue-demi';
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
        prevPropsPosition: { x: 0, y: 0 },
        isElementSVG: false,
        update: true
      },
      initialState
    );

  let node = ref();
  const xPos = ref(NaN);
  const yPos = ref(NaN);
  const state = ref(initState(options)) as Ref<DraggableState>;

  const onDragStartHook = createEventHook<DraggableEvent>(),
    onDragHook = createEventHook<DraggableEvent>(),
    onDragStopHook = createEventHook<DraggableEvent>(),
    onTransformedHook = createEventHook<TransformEvent>();

  const onDragStart: DraggableEventHandler = (e, data) => {
    log('Draggable: onDragStart: %j', data);

    const uiData = createDraggableData({
      data,
      x: xPos.value,
      y: yPos.value,
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
      x: xPos.value,
      y: yPos.value,
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
      uiData.deltaX = newState.x - xPos.value;
      uiData.deltaY = newState.y - yPos.value;
    }

    const shouldUpdate = get(state).move?.(e, uiData);
    onDragHook.trigger({ event: e, data: uiData });
    if ((shouldUpdate || get(state).update) === false) return false;

    xPos.value = newState.x;
    yPos.value = newState.y;
    transform();
  };

  const onDragStop: DraggableEventHandler = (e, data) => {
    if (!get(state).dragging) return false;

    const uiData = createDraggableData({
      scale: get(state).scale,
      x: xPos.value,
      y: yPos.value,
      data
    });

    const shouldUpdate = get(state).stop?.(e, uiData);
    onDragStopHook.trigger({ event: e, data: uiData });
    if ((shouldUpdate || get(state).update) === false) return false;

    log('Draggable: onDragStop: %j', data);

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
    const { x, y } = transformOpts.value;
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
  const canDrag = computed(() => Boolean(get(state).position) || get(state).dragging);
  const validPosition = computed(() => get(state).position || get(state).defaultPosition);
  const transformOpts = computed(() => ({
    // Set left if horizontal drag is enabled
    x: canDragX(get(state).axis) && canDrag.value ? xPos.value : validPosition.value.x,

    // Set top if vertical drag is enabled
    y: canDragY(get(state).axis) && canDrag.value ? yPos.value : validPosition.value.y
  }));

  const transform = () => {
    if (!get(node) || get(state).update === false) return;
    if (get(state).enableTransformFix) removeTransformFix();

    const offset = get(state).positionOffset;
    const isSvg = get(state).isElementSVG;
    const styles = (!isSvg && createCSSTransform(transformOpts.value, offset)) || false;
    const svgTransform = (isSvg && createSVGTransform(transformOpts.value, offset)) || false;
    const classes = addClasses();

    if (typeof svgTransform === 'string') {
      get(node).setAttribute('transform', svgTransform);
    }

    if (styles) {
      for (const style of Object.keys(styles)) {
        get(node).style[style] = styles[style];
      }
    }

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

  const { onDragStart: coreStart, onDrag: coreDrag, onDragStop: coreStop, state: coreState } = useDraggableCore(target, options);
  coreDrag(({ event, data }) => onDrag(event, data));
  coreStart(({ event, data }) => onDragStart(event, data));
  coreStop(({ event, data }) => onDragStop(event, data));

  const onUpdated = () => {
    const pos = get(state).position;
    log('Draggable: Updated %j', {
      position: get(state).prevPropsPosition,
      prevPropsPosition: get(state).prevPropsPosition
    });
    if (pos) {
      xPos.value = pos.x;
      yPos.value = pos.y;
      get(state).prevPropsPosition = { ...pos };
    }

    if (get(state).enableTransformFix) applyTransformFix();
    else transform();
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
    let x = 0;
    let y = 0;
    const pos = get(state).position;
    const defaultPos = get(state).defaultPosition;
    const stylePos = get(node).style;
    if (pos && typeof pos.x !== 'undefined') x = pos.x;
    else if (defaultPos && typeof defaultPos.x !== 'undefined') x = defaultPos.x;
    else if (stylePos.top) x = parseInt(stylePos.top, 10);
    if (pos && typeof pos.y !== 'undefined') y = pos.y;
    else if (defaultPos && typeof defaultPos.y !== 'undefined') y = defaultPos.y;
    else if (stylePos.left) y = parseInt(stylePos.left, 10);

    xPos.value = x;
    yPos.value = y;
    addClasses() && onUpdated();

    watch(state, (val) => {
      coreState.value = { ...coreState.value, ...val };
      onUpdated();
    });
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
