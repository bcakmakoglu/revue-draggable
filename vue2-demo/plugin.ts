import { Vue2 } from 'vue-demi'
import { DraggablePlugin } from '@braks/revue-draggable'

// @ts-expect-error - global install
Vue2.use(DraggablePlugin)
