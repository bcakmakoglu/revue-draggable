import { DraggableOptions, DraggableState } from '../utils'

export default (options?: Partial<DraggableOptions>): (() => DraggableState) => {
  const state = reactive(
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
        currentPosition: { x: NaN, y: NaN },
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
      options
    )
  )

  return (): DraggableState => state
}
