# Mac Execution Steps

From your LFAS repository root:

```bash
# 1. Confirm the repo has apps/, packages/, docs/, planning/, and scripts/

# 2. Confirm scripts are executable
find scripts -name "*.sh" -exec chmod +x {} +

# 3. Validate local files
./scripts/maintenance/apply-repo-hygiene.sh

# 4. Validate Node.js workspace
pnpm install
pnpm lint
pnpm typecheck
pnpm build
pnpm test

# 5. Commit
git add .
git commit -m "Add GitHub workflows and repository hygiene"
git push
```

After the first push, go to GitHub Actions and confirm workflows run. Then configure branch protection using:

```text
docs/development/configure-branch-protection.md
```
