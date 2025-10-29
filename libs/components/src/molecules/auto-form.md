# AutoForm

AutoForm needs to use AutoFormSummaryStep to display a summary to the user so he can review the data he is about to send. AutoFormSummaryStep is already done and available in the codebase, but AutoForm does not use it yet. When user reaches the last step of the auto form, AutoForm should render AutoFormSummaryStep instead of the last schema form. At this moment the user has the possibility to use the AutoFormStepper to navigate back to previous steps to modify data if needed. The user can also confirm the data as is by clicking on the "Proceed" button. When the user clicks on "Proceed" on the summary step, AutoForm should call the onSubmit callback (coming from the AutoForm props) with the collected data. The onSubmit callback will call an API to submit the data. The onSubmit callback will return an object containing the submission step props (AutoFormSubmissionStepProps) that AutoForm should use to render the AutoFormSubmissionStep. Implement this functionality in AutoForm. Add related tests and stories as needed. Summary and submission steps should not be visible in the stepper navigation. If the submission state is "success" or "warning", then the buttons in the Stepper are disabled, in the other cases the user can navigate back to previous steps to modify data and retry summary and submission.
Theses new steps are optional as you can see in the AutoFormProps types. If useSummaryStep is true, then AutoForm should use AutoFormSummaryStep after last schema step. If useSubmissionStep is true, then AutoForm should use AutoFormSubmissionStep after summary step or last schema step if summary step is not used.

Use this commands to check that there is no typescript errors : nx typecheck components
Use this command to run the unit tests : nx test components
Use this command to run the storybook stories tests : nx test-storybook components
Use this command to run the linter : pnpm check:oxlint

At the end of your implementation, make all these commands pass without errors.
