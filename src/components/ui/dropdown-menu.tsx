"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DropdownMenuProps {
  children: React.ReactNode
}

interface DropdownMenuTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  asChild?: boolean
}

interface DropdownMenuContentProps extends React.HTMLAttributes<HTMLDivElement> {
  align?: 'start' | 'center' | 'end'
}

interface DropdownMenuItemProps extends React.HTMLAttributes<HTMLDivElement> {
  inset?: boolean
}

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const containerRef = React.useRef<HTMLDivElement>(null)

  // 点击外部关闭 & ESC 关闭
  React.useEffect(() => {
    if (!isOpen) return
    const onDown = (e: MouseEvent) => {
      if (!containerRef.current) return
      if (!containerRef.current.contains(e.target as Node)) {
        setIsOpen(false)
      }
    }
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('mousedown', onDown)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onDown)
      document.removeEventListener('keydown', onKey)
    }
  }, [isOpen])
  
  return (
    <div ref={containerRef} className="relative inline-block text-left">
      {React.Children.map(children, child => {
        if (!React.isValidElement(child)) return child
        const typeName = (child.type as any)?.displayName
        const isTrigger = child.type === DropdownMenuTrigger || typeName === 'DropdownMenuTrigger'
        const isContent = child.type === DropdownMenuContent || typeName === 'DropdownMenuContent'

        if (isTrigger) {
          return React.cloneElement(child, {
            onClick: () => setIsOpen(!isOpen),
            'aria-expanded': isOpen,
          } as any)
        }
        if (isContent) {
          if (!isOpen) return null
          return React.cloneElement(child, {
            onClose: () => setIsOpen(false),
            onClick: () => setIsOpen(false),
          } as any)
        }
        return child
      })}
    </div>
  )
}

const DropdownMenuTrigger = React.forwardRef<HTMLButtonElement, DropdownMenuTriggerProps & { children?: React.ReactElement }>(
  ({ className, asChild = false, children, ...props }, ref) => {
    if (asChild) {
      return React.cloneElement(children as React.ReactElement, {
        ref,
        className: cn(className),
        ...(() => {
          const { children: _omit, ...rest } = props as any
          return rest
        })()
      })
    }
    
    return (
      <button
        ref={ref}
        className={cn(
          "inline-flex items-center justify-center rounded-md text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50",
          className
        )}
        {...props}
      />
    )
  }
)
DropdownMenuTrigger.displayName = "DropdownMenuTrigger"

const DropdownMenuContent = React.forwardRef<HTMLDivElement, DropdownMenuContentProps & { onClose?: () => void }>(
  ({ className, align = 'end', onClose, ...props }, ref) => {
    const alignClasses = {
      start: 'left-0',
      center: 'left-1/2 transform -translate-x-1/2',
      end: 'right-0'
    }
    
    return (
      <div
        ref={ref}
        className={cn(
          "absolute z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white p-1 shadow-md",
          alignClasses[align],
          "top-full mt-1",
          className
        )}
        role="menu"
        aria-orientation="vertical"
        {...props}
      />
    )
  }
)
DropdownMenuContent.displayName = "DropdownMenuContent"

const DropdownMenuItem = React.forwardRef<HTMLDivElement, DropdownMenuItemProps>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-gray-100 focus:bg-gray-100",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
)
DropdownMenuItem.displayName = "DropdownMenuItem"

const DropdownMenuLabel = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement> & { inset?: boolean }>(
  ({ className, inset, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "px-2 py-1.5 text-sm font-semibold text-gray-900",
        inset && "pl-8",
        className
      )}
      {...props}
    />
  )
)
DropdownMenuLabel.displayName = "DropdownMenuLabel"

const DropdownMenuSeparator = React.forwardRef<HTMLDivElement, React.HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div
      ref={ref}
      className={cn("-mx-1 my-1 h-px bg-gray-200", className)}
      {...props}
    />
  )
)
DropdownMenuSeparator.displayName = "DropdownMenuSeparator"

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
}
