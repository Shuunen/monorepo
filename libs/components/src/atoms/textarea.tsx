import { Textarea as ShadTextarea } from "../shadcn/textarea";
import { type NameProp, testIdFromProps } from "./form.utils";

type TextareaProps = React.ComponentProps<typeof ShadTextarea> & NameProp;

export function Textarea({ ...props }: TextareaProps) {
  return <ShadTextarea data-testid={testIdFromProps("textarea", props)} {...props} />;
}
