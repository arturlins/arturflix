import {
    DndContext,
    DragOverlay,
    KeyboardSensor,
    PointerSensor,
    closestCenter,
    useSensor,
    useSensors,
    type DragEndEvent,
} from '@dnd-kit/core'
import {
    SortableContext,
    arrayMove,
    sortableKeyboardCoordinates,
    useSortable,
    verticalListSortingStrategy,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { GripVertical } from 'lucide-react'
import { useState, type ReactNode } from 'react'

type Props<T extends { public_id: string }> = {
    items: T[]
    onReorder: (newOrder: T[]) => void
    renderItem: (item: T, index: number) => ReactNode
}

export function SortableList<T extends { public_id: string }>({ items, onReorder, renderItem }: Props<T>) {
    const [activeId, setActiveId] = useState<string | null>(null)
    const sensors = useSensors(
        useSensor(PointerSensor, { activationConstraint: { distance: 4 } }),
        useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
    )

    function handleDragEnd(event: DragEndEvent): void {
        setActiveId(null)
        const { active, over } = event
        if (!over || active.id === over.id) return
        const oldIndex = items.findIndex((i) => i.public_id === active.id)
        const newIndex = items.findIndex((i) => i.public_id === over.id)
        onReorder(arrayMove(items, oldIndex, newIndex))
    }

    const activeItem = activeId ? items.find((i) => i.public_id === activeId) : null
    const activeIndex = activeItem ? items.indexOf(activeItem) : -1

    return (
        <DndContext
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragStart={(e) => setActiveId(String(e.active.id))}
            onDragEnd={handleDragEnd}
            onDragCancel={() => setActiveId(null)}
        >
            <SortableContext items={items.map((i) => i.public_id)} strategy={verticalListSortingStrategy}>
                <ul className="space-y-2">
                    {items.map((item, index) => (
                        <SortableRow key={item.public_id} id={item.public_id} index={index}>
                            {renderItem(item, index)}
                        </SortableRow>
                    ))}
                </ul>
            </SortableContext>
            <DragOverlay dropAnimation={{ duration: 180, easing: 'cubic-bezier(0.18, 0.67, 0.6, 1.22)' }}>
                {activeItem && (
                    <div className="rounded-xl border border-accent/40 bg-surface-2 shadow-2xl shadow-black/60 cursor-grabbing">
                        <div className="flex items-center gap-2 py-3 px-4">
                            <span className="font-mono tabular-nums text-xs text-foreground-faint w-6 text-right shrink-0">
                                {String(activeIndex + 1).padStart(2, '0')}
                            </span>
                            {renderItem(activeItem, activeIndex)}
                        </div>
                    </div>
                )}
            </DragOverlay>
        </DndContext>
    )
}

function SortableRow({ id, index, children }: { id: string; index: number; children: ReactNode }) {
    const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id })

    return (
        <li
            ref={setNodeRef}
            data-dragging={isDragging || undefined}
            style={{ transform: CSS.Transform.toString(transform), transition }}
            className={`group flex items-center gap-2 rounded-xl border bg-surface-2 transition-all ${
                isDragging
                    ? 'border-accent/40 shadow-2xl shadow-accent/10 scale-[1.01] opacity-50'
                    : 'border-border hover:border-border-strong'
            }`}
        >
            <span className="font-mono tabular-nums text-xs text-foreground-faint w-6 text-right shrink-0 pl-3">
                {String(index + 1).padStart(2, '0')}
            </span>
            <button
                type="button"
                {...attributes}
                {...listeners}
                aria-label="Reordenar"
                className="opacity-0 group-hover:opacity-100 data-[dragging]:opacity-100 transition-opacity grid place-items-center px-1 py-4 text-foreground-subtle hover:text-foreground cursor-grab active:cursor-grabbing"
            >
                <GripVertical size={14} />
            </button>
            <div className="flex-1 min-w-0 py-3 pr-4">{children}</div>
        </li>
    )
}
