# Product feedback — build observations

## MCP TypeScript SDK
Used the official v1 package to expose seven tools and connect a server-side web client over Streamable HTTP. The initialize handshake negotiated 2025-11-25 and tools/list returned all seven tools. Typed Zod inputs and the client transport made the protocol boundary straightforward. The shift between v1 and v2 documentation requires careful version selection. Would build with it again.

## AWS
Used account discovery, model catalog lookup, Bedrock Converse tests, and CloudFormation deployment planning. Bedrock catalog access worked, but both connector and local CLI invocation returned “Error 002: Access to Bedrock models is not allowed for this account.” The account needs a clearer actionable enablement message. Local CLI CloudFormation permissions were narrower than connector access; the connector could create the validated change set. Deployment services: CloudFront, EC2, S3, IAM, Systems Manager. Final deployment outcome is recorded in RUNLOG. Would use these services again; account onboarding friction should be surfaced before model selection.

## Next.js
App Router route handlers supported the streamed pipeline and Excel downloads. Production build and browser flow passed. Windows sandbox restrictions prevented Turbopack junction creation; the same build passed outside the sandbox. The generated version-specific AGENTS.md and local docs were useful. Would build with it again.

## ElevenLabs
Generated an optional short spoken workbook-ready reply with a calm catalog voice. Assets are saved for local playback, avoiding live generation during the demo. The connector returned asynchronous flow/session IDs; separate retrieval was needed to obtain the finished file for app integration. Would use it again; a direct save-to-project action would improve developer workflow.

## Anthropic backup
Tested only after confirmed Bedrock failure. The supplied key returned an actionable error requiring `anthropic-workspace-id`. No successful inference is claimed. Workspace discovery or a preflight credential check would make fallback setup easier.

## ExcelJS and GSAP
ExcelJS produced the five-sheet downloadable workbook, verified through a browser download. GSAP provided lazy-loaded hero motion with a static reduced-motion path. Both fit the prototype well.

This is a build-time record, not a claim of user research or long-term production experience. The entrant should add their own onboarding observations before submission.
