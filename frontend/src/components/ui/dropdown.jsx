import * as React from "react"
import { ChevronDown } from "lucide-react"
import { cn } from "@/utils/utils"

const Dropdown = React.forwardRef(({ className, ...props }, ref) => (
  <div ref={ref} className={cn("relative inline-block", className)} {...props} />
))
Dropdown.displayName = "Dropdown"

const DropdownTrigger = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn("inline-flex items-center gap-2", className)}
    {...props}
  />
))
DropdownTrigger.displayName = "DropdownTrigger"

const DropdownContent = React.forwardRef(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "absolute top-full left-0 mt-1 bg-card border border-border rounded-md shadow-lg z-50 min-w-[200px]",
      className
    )}
    {...props}
  />
))
DropdownContent.displayName = "DropdownContent"

const DropdownItem = React.forwardRef(({ className, ...props }, ref) => (
  <button
    ref={ref}
    className={cn(
      "w-full text-left px-4 py-2 hover:bg-accent hover:text-accent-foreground outline-none first:rounded-t-md last:rounded-b-md text-foreground",
      className
    )}
    {...props}
  />
))
DropdownItem.displayName = "DropdownItem"

export { Dropdown, DropdownTrigger, DropdownContent, DropdownItem }
