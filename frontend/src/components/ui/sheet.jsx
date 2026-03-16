import * as React from "react"
import { Cross2Icon } from "@radix-ui/react-icons"
import * as AlertDialogPrimitive from "@radix-ui/react-alert-dialog"
import { cn } from "@/lib/utils"

const Sheet = AlertDialogPrimitive.Root

const SheetTrigger = AlertDialogPrimitive.Trigger

const SheetPortal = AlertDialogPrimitive.Portal

const SheetOverlay = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Overlay
    className={cn(
      "fixed inset-0 z-40 bg-background/80 backdrop-blur-sm data-[state=open]:animate-fade-in data-[state=closed]:animate-fade-out",
      className
    )}
    {...props}
    ref={ref}
  />
))
SheetOverlay.displayName = AlertDialogPrimitive.Overlay.displayName

const SheetContent = React.forwardRef(({ className, ...props }, ref) => (
  <SheetPortal>
    <SheetOverlay />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn(
        "fixed right-0 top-0 z-50 gap-4 border-l bg-background p-6 shadow-lg duration-200 data-[state=open]:animate-slide-up data-[state=closed]:animate-fade-out sm:rounded-lg h-screen w-full max-w-sm",
        className
      )}
      {...props}
    />
  </SheetPortal>
))
SheetContent.displayName = AlertDialogPrimitive.Content.displayName

const SheetHeader = ({ className, ...props }) => (
  <div className={cn("flex flex-col space-y-2 text-center sm:text-left", className)} {...props} />
)
SheetHeader.displayName = "SheetHeader"

const SheetFooter = ({ className, ...props }) => (
  <div
    className={cn("flex flex-col-reverse sm:flex-row sm:justify-end sm:space-x-2", className)}
    {...props}
  />
)
SheetFooter.displayName = "SheetFooter"

const SheetTitle = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Title
    ref={ref}
    className={cn("text-lg font-semibold leading-none tracking-tight", className)}
    {...props}
  />
))
SheetTitle.displayName = AlertDialogPrimitive.Title.displayName

const SheetDescription = React.forwardRef(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Description
    ref={ref}
    className={cn("text-sm text-muted-foreground", className)}
    {...props}
  />
))
SheetDescription.displayName = AlertDialogPrimitive.Description.displayName

export {
  Sheet,
  SheetPortal,
  SheetOverlay,
  SheetTrigger,
  SheetContent,
  SheetHeader,
  SheetFooter,
  SheetTitle,
  SheetDescription,
}
