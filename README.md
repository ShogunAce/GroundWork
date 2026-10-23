# Groundwork

Ramble once. Get a field dataset, a kinder day plan, and an actionable citizen-science workbook.

Fresh build made during the Amazon Developer Hackathon window on October 23, 2026. Primary track: Alexa+ through a working simulated voice-assistant experience backed by a real MCP server. Intended mini challenge: AWS Builder (actual hosting integration). The repository is MIT licensed; confirm the separate-project requirement before claiming the Open Source mini challenge.

## Run on Windows

Install Node.js 22.12+ (24 LTS recommended). From the repository root:

```powershell
npm install
Copy-Item .env.example .env
npm run dev
```

If `.env` already exists, keep it. Open http://localhost:3000 and choose **Play sample ramble**. No microphone or API key is necessary. The single start command launches the MCP server on loopback port 3001 and Next.js on port 3000. To run a production build:

```powershell
npm run build
npm start
```

## Verify

With the app running, in a second PowerShell window:

```powershell
npm run typecheck
npm run verify:mcp
npm run verify:workbook
node scripts/browser-check.mjs
```

Browser checks use installed Microsoft Edge. They test seven viewport widths, the full sample flow, Excel download, mobile menu, and browser errors. `test-results/` is ignored.

## Architecture

```text
Browser: sample replay / typed ramble / optional browser microphone
  -> Next.js POST /api/chat (streamed NDJSON)
  -> official MCP Client + StreamableHTTPClientTransport
  -> Express /mcp + official MCP server, protocol 2025-11-25
  -> parse_dump -> log_observation -> suggest_mission -> block_schedule
  -> match_problems -> build_workbook -> export_dataset
  -> printable workbook + Markdown + XLSX + CSV + GeoJSON

Optional planning preference selection: Bedrock Converse first
  -> explicitly enabled Anthropic backup -> deterministic fallback
```

Seven tools use Zod input validation. Workbooks validate all evidence IDs and catalog references. Problems come only from the eight-entry illustrative seed catalog. Missions carry safety notes. Locations remain spoken place descriptions; GeoJSON geometry is null. The LLM selects energy and start time only; the validated pipeline determines tool order and preserves user text. This prototype does not implement an open-ended LLM tool-selection agent.

Sessions are isolated by random UUID and kept in memory for up to six hours, with a capacity limit. They disappear on restart. No database, accounts, calendar integrations, geocoding, or external scientific data services. On a hosted deployment, temporary notes live in server memory, not solely on your device. Optional AI planning sends the transcript to the selected inference provider. Browser microphone transcription may use the browser vendor’s service.

## Configuration

Root `.env` is ignored. Never put server secrets in `NEXT_PUBLIC_` variables.

| Variable | Purpose |
|---|---|
| `LLM_PROVIDER` | `bedrock` (default), `anthropic`, or `offline` |
| `AWS_REGION` | Bedrock region, default `us-east-1` |
| `BEDROCK_MODEL_ID` | Verified catalog model ID, default `amazon.nova-micro-v1:0` |
| `MCP_URL` | Server-side MCP endpoint, default loopback port 3001 |
| `MCP_TOKEN` | Optional shared server-to-server bearer token |
| `MCP_HOST`, `MCP_PORT` | MCP bind address and port; loopback by default |
| `ALLOW_ANTHROPIC_FALLBACK` | Must be `true` to automatically use the backup |
| `ANTHROPIC_API_KEY`, `ANTHROPIC_MODEL` | Optional backup credentials and model |
| `ANTHROPIC_WORKSPACE_ID` | Required by unscoped Anthropic keys |
| `PUBLIC_ORIGIN` | Deployed HTTPS origin for origin checks |

Use an EC2 instance role or standard AWS credential chain. Do not embed access keys. Bedrock code is complete, but account model access must be enabled: see `RUNLOG.md` for the observed restriction.

## AWS deployment

`infra/stack.json` defines CloudFront HTTPS, an EC2 t3.small application host, encrypted private S3 release storage, and role-based Bedrock access. No SSH ingress. Only the CloudFront origin-facing prefix list can reach port 80. The MCP listener is not publicly exposed. CloudFront-to-origin transport is HTTP within this prototype; viewer transport is HTTPS. Production hardening should add TLS to the origin and an origin authentication header.

Generate the template with `node scripts/make-infra.mjs`. The Linux-only `infra/bootstrap.sh` runs on Amazon Linux, not on the Windows developer machine. It installs the runtime, retrieves `source.zip` from the private stack bucket, builds the app, and starts systemd/nginx. Deployment resources incur ongoing AWS charges until removed. S3 artifacts are retained on stack deletion.

See `RUNLOG.md` for deployment IDs, current status, exact provider activation steps, and remaining submission work. See `docs/DEMO_SCRIPT.md` for the recording outline.
