#!/bin/bash
# Pulls the latest source.zip onto the Groundwork EC2 host via SSM and rebuilds.
# Run from AWS CloudShell (us-east-1) or any shell with ssm:SendCommand on the instance.
set -euo pipefail
INSTANCE=i-0170186adbef908af
BUCKET=groundwork-demo-artifacts-24pr8nrgg5mh
CMD=$(aws ssm send-command --region us-east-1 --instance-ids "$INSTANCE" --document-name AWS-RunShellScript \
  --timeout-seconds 900 --comment "Groundwork update" --query Command.CommandId --output text --parameters "commands=[
\"set -euo pipefail\",
\"aws s3 cp s3://$BUCKET/source.zip /tmp/source.zip --region us-east-1\",
\"cp /opt/groundwork/.env /tmp/groundwork.env\",
\"systemctl stop groundwork\",
\"find /opt/groundwork -mindepth 1 -maxdepth 1 ! -name node_modules -exec rm -rf {} +\",
\"unzip -oq /tmp/source.zip -d /opt/groundwork\",
\"cp /tmp/groundwork.env /opt/groundwork/.env\",
\"chown -R groundwork:groundwork /opt/groundwork\",
\"cd /opt/groundwork && sudo -u groundwork env PATH=/usr/local/bin:/usr/bin:/bin npm ci\",
\"cd /opt/groundwork && sudo -u groundwork env PATH=/usr/local/bin:/usr/bin:/bin NEXT_TELEMETRY_DISABLED=1 npm run build\",
\"systemctl start groundwork\",
\"for i in \$(seq 1 60); do curl -sf http://127.0.0.1:3001/health && break; sleep 2; done\"
]")
echo "Command $CMD sent; waiting…"
aws ssm wait command-executed --region us-east-1 --command-id "$CMD" --instance-id "$INSTANCE" || true
aws ssm get-command-invocation --region us-east-1 --command-id "$CMD" --instance-id "$INSTANCE" --query '[Status,StandardErrorContent]' --output text
