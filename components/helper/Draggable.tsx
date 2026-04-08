import { useDraggable } from '@dnd-kit/core'
import { useSortable } from '@dnd-kit/sortable'

export type DraggableWrapperProps = Partial<ReturnType<typeof useSortable>> & {
  id?: any
  ref?: any
}

export interface DraggableProps {
  id: any
  component?: any
}

export default function Draggable(props: DraggableProps) {
  const Element = props.component || 'div'
  const { attributes, listeners, setNodeRef } = useDraggable({ id: props.id })

  return <Element ref={setNodeRef} {...attributes} {...listeners}></Element>
}
