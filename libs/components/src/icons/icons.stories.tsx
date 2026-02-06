// oxlint-disable max-dependencies
import { DebugData } from "@monorepo/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";
import { IconAccept } from "./icon-accept";
import { IconAdd } from "./icon-add";
import { IconArrowDown } from "./icon-arrow-down";
import { IconArrowLeft } from "./icon-arrow-left";
import { IconArrowRight } from "./icon-arrow-right";
import { IconArrowUp } from "./icon-arrow-up";
import { IconCalendar } from "./icon-calendar";
import { IconCheck } from "./icon-check";
import { IconChevronDown } from "./icon-chevron-down";
import { IconChevronRight } from "./icon-chevron-right";
import { IconCircle } from "./icon-circle";
import { IconCircleAdd } from "./icon-circle-add";
import { IconCircleCheck } from "./icon-circle-check";
import { IconCircleClose } from "./icon-circle-close";
import { IconCircleDot } from "./icon-circle-dot";
import { IconCircleEllipsis } from "./icon-circle-ellipsis";
import { IconCircleQuestionMark } from "./icon-circle-question-mark";
import { IconCircleX } from "./icon-circle-x";
import { IconDownload } from "./icon-download";
import { IconEdit } from "./icon-edit";
import { IconError } from "./icon-error";
import { IconFileClock } from "./icon-file-clock";
import { IconHome } from "./icon-home";
import { IconHourglass } from "./icon-hourglass";
import { IconListAdd } from "./icon-list-add";
import { IconListRemove } from "./icon-list-remove";
import { IconLoading } from "./icon-loading";
import { IconMinus } from "./icon-minus";
import { IconOwl } from "./icon-owl";
import { IconReadonly } from "./icon-readonly";
import { IconReject } from "./icon-reject";
import { IconSearch } from "./icon-search";
import { IconSearchCheck } from "./icon-search-check";
import { IconSearchX } from "./icon-search-x";
import { IconSelect } from "./icon-select";
import { IconSettings } from "./icon-settings";
import { IconSuccess } from "./icon-success";
import { IconTooltip } from "./icon-tooltip";
import { IconTrash } from "./icon-trash";
import { IconUpcoming } from "./icon-upcoming";
import { IconUpload } from "./icon-upload";
import { IconUser } from "./icon-user";
import { IconUsers } from "./icon-users";
import { IconWarning } from "./icon-warning";
import { IconX } from "./icon-x";

const icons = [
  IconAccept,
  IconAdd,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconCalendar,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCircle,
  IconCircleAdd,
  IconCircleCheck,
  IconCircleClose,
  IconCircleDot,
  IconCircleEllipsis,
  IconCircleQuestionMark,
  IconCircleX,
  IconDownload,
  IconEdit,
  IconError,
  IconFileClock,
  IconHome,
  IconHourglass,
  IconListAdd,
  IconListRemove,
  IconLoading,
  IconOwl,
  IconReadonly,
  IconReject,
  IconSearch,
  IconSearchCheck,
  IconSearchX,
  IconSelect,
  IconSettings,
  IconSuccess,
  IconTooltip,
  IconTrash,
  IconUpcoming,
  IconUpload,
  IconWarning,
  IconX,
  IconMinus,
  IconUser,
  IconUsers,
];

type Props = { component: ({ className }: { className?: string | undefined }) => JSX.Element };

function Icon({ component: Component }: Props) {
  return (
    <div className="flex items-center gap-4">
      <div className="flex size-14 items-center justify-center transition-colors hover:bg-slate-800 hover:text-blue-300">
        <Component />
      </div>
      <DebugData data={`<${Component.name} />`} />
    </div>
  );
}

const meta = {
  parameters: {
    layout: "centered",
  },
  render: () => (
    <div className="grid w-full gap-4 md:grid-cols-3">
      {icons.map(icon => (
        <Icon component={icon} key={icon.name} />
      ))}
    </div>
  ),
  tags: ["autodocs"],
  title: "Commons/Atoms/Icons",
} satisfies Meta;

export default meta;

type Story = StoryObj<typeof meta>;

export const Icons: Story = {};
