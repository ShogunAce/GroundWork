import sys,json
from pathlib import Path
sys.path.insert(0,str(Path('.runtime/python').resolve()))
import cfnlint.api
import guardpycfn
template=Path('infra/stack.json').read_text()
issues=cfnlint.api.lint(template,regions=['us-east-1'])
for i in issues: print(i.rule.id, i.message)
print('cfn-lint issues:',len(issues))
if any(i.rule.id.startswith('E') for i in issues):sys.exit(1)
result=guardpycfn.validate_with_guard(template,Path('infra/security.guard').read_text(),False)
print('cfn-guard:',result)
