# Friction log

## Requested skill availability
- Task: load the brief's frontend-design and design-taste-frontend skills.
- Steps: searched installed skill roots and plugin cache.
- Expected: both skill files present. Actual: neither name found.
- Severity: low.
- Workaround: use installed high-end-visual-design and gpt-taste skills.
- Suggestion: briefs should name installed skill versions or allow equivalent capabilities.

## Bedrock account eligibility
- Task: invoke a low-token planning model through Converse in us-east-1.
- Steps: listed the model catalog, then invoked Nova Micro through the connector and local CLI.
- Expected: a short READY response. Actual: both returned ValidationException, Error 002, account model access not allowed.
- Severity: high for AI inference, low for the deterministic demo.
- Workaround: keep the provider abstraction and run transparent rules-based fallback.
- Suggestion: expose an account-readiness check with a specific enablement path before model invocation.

## Anthropic backup workspace scope
- Task: test the last-resort backup after Bedrock failed.
- Steps: invoked the configured model using the local key, with a ten-token limit.
- Expected: READY response. Actual: HTTP 400, an unscoped API key requires anthropic-workspace-id.
- Severity: medium.
- Workaround: added optional ANTHROPIC_WORKSPACE_ID configuration; deterministic fallback stays functional.
- Suggestion: credential setup should report required workspace scope before making an inference call.

## Windows sandbox and Next.js
- Task: build Next.js and verify local MCP calls.
- Steps: initial sandboxed build and localhost verification.
- Expected: compilation and HTTP responses. Actual: Turbopack junction access denied and localhost EACCES/timeout.
- Severity: medium.
- Workaround: ran build and application/test processes outside the sandbox; production build and protocol checks passed.
- Suggestion: distinguish sandbox filesystem restrictions from application build failures.

## Node environment flag propagation
- Task: share root environment configuration with Next.js.
- Steps: started Next using node --env-file-if-exists.
- Expected: root environment loaded. Actual: Next subprocess rejected the flag when propagated through NODE_OPTIONS.
- Severity: low.
- Workaround: dotenv loads the root file from next.config.ts without exposing values.
- Suggestion: preserve supported environment-loading behavior across Next child processes.

## CloudFormation permission difference
- Task: validate and deploy the AWS stack.
- Steps: local cfn-lint and cfn-guard passed, then CLI ValidateTemplate failed with AccessDenied.
- Expected: deployment identity could validate. Actual: ace-cli lacks cloudformation:ValidateTemplate.
- Severity: medium.
- Workaround: connected AWS tooling created and validated a change set with no reported validation errors; used that authorized path for execution.
- Suggestion: show the deployment identity and its required permissions at setup time.

## Browser test selectors and timing
- Task: exercise the sample and mobile menu.
- Steps: initial exact button name and immediate computed-style assertion.
- Expected: matching button and rendered menu. Actual: the decorative play character altered the accessible name; the menu assertion ran before React committed.
- Severity: low; test-only issues.
- Workaround: matched the meaningful button text and waited for actual visible state. Full browser checks then passed.
