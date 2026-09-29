import type { ReactNode } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export interface TabSectionCardProps {
  title: string
  action?: ReactNode
  className?: string
  contentClassName?: string
  children: ReactNode
}

export function TabSectionCard({
  title,
  action,
  className,
  contentClassName,
  children,
}: TabSectionCardProps) {
  return (
    <Card className={className}>
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle>{title}</CardTitle>
        {action}
      </CardHeader>
      <CardContent className={contentClassName}>{children}</CardContent>
    </Card>
  )
}
