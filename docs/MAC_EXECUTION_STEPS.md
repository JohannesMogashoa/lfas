# Mac Execution Steps

From your LFAS repository root:

```bash
# 1. Copy/extract the contents of this kit into your repo root

# 2. Make scripts executable
chmod +x scripts/*.sh

# 3. Validate local files
./scripts/apply-repo-hygiene.sh

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
scripts/configure-branch-protection.md
```
