import * as React from "react"
import { Slot } from "@radix-ui/react-slot"
import { cva, type VariantProps } from "class-variance-authority"

import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex items-center justify-center whitespace-nowrap rounded-xl text-sm font-medium ring-offset-background transition-all duration-200 focus-visible:outline-none focus-visible:ring-3 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 min-h-[44px]",
  {
    variants: {
      variant: {
        default: "dashboard-button-primary",
        destructive: "bg-gradient-to-r from-red-600 to-red-700 text-white border-2 border-transparent font-semibold hover:from-red-700 hover:to-red-800 hover:shadow-lg focus:ring-red-500",
        outline: "border-2 border-gray-300 bg-white text-gray-900 font-medium hover:bg-gray-50 hover:border-gray-400 focus:ring-gray-500",
        secondary: "dashboard-button-secondary",
        ghost: "text-gray-700 font-medium hover:bg-gray-100 hover:text-gray-900 focus:ring-gray-500",
        link: "text-blue-600 underline-offset-4 hover:underline font-medium focus:ring-blue-500",
      },
      size: {
        default: "px-6 py-3",
        sm: "px-4 py-2 text-sm min-h-[40px]",
        lg: "px-8 py-4 text-lg min-h-[52px]",
        icon: "h-11 w-11",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : "button"
    return (
      <Comp
        className={cn(buttonVariants({ variant, size, className }))}
        ref={ref}
        {...props}
      />
    )
  }
)
Button.displayName = "Button"

export { Button, buttonVariants }
