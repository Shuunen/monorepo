import { RadioGroup as ShadRadioGroup, RadioGroupItem as ShadRadioGroupItem } from "../shadcn/radio-group";
import { type NameProp, testIdFromProps } from "./form.utils";

type RadioGroupProps = React.ComponentProps<typeof ShadRadioGroup> & NameProp;

export function RadioGroup(props: RadioGroupProps) {
  return <ShadRadioGroup data-testid={testIdFromProps("radio", props)} {...props} />;
}

type RadioGroupItemProps = React.ComponentProps<typeof ShadRadioGroupItem> & NameProp;

export function RadioGroupItem(props: RadioGroupItemProps) {
  return <ShadRadioGroupItem data-testid={testIdFromProps("radio-item", props, true)} {...props} />;
}
