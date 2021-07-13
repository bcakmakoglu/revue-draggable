import { canDragX, canDragY, createDraggableData, getBoundPosition } from './utils/positionFns';
import DraggableCore from './DraggableCore';
import log from './utils/log';
import { defineComponent, onBeforeUnmount, onMounted, computed, ref, PropType, onUpdated } from 'vue-demi';
import { createCSSTransform, createSVGTransform } from './utils/domFns';
import { DraggableEventHandler, DraggableProps } from './utils/types';

const Draggable = defineComponent({
  name: 'Draggable',
  components: { DraggableCore },
  props: {
    axis: {
      type: String as PropType<DraggableProps['axis']>,
      default: 'both'
    },
    bounds: {
      type: [Object, String, Boolean] as PropType<DraggableProps['bounds']>,
      default: false
    },
    defaultClassName: {
      type: String as PropType<DraggableProps['defaultClassName']>,
      default: 'revue-draggable'
    },
    defaultClassNameDragging: {
      type: String as PropType<DraggableProps['defaultClassNameDragging']>,
      default: 'revue-draggable-dragging'
    },
    defaultClassNameDragged: {
      type: String as PropType<DraggableProps['defaultClassNameDragged']>,
      default: 'revue-draggable-dragged'
    },
    defaultPosition: {
      type: Object as PropType<DraggableProps['defaultPosition']>,
      default: () => ({ x: 0, y: 0 })
    },
    scale: {
      type: Number as PropType<DraggableProps['scale']>,
      default: 1
    },
    position: {
      type: Object as PropType<DraggableProps['position']>,
      default: undefined
    },
    positionOffset: {
      type: Object as PropType<DraggableProps['positionOffset']>,
      default: undefined
    },
    allowAnyClick: {
      type: Boolean as PropType<DraggableProps['allowAnyClick']>,
      default: true
    },
    disabled: {
      type: Boolean as PropType<DraggableProps['disabled']>,
      default: false
    },
    enableUserSelectHack: {
      type: Boolean as PropType<DraggableProps['enableUserSelectHack']>,
      default: true
    },
    onStart: {
      type: Function as PropType<DraggableProps['onStart']>,
      default: () => {}
    },
    onDrag: {
      type: Function as PropType<DraggableProps['onDrag']>,
      default: () => {}
    },
    onStop: {
      type: Function as PropType<DraggableProps['onStop']>,
      default: () => {}
    },
    onMouseDown: {
      type: Function as PropType<DraggableProps['onMouseDown']>,
      default: () => {}
    },
    cancel: {
      type: String as PropType<DraggableProps['cancel']>,
      default: undefined
    },
    offsetParent: {
      type: Object as PropType<DraggableProps['offsetParent']>,
      default: () => {}
    },
    grid: {
      type: Array as unknown as PropType<DraggableProps['grid']>,
      default: undefined
    },
    handle: {
      type: String as PropType<DraggableProps['handle']>,
      default: undefined
    },
    nodeRef: {
      type: Object as PropType<DraggableProps['nodeRef']>,
      default: undefined as any
    }
  },
  setup(props, { slots }) {
    const nodeRef = ref<DraggableProps['nodeRef'] | null>(props.nodeRef || null);
    const dragging = ref<boolean>(false);
    const dragged = ref<boolean>(false);
    const stateX = ref<number>(props.position ? props.position.x : props.defaultPosition.x);
    const stateY = ref<number>(props.position ? props.position.y : props.defaultPosition.y);
    const prevPropsPosition = ref({ ...props.position });
    const slackX = ref<number>(0);
    const slackY = ref<number>(0);
    const isElementSVG = ref<boolean>(false);

    if (props.position && !(props.onDrag || props.onStop)) {
      console.warn(
        'A `position` was applied to this <Draggable>, without drag handlers. This will make this ' +
          'component effectively undraggable. Please attach `onDrag` or `onStop` handlers so you can adjust the ' +
          '`position` of this element.'
      );
    }

    onUpdated(() => {
      if (
        props.position &&
        (!prevPropsPosition.value ||
          props.position.x !== prevPropsPosition.value.x ||
          props.position.y !== prevPropsPosition.value.y)
      ) {
        log('Draggable: getDerivedStateFromProps %j', {
          position: props.position,
          prevPropsPosition: prevPropsPosition.value
        });
        stateX.value = props.position.x;
        stateY.value = props.position.y;
        prevPropsPosition.value = { ...props.position };
      }
    });

    onMounted(() => {
      // Check to see if the element passed is an instanceof SVGElement
      if (typeof window.SVGElement !== 'undefined' && nodeRef.value instanceof window.SVGElement) {
        isElementSVG.value = true;
      }
    });

    onBeforeUnmount(() => {
      dragging.value = false; // prevents invariant if unmounted while dragging
    });

    const onDragStart: DraggableEventHandler = (e, coreData) => {
      log('Draggable: onDragStart: %j', coreData);

      const shouldStart = props.onStart(
        e,
        createDraggableData({
          coreData,
          x: stateX.value,
          y: stateX.value,
          scale: props.scale
        })
      );
      if (shouldStart === false) return false;

      dragging.value = true;
      dragged.value = true;
    };

    const onDrag: DraggableEventHandler = (e, coreData) => {
      if (!dragging.value) return false;
      log('Draggable: onDrag: %j', coreData);

      const uiData = createDraggableData({
        coreData,
        x: stateX.value,
        y: stateY.value,
        scale: props.scale
      });

      const newState = {
        x: uiData.x,
        y: uiData.y,
        slackX: NaN,
        slackY: NaN
      };

      if (props.bounds) {
        const { x, y } = newState;

        newState.x += slackX.value;
        newState.y += slackY.value;

        const [newStateX, newStateY] = getBoundPosition({
          bounds: props.bounds,
          x: newState.x,
          y: newState.y,
          node: coreData.node
        });
        newState.x = newStateX;
        newState.y = newStateY;

        newState.slackX = slackX.value + (x - newState.x);
        newState.slackY = slackY.value + (y - newState.y);

        uiData.x = newState.x;
        uiData.y = newState.y;
        uiData.deltaX = newState.x - stateX.value;
        uiData.deltaY = newState.y - stateY.value;
      }

      const shouldUpdate = props.onDrag(e, uiData);
      if (shouldUpdate === false) return false;
      stateX.value = newState.x;
      stateY.value = newState.y;
      if (newState.slackX) slackX.value = newState.slackX;
      if (newState.slackY) slackY.value = newState.slackY;
    };

    const onDragStop: DraggableEventHandler = (e, coreData) => {
      if (!dragging.value) return false;

      const shouldContinue = props.onStop(
        e,
        createDraggableData({
          scale: props.scale,
          x: stateX.value,
          y: stateY.value,
          coreData
        })
      );
      if (shouldContinue === false) return false;

      log('Draggable: onDragStop: %j', coreData);

      const controlled = Boolean(props.position);
      if (controlled && props.position) {
        stateX.value = props.position.x;
        stateY.value = props.position.y;
      }

      dragging.value = false;
      slackX.value = 0;
      slackY.value = 0;
    };

    // If this is controlled, we don't want to move it - unless it's dragging.
    const controlled = computed(() => Boolean(props.position));
    const draggable = computed(() => !controlled.value || dragging.value);

    const validPosition = computed(() => props.position || props.defaultPosition);
    const transformOpts = computed(() => {
      return {
        // Set left if horizontal drag is enabled
        x: canDragX(props.axis) && draggable.value ? stateX.value : validPosition.value.x,

        // Set top if vertical drag is enabled
        y: canDragY(props.axis) && draggable.value ? stateY.value : validPosition.value.y
      };
    });

    const style = computed(() => !isElementSVG.value && createCSSTransform(transformOpts.value, props.positionOffset as any));
    const svgTransform = computed(
      () => isElementSVG.value && createSVGTransform(transformOpts.value, props.positionOffset as any)
    );
    const classes = computed(() => {
      return {
        [props.defaultClassName]: true,
        [props.defaultClassNameDragging]: dragging.value,
        [props.defaultClassNameDragged]: dragged.value
      };
    });

    const vSlots = computed(() => {
      return {
        default: () =>
          slots.default
            ? slots
                .default()
                .map((node) => <node ref={nodeRef} class={classes.value} style={style.value} transform={svgTransform.value} />)
            : []
      };
    });

    return () => (
      <DraggableCore
        disabled={props.disabled}
        enableUserSelectHack={props.enableUserSelectHack}
        scale={props.scale}
        nodeRef={props.nodeRef}
        grid={props.grid}
        handle={props.handle}
        offsetParent={props.offsetParent}
        allowAnyClick={props.allowAnyClick}
        cancel={props.cancel}
        onStart={onDragStart}
        onDrag={onDrag}
        onStop={onDragStop}
        v-slots={vSlots.value}
      />
    );
  }
});

export default Draggable;
