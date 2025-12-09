"use client"

import * as React from "react"
import { X } from "lucide-react"
import { cn } from "@/lib/utils"

// UseToast Hook Implementation
const TOAST_LIMIT = 1
const TOAST_REMOVE_DELAY = 1000000

type ToastProps = {
    id: string
    title?: string
    description?: string
    action?: React.ReactNode
    variant?: "default" | "destructive"
    open?: boolean
    onOpenChange?: (open: boolean) => void
}

import {
    Toast as ToastPrimitive,
    ToastAction,
    ToastClose,
    ToastDescription,
    ToastProvider,
    ToastTitle,
    ToastViewport,
} from "@/components/ui/toast"


// Simplified internal state for use-toast
type State = {
    toasts: ToastProps[]
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>()

// Simple event emitter
const listeners: Array<(state: State) => void> = []

let memoryState: State = { toasts: [] }

function dispatch(action: any) {
    switch (action.type) {
        case "ADD_TOAST":
            memoryState = {
                ...memoryState,
                toasts: [action.toast, ...memoryState.toasts].slice(0, TOAST_LIMIT),
            }
            break
        case "UPDATE_TOAST":
            memoryState = {
                ...memoryState,
                toasts: memoryState.toasts.map((t) =>
                    t.id === action.toast.id ? { ...t, ...action.toast } : t
                ),
            }
            break
        case "DISMISS_TOAST":
            const { toastId } = action
            if (toastId) {
                dispatch({ type: "UPDATE_TOAST", toast: { id: toastId, open: false } })
            } else {
                memoryState.toasts.forEach((toast) => {
                    dispatch({ type: "DISMISS_TOAST", toastId: toast.id })
                })
            }
            return
        case "REMOVE_TOAST":
            if (action.toastId === undefined) {
                memoryState = {
                    ...memoryState,
                    toasts: [],
                }
            } else {
                memoryState = {
                    ...memoryState,
                    toasts: memoryState.toasts.filter((t) => t.id !== action.toastId),
                }
            }
            break
    }

    listeners.forEach((listener) => {
        listener(memoryState)
    })
}

function toast({ ...props }: Omit<ToastProps, "id">) {
    const id = genId()

    const update = (props: ToastProps) =>
        dispatch({
            type: "UPDATE_TOAST",
            toast: { ...props, id },
        })
    const dismiss = () => dispatch({ type: "DISMISS_TOAST", toastId: id })

    dispatch({
        type: "ADD_TOAST",
        toast: {
            ...props,
            id,
            open: true,
            onOpenChange: (open: boolean) => {
                if (!open) dismiss()
            },
        },
    })

    return {
        id,
        dismiss,
        update,
    }
}

function useToast() {
    const [state, setState] = React.useState<State>(memoryState)

    React.useEffect(() => {
        listeners.push(setState)
        return () => {
            const index = listeners.indexOf(setState)
            if (index > -1) {
                listeners.splice(index, 1)
            }
        }
    }, [state])

    return {
        ...state,
        toast,
        dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
    }
}

let count = 0
function genId() {
    count = (count + 1) % Number.MAX_VALUE
    return count.toString()
}

export { useToast, toast }
