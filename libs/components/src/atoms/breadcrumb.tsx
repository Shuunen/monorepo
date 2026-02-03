import { IconChevronRight } from "../icons/icon-chevron-right";
import {
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  Breadcrumb as ShadBreadcrumb,
} from "../shadcn/breadcrumb";
import { cn } from "../shadcn/utils";

type Props = Readonly<{
  items: { label: string; link: string }[];
  className?: string;
}>;

function BreadcrumbSeparator({ children, className, ...props }: React.ComponentProps<"span">) {
  return (
    <span
      aria-hidden="true"
      className={cn("[&>svg]:size-3.5", className)}
      data-slot="breadcrumb-separator"
      role="presentation"
      {...props}
    >
      {children ?? <IconChevronRight />}
    </span>
  );
}

export function Breadcrumb({ items, className }: Props) {
  return (
    <ShadBreadcrumb className={className}>
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
  );
}
