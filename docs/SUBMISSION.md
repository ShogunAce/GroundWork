# Groundwork

**Ramble once. Turn what you notice into evidence, a kinder day, and something worth building.**

Groundwork starts with a familiar moment: a walk near a creek, a few observations, some overdue tasks, and an idea that is not quite formed. Instead of requiring a research plan, it accepts the messy ramble. A reusable MCP server separates field observations from tasks, ideas, and worries, logs the observations with stable evidence IDs, suggests safe short missions, and time-blocks a manageable day with breaks.

The payoff is a seven-part workbook: a field summary with data gaps; today's blocks; six citizen missions; named environmental problems matched to evidence; up to three 48-hour challenge briefs; a seven-day action plan; and the original data appendix. Print it or download Markdown, Excel, CSV, and GeoJSON.

## What makes it useful
The same words become useful to both the person and a future builder. A vague concern becomes a safe repeat-observation mission. A project idea becomes a scoped brief with required data, team roles, tool surface, and success criteria. Every user-data claim links to existing evidence, and the system states what those observations cannot tell us.

## Technology actually used
- Official TypeScript MCP SDK, seven Zod-validated tools, Streamable HTTP; handshake verified at protocol 2025-11-25.
- Next.js App Router calls the MCP server over HTTP and streams real tool activity to the UI.
- AWS hosting infrastructure is defined in CloudFormation. Confirm deployed URL/status in RUNLOG before submission.
- Bedrock Converse integration with instance-role credentials is coded and tested against the API, but the account currently rejects model invocation. Do not claim successful Bedrock inference until this is resolved.
- Anthropic is an optional last-resort backup; the supplied key requires a workspace ID. The working demo uses the transparently labeled deterministic fallback when inference is unavailable.
- Original coded botanical hero and generated optional narration. Audio is not required.

## Track
Alexa+: simulated voice-assistant web experience backed by an operating MCP server. AWS Builder: document the actual deployed hosting services in the final submission. MIT licensing alone may not meet the Open Source mini challenge's requirement for an additional project or contribution.

## Honest boundaries
No real device connection, scientific diagnosis, geocoding, persistent database, or calendar booking. Results are exploratory and seed-catalog based. AI selects planning preferences when available; tool sequencing and evidence handling are deterministic. The rules-based parser is intentionally conservative and is not a general natural-language understanding model.

Built from the initial empty repository during the hackathon window on October 23, 2026.
