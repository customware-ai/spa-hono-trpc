"use client"

import * as React from "react"
import { Direction } from "radix-ui"

const BaseDirectionProvider = Direction.DirectionProvider
const useBaseDirection = Direction.useDirection

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
