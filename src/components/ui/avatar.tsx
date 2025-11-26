"use client"

import * as React from "react"
import { cn } from "@/lib/utils"
import Image, { type ImageProps } from "next/image"

const Avatar = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full",
      className
    )}
    {...props}
  />
))
Avatar.displayName = "Avatar"

const AvatarImage = React.forwardRef<HTMLImageElement, Omit<ImageProps, 'fill' | 'width' | 'height'>>(
  ({ className, alt = "", src, ...props }, _ref) => (
    <Image
      alt={alt}
      src={src as any}
      fill
      sizes="40px"
      className={cn("object-cover", className)}
      {...props as any}
    />
  )
)
AvatarImage.displayName = "AvatarImage"

const AvatarFallback = React.forwardRef<
  HTMLDivElement,
  React.HTMLAttributes<HTMLDivElement>
>(({ className, ...props }, ref) => (
  <div
    ref={ref}
    className={cn(
      "flex h-full w-full items-center justify-center rounded-full bg-gray-100 text-gray-600",
      className
    )}
    {...props}
  />
))
AvatarFallback.displayName = "AvatarFallback"

export { Avatar, AvatarImage, AvatarFallback }
