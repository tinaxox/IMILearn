import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface TabSectionCardProps {
  title: string
  action?: ReactNode
  contentClassName?: string
  children: ReactNode
}

export function TabSectionCard({ title, action, contentClassName, children }: TabSectionCardProps) {
  return <Card>
    <CardHeader className="flex flex-row items-center justify-between">
      <CardTitle>{title}</CardTitle>
      {action}
    </CardHeader>
    <CardContent className={contentClassName}>{children}</CardContent>
  </Card>
}
