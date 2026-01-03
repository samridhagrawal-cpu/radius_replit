---
description: Push changes to GitHub after completing a task
---

# Git Push Workflow

This workflow should be executed after every completed task to keep the GitHub repository synchronized.

## Steps

// turbo-all

1. Check current git status to see what has changed:
```bash
git status
```

2. Stage all changes:
```bash
git add -A
```

3. Commit with a descriptive message (replace `<message>` with what was done):
```bash
git commit -m "<message>"
```

4. Push to the remote repository:
```bash
git push origin main
```

## Commit Message Guidelines

Use clear, descriptive commit messages following this format:
- `feat: <description>` - For new features
- `fix: <description>` - For bug fixes
- `refactor: <description>` - For code refactoring
- `docs: <description>` - For documentation changes
- `chore: <description>` - For maintenance tasks
- `test: <description>` - For adding/updating tests

## Repository Information

- **Remote URL**: https://github.com/samridhagrawal-cpu/radius_replit.git
- **Default Branch**: main
- **Local Path**: /Users/samridhagrawal/radius repositery/radius_replit-1
