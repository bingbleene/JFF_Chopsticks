import * as React from "react"
import { cn } from "@/utils/utils"

const Select = React.forwardRef(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      "flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs placeholder:text-muted-foreground outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/20 disabled:cursor-not-allowed disabled:opacity-50 dark:shadow-xs appearance-none",
      className
    )}
    {...props}
  />
))
Select.displayName = "Select"

export { Select }
