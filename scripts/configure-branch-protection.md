# Branch Protection Setup

GitHub branch protection is easiest and safest through the UI unless your repo permissions and plan support the relevant API options.

## Recommended protection for `main`

Go to:

```text
Settings
→ Branches
→ Add branch protection rule
→ Branch name pattern: main
```

Enable:

- Require a pull request before merging
- Require approvals: 1
- Dismiss stale approvals when new commits are pushed
- Require status checks to pass before merging
- Require branches to be up to date before merging
- Require conversation resolution before merging
- Do not allow bypassing the above settings

Required checks to select after first workflow run:

- Build and Test
- Validate Repository
- CodeQL Analyze
- Dependency Review
- Validate Docker Compose
- Markdown Lint

## Recommended protection for `develop`

Same as `main`, but approvals can remain at 1.
