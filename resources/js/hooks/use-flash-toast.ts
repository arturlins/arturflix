import { useEffect } from 'react'
import { usePage } from '@inertiajs/react'
import { toast } from 'sonner'
import { PageProps } from '@/types'

export function useFlashToast() {
    const { props } = usePage<PageProps>()
    useEffect(() => {
        if (props.flash?.success) toast.success(props.flash.success)
        if (props.flash?.error) toast.error(props.flash.error)
    }, [props.flash?.success, props.flash?.error])
}
