"use client"

import * as React from "react"
import { DirectionProvider as BaseDirectionProvider, useDirection as useBaseDirection } from "@radix-ui/react-direction"

function DirectionProvider({
  dir,
  direction,
  children,
}: React.ComponentProps<typeof BaseDirectionProvider> & {
  direction?: React.ComponentProps<typeof BaseDirectionProvider>["dir"]
}): React.JSX.Element {
  return (
    <BaseDirectionProvider dir={direction ?? dir}>
      {children}
    </BaseDirectionProvider>
  )
}

const useDirection = useBaseDirection

export { DirectionProvider, useDirection }
