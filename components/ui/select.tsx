"use client"

import * as React from "react"


// Since we cannot run 'npx shadcn-ui add select', we will implement a basic Select using standard HTML Select for now to save time and lines of code, 
// OR we can implement the full Radix wrapper if the user expects high fidelity.
// Given strict "Premium Design" instructions, I should try to make it look good, but full Radix Select is bloated (many files).
// However, the import was `@/components/ui/select`.
// Let's implement a wrapper around native select but styled, or if Radix is available in node_modules, use it.
// `package.json` didn't show `@radix-ui/react-select`.

// Wait, let's check package.json again. 
// Step 82: "dependencies": { ... "zod": "^4.1.13" } -- NO radix primitives listed except maybe implicitly?
// No, standard shadcn uses @radix-ui/react-*.
// If they are not in package.json, I cannot use them.

// I checked package.json in Step 82.
// Dependencies: @hookform/resolvers, @supabase/ssr, @supabase/supabase-js, class-variance-authority, clsx, date-fns, lucide-react, next, react, react-dom, react-hook-form, tailwind-merge, tailwindcss-animate, zod.
// NO RADIX UI PACKAGES.

// This means `components/ui/select` if it existed would have been broken or using native.
// BUT `components/ui/label.tsx` etc exist. Let's check `components/ui/label.tsx` to see if it uses radix.

// If Radix is missing, I MUST use native HTML elements styled with Tailwind.
// I cannot magically import Radix if it is not installed.
// So I will create a `components/ui/select.tsx` that exports the same API but uses native `<select>`.

import { cn } from "@/lib/utils"

const Select = React.forwardRef<
    HTMLSelectElement,
    React.InputHTMLAttributes<HTMLSelectElement> & { onValueChange?: (val: string) => void }
>(({ className, children, onValueChange, ...props }, ref) => {
    const handleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        props.onChange?.(e)
        onValueChange?.(e.target.value)
    }
    return (
        <div className="relative">
            <select
                className={cn(
                    "flex h-10 w-full items-center justify-between rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
                    className
                )}
                ref={ref}
                onChange={handleChange}
                {...props}
            >
                {children}
            </select>
        </div>
    )
})
Select.displayName = "Select"

const SelectGroup = React.forwardRef<HTMLOptGroupElement, React.OptgroupHTMLAttributes<HTMLOptGroupElement>>(({ className, ...props }, ref) => (
    <optgroup ref={ref} className={cn("", className)} {...props} />
))
SelectGroup.displayName = "SelectGroup"

const SelectValue = React.forwardRef<HTMLSpanElement, React.HTMLAttributes<HTMLSpanElement> & { placeholder?: string }>(({ className, placeholder, ...props }, ref) => (
    <span ref={ref} className={cn("hidden", className)} {...props}>
        {placeholder}
    </span>
))
SelectValue.displayName = "SelectValue"

const SelectTrigger = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
    <div ref={ref} className={cn("hidden", className)} {...props}>{children}</div> // Hidden because native select is the trigger
))
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, children, ...props }, ref) => (
    <>{children}</> // Fragment because native select options are direct children
))
SelectContent.displayName = "SelectContent"

// For native, Item and Label are specific
const SelectLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("py-1.5 pl-8 pr-2 text-sm font-semibold", className)} {...props} />
))
SelectLabel.displayName = "SelectLabel"

const SelectItem = React.forwardRef<
    HTMLOptionElement,
    React.OptionHTMLAttributes<HTMLOptionElement>
>(({ className, children, ...props }, ref) => (
    <option
        ref={ref}
        className={cn(
            "relative flex w-full cursor-default select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none focus:bg-accent focus:text-accent-foreground data-[disabled]:pointer-events-none data-[disabled]:opacity-50",
            className
        )}
        {...props}
    >
        {children}
    </option>
))
SelectItem.displayName = "SelectItem"

const SelectSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(({ className, ...props }, ref) => (
    <div ref={ref} className={cn("-mx-1 my-1 h-px bg-muted", className)} {...props} />
))
SelectSeparator.displayName = "SelectSeparator"

export {
    Select,
    SelectGroup,
    SelectValue,
    SelectTrigger,
    SelectContent,
    SelectLabel,
    SelectItem,
    SelectSeparator,
}
