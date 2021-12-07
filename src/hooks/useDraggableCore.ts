import { get, MaybeElementRef } from '@vueuse/core'
import {
  addUserSelectStyles,
  getTouchIdentifier,
  matchesSelectorAndParentsTo,
  removeEvent,
  removeUserSelectStyles,
  createCoreData,
  getControlPosition,
  snapToGrid,
  addEvent,
  isFunction,
  log,
  DraggableCoreOptions,
  DraggableEvent,
  DraggableState,
  EventHandler,
  MouseTouchEvent,
  UseDraggableCore
} from '~/utils'
import useState from './useState'

// Simple abstraction for dragging events names.
const eventsFor = {
  touch: {
    start: 'touchstart',
    move: 'touchmove',
    stop: 'touchend'
  },
  mouse: {
    start: 'mousedown',
    move: 'mousemove',
    stop: 'mouseup'
  }
}

// Default to mouse events.
let dragEventFor = eventsFor.mouse

const useDraggableCore = (
  target: MaybeElementRef,
  options?: Partial<DraggableCoreOptions> | (() => DraggableState)
): UseDraggableCore => {
  const node = ref<HTMLElement | SVGElement>(),
    state = isFunction(options) ? options() : useState(options)(),
    pos = reactive({ x: NaN, y: NaN }),
    onDragStartHook = createEventHook<DraggableEvent>(),
    onDragHook = createEventHook<DraggableEvent>(),
    onDragStopHook = createEventHook<DraggableEvent>(),
    scope = effectScope()

  scope.run(() => {
    watch(
      () => state,
      (val) => {
        if (val.position && !val.dragging) {
          pos.x = NaN
          pos.y = NaN
        }
      }
    )

    const handleDragStart: EventHandler<MouseTouchEvent> = (e) => {
      const n = get(node)
      if (!state.allowAnyClick && 'button' in e && e.button !== 0) return false
      if (!n || !n.ownerDocument || !n.ownerDocument.body) {
        throw new Error('No ref element found on DragStart!')
      }
      const { ownerDocument } = n

      if (
        state.disabled ||
        !(ownerDocument.defaultView && e.target !== null && e.target instanceof ownerDocument.defaultView.Node) ||
        (state.handle && !matchesSelectorAndParentsTo(e.target, state.handle, n)) ||
        (state.cancel && matchesSelectorAndParentsTo(e.target, state.cancel, n))
      ) {
        return
      }

      const isTouch = e.type === 'touchstart'
      if (isTouch) e.preventDefault()
      state.touch = getTouchIdentifier(e)

      const position = getControlPosition({
        e,
        touch: state.touch,
        node: n,
        offsetContainer: state.offsetParent,
        scale: state.scale
      })
      if (position == null) return
      const { x, y } = position
      const coreEvent = createCoreData({
        node: n,
        x,
        y,
        lastX: pos.x,
        lastY: pos.y
      })

      log('DraggableCore: handleDragStart: %j', coreEvent)

      const shouldUpdate = state.start?.(e, coreEvent)
      onDragStartHook.trigger({ event: e, data: coreEvent })
      if ((shouldUpdate || state.update) === false) return false

      if (state.enableUserSelectHack) addUserSelectStyles(ownerDocument)

      state.dragging = true
      pos.x = x
      pos.y = y

      addEvent(ownerDocument, dragEventFor.move, handleDrag)
      addEvent(ownerDocument, dragEventFor.stop, handleDragStop)
    }

    const handleDrag: EventHandler<MouseTouchEvent> = (e) => {
      const n = get(node)
      if (n) {
        const position = getControlPosition({
          e,
          touch: state.touch,
          node: n,
          offsetContainer: state.offsetParent,
          scale: state.scale
        })
        if (position == null) return
        let { x, y } = position

        // Snap to grid if prop has been provided
        const grid = state.grid
        if (grid && Array.isArray(grid)) {
          let deltaX = x - pos.x,
            deltaY = y - pos.y
          ;[deltaX, deltaY] = snapToGrid(grid, deltaX, deltaY)
          if (!deltaX && !deltaY) return
          x = pos.x + deltaX
          y = pos.y + deltaY
        }

        const coreEvent = createCoreData({
          node: n,
          x,
          y,
          lastX: pos.x,
          lastY: pos.y
        })

        log('DraggableCore: handleDrag: %j', coreEvent)

        const shouldUpdate = state.move?.(e, coreEvent)
        onDragHook.trigger({ event: e, data: coreEvent })
        if ((shouldUpdate || state.update) === false) {
          try {
            handleDragStop(new MouseEvent('mouseup'))
          } catch (err) {
            // Old browsers
            const event = document.createEvent('MouseEvents')
            // I see why this insanity was deprecated
            event.initMouseEvent('mouseup', true, true, window, 0, 0, 0, 0, 0, false, false, false, false, 0, null)
            handleDragStop(event)
          }
          return
        }

        pos.x = x
        pos.y = y
      }
    }

    const handleDragStop: EventHandler<MouseTouchEvent> = (e) => {
      const n = get(node)
      if (!state.dragging) return

      if (n) {
        const position = getControlPosition({
          e,
          touch: state.touch,
          node: n,
          offsetContainer: state.offsetParent,
          scale: state.scale
        })
        if (position == null) return
        const { x, y } = position
        const coreEvent = createCoreData({
          node: n,
          x,
          y,
          lastX: pos.x,
          lastY: pos.y
        })

        const shouldUpdate = state.stop?.(e, coreEvent)
        onDragStopHook.trigger({ event: e, data: coreEvent })
        if ((shouldUpdate || state.update) === false) return false

        if (state.enableUserSelectHack) removeUserSelectStyles(n.ownerDocument)

        log('DraggableCore: handleDragStop: %j', coreEvent)

        state.dragging = false

        log('DraggableCore: Removing handlers')
        removeEvent(n.ownerDocument, dragEventFor.move, handleDrag)
        removeEvent(n.ownerDocument, dragEventFor.stop, handleDragStop)
      }
    }

    const onMouseDown: EventHandler<MouseTouchEvent> = (e) => {
      dragEventFor = eventsFor.mouse
      state.mouseDown?.(e)
      if (e.which == 3) return
      return handleDragStart(e)
    }

    const onMouseUp: EventHandler<MouseTouchEvent> = (e) => {
      dragEventFor = eventsFor.mouse
      return handleDragStop(e)
    }

    const onTouchStart: EventHandler<MouseTouchEvent> = (e) => {
      dragEventFor = eventsFor.touch
      return handleDragStart(e)
    }

    const onTouchEnd: EventHandler<MouseTouchEvent> = (e) => {
      dragEventFor = eventsFor.touch
      return handleDragStop(e)
    }

    tryOnMounted(() => {
      node.value = unrefElement(target)
      if (!node) {
        console.error('You are trying to use <DraggableCore> without passing a valid node reference. Canceling initialization.')
        return
      }
      useEventListener(get(node), eventsFor.touch.start, onTouchStart, { passive: false })
      useEventListener(get(node), eventsFor.touch.stop, onTouchEnd)
      useEventListener(get(node), eventsFor.mouse.start, onMouseDown)
      useEventListener(get(node), eventsFor.mouse.stop, onMouseUp)
    })
  })

  return {
    ...toRefs(state),
    state,
    onDragStart: onDragStartHook.on,
    onDrag: onDragHook.on,
    onDragStop: onDragStopHook.on
  }
}

export default useDraggableCore
