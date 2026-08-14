"use client"

import { TanStackDevtools } from "@tanstack/react-devtools"
import { formDevtoolsPlugin } from "@tanstack/react-form-devtools"

export function TanStackDevtoolsPanel() {
  return (
    <TanStackDevtools
      config={{
        hideUntilHover: true,
      }}
      plugins={[
        formDevtoolsPlugin(),
      ]}
    />
  )
}