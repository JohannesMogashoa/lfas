# Mac Execution Steps

From your LFAS repository root:

```bash
# 1. Confirm the repo has docs/, planning/, scripts/, src/, and tests/

# 2. Confirm scripts are executable
find scripts -name "*.sh" -exec chmod +x {} +

# 3. Validate local files
./scripts/maintenance/apply-repo-hygiene.sh

# 4. Validate Docker
docker compose config
docker compose up -d postgres
docker compose ps
docker compose down -v

# 5. Validate .NET once solution exists
dotnet restore
dotnet build
dotnet test

# 6. Commit
git add .
git commit -m "Add GitHub workflows and repository hygiene"
git push
```

After the first push, go to GitHub Actions and confirm workflows run. Then configure branch protection using:

```text
docs/development/configure-branch-protection.md
```
