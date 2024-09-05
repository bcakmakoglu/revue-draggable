import type { MaybeElementRef } from '@vueuse/core'
import { createEventHook, get, tryOnMounted, tryOnUnmounted, unrefElement } from '@vueuse/core'
import { computed, effectScope, ref, toRefs, watch } from 'vue-demi'
import type { DraggableEvent, DraggableEventHandler, DraggableOptions, TransformEvent, UseDraggable } from '../utils/types'
import { log } from '../utils/log'
import { canDragX, canDragY, createDraggableData, getBoundPosition } from '../utils/positionFns'
import { int } from '../utils/shims'
import { createCSSTransform, createSVGTransform } from '../utils/domFns'
import useDraggableCore from './useDraggableCore'
import useState from './useState'

function useDraggable(target: MaybeElementRef, options?: Partial<DraggableOptions>): UseDraggable {
  const node = ref<HTMLElement | SVGElement | null>()
  const sharedState = useState(options)
  const state = sharedState()
  const onDragStartHook = createEventHook<DraggableEvent>()
  const onDragHook = createEventHook<DraggableEvent>()
  const onDragStopHook = createEventHook<DraggableEvent>()
  const onTransformedHook = createEventHook<TransformEvent>()
  const scope = effectScope()

  scope.run(() => {
    const onDragStart: DraggableEventHandler = (e, data) => {
      log('Draggable: onDragStart: %j', data)

      const uiData = createDraggableData({
        data,
        ...state.currentPosition,
      })

      const shouldUpdate = state.start ? state.start(e, uiData) : state.update

      onDragStartHook.trigger({ event: e, data: uiData })

      if (typeof shouldUpdate !== 'undefined' && !shouldUpdate) {
        return false
      }

      state.dragging = true
      state.dragged = true
    }

    const onDrag: DraggableEventHandler = (e, data) => {
      if (!state.dragging) {
        return false
      }

      log('Draggable: onDrag: %j', data)

      const uiData = createDraggableData({
        data,
        ...state.currentPosition,
      })

      const newState = {
        x: uiData.x,
        y: uiData.y,
      }

      if (state.bounds) {
        const [boundX, boundY] = getBoundPosition({
          bounds: state.bounds,
          x: newState.x,
          y: newState.y,
          node: data.node,
        })
        newState.x = boundX
        newState.y = boundY

        uiData.x = newState.x
        uiData.y = newState.y
        uiData.deltaX = newState.x - state.currentPosition.x
        uiData.deltaY = newState.y - state.currentPosition.y
      }

      const shouldUpdate = state.move ? state.move(e, uiData) : state.update

      onDragHook.trigger({ event: e, data: uiData })

      if (typeof shouldUpdate !== 'undefined' && !shouldUpdate) {
        return false
      }

      state.currentPosition = newState
      transform()
    }

    const onDragStop: DraggableEventHandler = (e, data) => {
      if (!state.dragging) {
        return false
      }

      const uiData = createDraggableData({
        data,
        ...state.currentPosition,
      })

      const shouldUpdate = state.stop ? state.stop(e, uiData) : state.update

      onDragStopHook.trigger({ event: e, data: uiData })

      if (typeof shouldUpdate !== 'undefined' && !shouldUpdate) {
        return false
      }

      log('Draggable: onDragStop: %j', data)

      if (state.enableTransformFix) {
        applyTransformFix()
      }

      state.dragging = false
    }

    const applyTransformFix = () => {
      const target = get(node)
      if (!target) {
        return
      }
      target.style.transform = ''
      target.style.left = ''
      target.style.top = ''
      target.style.position = 'relative'
      const { x, y } = transformOpts.value
      target.style.left = `${Math.round(int(<string>state.positionOffset?.x) || 0) + Math.round(Number(x))}px`
      target.style.top = `${Math.round(int(<string>state.positionOffset?.y) || 0) + Math.round(Number(y))}px`
    }

    const removeTransformFix = () => {
      const target = get(node)
      if (!target) {
        return
      }
      target.style.transform = ''
      target.style.position = ''
      target.style.left = ''
      target.style.top = ''
    }

    // If this is controlled, we don't want to move it - unless it's dragging.
    const transformOpts = computed(() => {
      const canDrag = Boolean(state.position) || state.dragging
      const validPosition = state.position || state.defaultPosition
      return {
        // Set left if horizontal drag is enabled
        x: canDragX(state.axis) && get(canDrag) ? state.currentPosition.x : get(validPosition).x,

        // Set top if vertical drag is enabled
        y: canDragY(state.axis) && get(canDrag) ? state.currentPosition.y : get(validPosition).y,
      }
    })

    const transform = (force = false) => {
      const n = get(node)
      if (n && (force || (state.update && state.dragging))) {
        if (state.enableTransformFix) {
          removeTransformFix()
        }

        const offset = state.positionOffset
        const isSvg = state.isElementSVG
        const styles = (!isSvg && createCSSTransform(get(transformOpts), offset)) || false
        const svgTransform = (isSvg && createSVGTransform(get(transformOpts), offset)) || false

        if (typeof svgTransform === 'string') {
          n.setAttribute('transform', svgTransform)
        }
        if (styles) {
          for (const style of Object.keys(styles)) {
            if (style === 'transform') {
              styles[style] += `${n.style[style]}`.replace(/translate\((-?\d+?.{0,2},? ?)+\)+/gm, '').trim()
            }
            n.style[style as any] = styles[style]
          }
        }

        const transformedData: TransformEvent = {
          el: get(node),
          style: styles,
          transform: svgTransform,
          classes: classes.value,
        }
        onTransformedHook.trigger(transformedData)
      }
    }

    const classes = computed(() => ({
      [state.defaultClassName]: !state.disabled,
      [state.defaultClassNameDragging]: state.dragging,
      [state.defaultClassNameDragged]: state.dragged,
    }))

    const addClasses = () =>
      Object.keys(get(classes)).forEach((cl) => {
        get(classes)[cl] ? get(node)?.classList.toggle(cl, true) : get(node)?.classList.toggle(cl, false)
      })

    watch(classes, addClasses)

    const { onDragStart: coreStart, onDrag: coreDrag, onDragStop: coreStop } = useDraggableCore(target, sharedState, true)

    coreDrag(({ event, data }) => onDrag(event, data))
    coreStart(({ event, data }) => onDragStart(event, data))
    coreStop(({ event, data }) => onDragStop(event, data))

    const onUpdated = (force = false) => {
      const pos = state.position
      log('Draggable: Updated %j', {
        position: state.currentPosition,
        prevPropsPosition: state.prevPropsPosition,
      })
      if (pos) {
        state.currentPosition = pos
        state.prevPropsPosition = { ...pos }
      }

      if (state.enableTransformFix) {
        applyTransformFix()
      } else {
        transform(force)
      }
    }

    tryOnUnmounted(() => {
      state.dragging = false
    })

    tryOnMounted(() => {
      node.value = unrefElement(target)
      if (!node) {
        console.error('You are trying to use <Draggable> without passing a valid target reference.')
        return
      }

      let x = 0
      let y = 0
      const pos = state.position
      const defaultPos = state.defaultPosition
      const stylePos = get(node)?.style

      if (pos && typeof pos.x !== 'undefined') {
        x = pos.x
      } else if (defaultPos && typeof defaultPos.x !== 'undefined') {
        x = defaultPos.x
      } else if (stylePos && stylePos.top) {
        x = int(stylePos.top)
      }

      if (pos && typeof pos.y !== 'undefined') {
        y = pos.y
      } else if (defaultPos && typeof defaultPos.y !== 'undefined') {
        y = defaultPos.y
      } else if (stylePos && stylePos.left) {
        y = int(stylePos.left)
      }

      state.currentPosition = { x, y }
      addClasses()
      onUpdated(true)

      watch(
        () => state.position,
        (val) => {
          let force = false
          if (val?.x !== state.currentPosition.x || val.y !== state.currentPosition.y) {
            force = true
          }
          onUpdated(force)
        },
      )
    })
  })

  return {
    ...toRefs(state),
    state,
    onDragStart: onDragStartHook.on,
    onDrag: onDragHook.on,
    onDragStop: onDragStopHook.on,
    onTransformed: onTransformedHook.on,
  }
}

export default useDraggable
