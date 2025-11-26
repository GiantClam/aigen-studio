"use client"

import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/lib/utils"

interface SelectProps {
  children: React.ReactNode
  value?: string
  onValueChange?: (value: string) => void
}

interface SelectTriggerProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode
  selectedValue?: string
}

interface SelectContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
  selectedValue?: string
  onValueChange?: (value: string) => void
}

interface SelectItemProps extends React.HTMLAttributes<HTMLDivElement> {
  value: string
  children: React.ReactNode
  isSelected?: boolean
  onSelect?: () => void
}

const Select = ({ children, value, onValueChange }: SelectProps) => {
  const [isOpen, setIsOpen] = React.useState(false)
  const [selectedValue, setSelectedValue] = React.useState(value || '')
  
  const handleValueChange = (newValue: string) => {
    setSelectedValue(newValue)
    onValueChange?.(newValue)
    setIsOpen(false)
  }
  
  return (
    <div className="relative">
      {React.Children.map(children, child => {
        if (React.isValidElement(child)) {
          if (child.type === SelectTrigger) {
            return React.cloneElement(child, { 
              onClick: () => setIsOpen(!isOpen),
              'aria-expanded': isOpen,
              selectedValue 
            } as any)
          }
          if (child.type === SelectContent && isOpen) {
            return React.cloneElement(child, { 
              onValueChange: handleValueChange,
              selectedValue 
            } as any)
          }
          if (child.type === SelectValue) {
            return React.cloneElement(child, { 
              value: selectedValue
            } as any)
          }
        }
        return child
      })}
    </div>
  )
}

const SelectTrigger = React.forwardRef<HTMLButtonElement, SelectTriggerProps>(
  ({ className, children, selectedValue, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={cn(
          "flex h-10 w-full items-center justify-between rounded-md border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      >
        <span className="truncate">{children}</span>
        <ChevronDown className="h-4 w-4 opacity-50" />
      </button>
    )
  }
)
SelectTrigger.displayName = "SelectTrigger"

const SelectContent = React.forwardRef<HTMLDivElement, SelectContentProps>(
  ({ className, children, selectedValue, onValueChange, ...props }, ref) => (
    <div
      ref={ref}
      className={cn(
        "absolute z-50 max-h-96 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md top-full mt-1 w-full",
        className
      )}
      role="listbox"
      {...props}
    >
      <div className="p-1">
        {React.Children.map(children, child => {
          if (!React.isValidElement(child)) return child
          const val = (child.props as any)?.value
          if (typeof val === 'undefined') return child
          const element = child as React.ReactElement<SelectItemProps>
          return React.cloneElement(element, {
            onSelect: () => onValueChange?.(val),
            isSelected: val === selectedValue,
          } as Partial<SelectItemProps>)
        })}
      </div>
    </div>
  )
)
SelectContent.displayName = "SelectContent"

const SelectItem = React.forwardRef<HTMLDivElement, SelectItemProps>(
  ({ className, children, isSelected, onSelect, ...props }, ref) => (
    <div
      ref={ref}
      tabIndex={0}
      role="option"
      aria-selected={!!isSelected}
      className={cn(
        "relative flex w-full cursor-pointer select-none items-center rounded-sm py-1.5 pl-8 pr-2 text-sm outline-none hover:bg-gray-100 focus:bg-gray-100",
        isSelected && "bg-blue-50 text-blue-900",
        className
      )}
      onMouseDown={(e) => { e.preventDefault(); e.stopPropagation(); onSelect?.() }}
      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onSelect?.() } }}
      {...props}
    >
      {isSelected && (
        <span className="absolute left-2 flex h-3.5 w-3.5 items-center justify-center">
          <div className="h-2 w-2 rounded-full bg-blue-600" />
        </span>
      )}
      {children}
    </div>
  )
)
SelectItem.displayName = "SelectItem"

const SelectValue = ({ placeholder, value }: { placeholder?: string; value?: string }) => {
  return <span>{value || placeholder}</span>
}

export {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
}
