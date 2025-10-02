import * as React from "react"
import { cn } from "@/lib/utils"

export interface DropdownMenuProps {
  open?: boolean
  onOpenChange?: (open: boolean) => void
  children?: React.ReactNode
}

const DropdownMenu = ({ children }: DropdownMenuProps) => {
  return <div className="relative">{children}</div>
}

const DropdownMenuTrigger = ({ children, ...props }: {
  children: React.ReactNode
} & React.HTMLAttributes<HTMLButtonElement>) => {
  return (
    <button {...props}>
      {children}
    </button>
  )
}

const DropdownMenuContent = ({ className, children, ...props }: {
  className?: string;
  children: React.ReactNode;
} & React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn(
        "absolute right-0 z-50 min-w-[8rem] overflow-hidden rounded-md border bg-white shadow-md",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

const DropdownMenuItem = ({ className, children, ...props }: React.HTMLAttributes<HTMLDivElement>) => {
  return (
    <div 
      className={cn(
        "relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none transition-colors hover:bg-accent hover:text-accent-foreground",
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
}

export {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
}