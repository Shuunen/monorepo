import { BreadcrumbItem, BreadcrumbLink, BreadcrumbList, BreadcrumbPage, BreadcrumbSeparator, Breadcrumb as ShadBreadcrumb } from '../shadcn/breadcrumb'

type Props = {
  items: { label: string; link: string }[]
}

export function Breadcrumb({ items }: Props) {
  return (
    <ShadBreadcrumb>
      <BreadcrumbList>
        {items.map((item, index) => (
          <BreadcrumbItem key={item.link + item.label}>
            {index < items.length - 1 ? (
              <>
                <BreadcrumbLink href={item.link}>{item.label}</BreadcrumbLink>
                <BreadcrumbSeparator />
              </>
            ) : (
              <BreadcrumbPage>{item.label}</BreadcrumbPage>
            )}
          </BreadcrumbItem>
        ))}
      </BreadcrumbList>
    </ShadBreadcrumb>
  )
}
