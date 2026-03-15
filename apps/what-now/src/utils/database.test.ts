import { isBrowserEnvironment } from "@monorepo/utils";
import type { TaskDocument } from "../types";
import { localToRemoteTask, modelToLocalTask, modelToRemoteTask } from "./database.utils";

describe("database.utils", () => {
  const taskModelA = {
    _id: "test-task-id",
    _rev: "1-rev",
    completedOn: "2025-08-03T00:00:00.000+00:00",
    isDone: false,
    minutes: 5,
    name: "test task",
    once: "month",
    reason: "test reason",
    type: "task",
  } satisfies Readonly<TaskDocument>;

  const taskLocalA = {
    completedOn: "2025-08-03T00:00:00.000+00:00",
    id: "test-task-id",
    isDone: false,
    minutes: 5,
    name: "test task",
    once: "month",
    reason: "test reason",
  };

  const taskRemoteFromModelA = {
    _id: "test-task-id",
    _rev: "1-rev",
    completedOn: "2025-08-03T00:00:00.000+00:00",
    isDone: false,
    minutes: 5,
    name: "test task",
    once: "month",
    reason: "test reason",
    type: "task",
  };

  const taskRemoteFromLocalA = {
    _id: "test-task-id",
    completedOn: "2025-08-03T00:00:00.000+00:00",
    isDone: false,
    minutes: 5,
    name: "test task",
    once: "month",
    reason: "test reason",
    type: "task",
  };

  it("should detect browser env", () => {
    expect(isBrowserEnvironment()).toMatchInlineSnapshot(`false`);
  });

  it("modelToLocalTask A", () => {
    expect(modelToLocalTask(taskModelA)).toStrictEqual(taskLocalA);
  });

  it("modelToRemoteTask A", () => {
    expect(modelToRemoteTask(taskModelA)).toStrictEqual(taskRemoteFromModelA);
  });

  it("localToRemoteTask A", () => {
    expect(localToRemoteTask(taskLocalA)).toStrictEqual(taskRemoteFromLocalA);
  });
});
