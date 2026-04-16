import { Menu } from '@base-ui/react/menu'
import type { ReactNode } from 'react'

export function DropdownMenu({ trigger, children, align = 'end' }: {
    trigger: ReactNode
    children: ReactNode
    align?: 'start' | 'center' | 'end'
}) {
    return (
        <Menu.Root>
            <Menu.Trigger render={(props) => <button type="button" {...props}>{trigger}</button>} />
            <Menu.Portal>
                <Menu.Positioner align={align} sideOffset={6}>
                    <Menu.Popup className="min-w-[220px] rounded-xl border border-border bg-surface-2 p-1 shadow-2xl shadow-black/40">
                        {children}
                    </Menu.Popup>
                </Menu.Positioner>
            </Menu.Portal>
        </Menu.Root>
    )
}

export function DropdownMenuItem({ children, onClick, destructive }: {
    children: ReactNode
    onClick?: () => void
    destructive?: boolean
}) {
    return (
        <Menu.Item
            onClick={onClick}
            className={`flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm cursor-pointer outline-none ${
                destructive
                    ? 'text-accent hover:bg-accent/10'
                    : 'text-foreground hover:bg-surface-3'
            }`}
        >
            {children}
        </Menu.Item>
    )
}

export function DropdownMenuSeparator() {
    return <Menu.Separator className="my-1 h-px bg-border" />
}
