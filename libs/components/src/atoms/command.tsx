import { Command as CommandPrimitive } from "cmdk";
import type { ComponentProps } from "react";
import { IconSearch } from "../icons/icon-search";
import type { CommandInput as ShadCommandInput } from "../shadcn/command";
import { cn } from "../shadcn/utils";
import { type NameProp, testIdFromProps } from "./form.utils";

export {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandItem,
  CommandList,
  CommandSeparator,
} from "../shadcn/command";

type CommandInputProps = ComponentProps<typeof ShadCommandInput> & NameProp;

export function CommandInput({ className, ...props }: CommandInputProps) {
  return (
    <div className="flex h-9 items-center gap-2 border-b px-3" data-slot="command-input-wrapper" hidden={props.hidden}>
      <IconSearch className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        className={cn("placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50", className)}
        data-slot="command-input"
        data-testid={testIdFromProps("command-input", props)}
        {...props}
      />
    </div>
  );
}

// TODO : ideally we add data-testid handling (and other customizations) like in button.tsx instead of just exposing the raw shadcn component
