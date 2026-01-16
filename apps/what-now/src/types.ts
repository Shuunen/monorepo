export type Task = {
  /** @example "2025-01-26T18:53:32.006+00:00" */
  completedOn: string;
  /**
   * The id of the task, like "id-123"
   */
  id: string;
  /**
   * True if the task is completely done
   * For example, a one-time task or a recurring task that should not be done anymore
   */
  isDone: boolean;
  /**
   * The average time to complete the task in minutes
   */
  minutes: number;
  /** @example "ranger un truc qui traîne" */
  name: string;
  /**
   * The frequency of the task like "day", "2-months"
   */
  once: string;
  /**
   * The reason to take time and energy to do this task :)
   */
  reason?: string;
};

export type AppWriteTask = {
  /** @example "2025-01-26T18:53:32.006+00:00" */
  "completed-on": string;
  /** @example false */
  done: boolean;
  /** @example 5 */
  minutes: number;
  /** @example "ranger un truc qui traîne" */
  name: string;
  /** @example "day" */
  once: string;
  /** @example null */
  reason?: string | null;
};
