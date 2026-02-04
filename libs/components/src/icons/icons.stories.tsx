// oxlint-disable max-dependencies
import {
  DebugData,
  IconAccept,
  IconChevronDown,
  IconCircle,
  IconCircleCheck,
  IconCircleClose,
  IconCircleDot,
  IconCircleEllipsis,
  IconDownload,
  IconFileClock,
  IconHourglass,
  IconListAdd,
  IconOwl,
  IconReject,
  IconSearch,
  IconSearchCheck,
  IconSearchX,
  IconTrash,
  IconUpload,
  IconUser,
  IconUsers,
} from "@monorepo/components";
import type { Meta, StoryObj } from "@storybook/react-vite";
import type { JSX } from "react";
import { IconAdd } from "./icon-add";
import { IconArrowDown } from "./icon-arrow-down";
import { IconArrowLeft } from "./icon-arrow-left";
import { IconArrowRight } from "./icon-arrow-right";
import { IconArrowUp } from "./icon-arrow-up";
import { IconCheck } from "./icon-check";
import { IconChevronRight } from "./icon-chevron-right";
import { IconEdit } from "./icon-edit";
import { IconError } from "./icon-error";
import { IconHome } from "./icon-home";
import { IconLoading } from "./icon-loading";
import { IconMinus } from "./icon-minus";
import { IconReadonly } from "./icon-readonly";
import { IconSelect } from "./icon-select";
import { IconSuccess } from "./icon-success";
import { IconTooltip } from "./icon-tooltip";
import { IconUpcoming } from "./icon-upcoming";
import { IconWarning } from "./icon-warning";

const icons = [
  IconAccept,
  IconAdd,
  IconArrowDown,
  IconArrowLeft,
  IconArrowRight,
  IconArrowUp,
  IconCheck,
  IconChevronDown,
  IconChevronRight,
  IconCircle,
  IconCircleCheck,
  IconCircleClose,
  IconCircleDot,
  IconCircleEllipsis,
  IconDownload,
  IconEdit,
  IconError,
  IconFileClock,
  IconHome,
  IconHourglass,
  IconListAdd,
  IconLoading,
  IconOwl,
  IconReadonly,
  IconReject,
  IconSearch,
  IconSearchCheck,
  IconSearchX,
  IconSelect,
  IconSuccess,
  IconTooltip,
  IconTrash,
  IconUpcoming,
  IconUpload,
  IconWarning,
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
