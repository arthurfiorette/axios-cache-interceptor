# System Utilities and Environment

## System Information

- **Platform**: Linux
- **OS**: Linux 5.15.133.1-microsoft-standard-WSL2 (WSL2 environment)
- **Shell**: Bash

## Available System Commands

- `git` - Git version control
- `ls` - List directory contents
- `cd` - Change directory
- `find` - Find files and directories
- `grep` - Search text patterns
- `bash` - Execute bash scripts
- `node` - Node.js runtime
- `pnpm` - Package manager

## Git Information

- **Current Branch**: main
- **Main Branch**: main (use for PRs)
- **Recent commits**: See git log for latest changes
- **Remote**: https://github.com/arthurfiorette/axios-cache-interceptor

### Common Git Workflows

```bash
# Check current status
git status

# View recent commits
git log --oneline -10

# Create feature branch
git checkout -b feature/your-feature-name

# Commit with co-author (when using Claude)
git commit -m "feat: your feature description

Co-Authored-By: Claude Sonnet 4.5 <noreply@anthropic.com>"
```

## Project Environment

- **Working Directory**: /home/hzk/dev/axios-cache-interceptor
- **Git Repository**: Yes
- **Package Manager**: pnpm (version 9.1.1)
- **Node Version**: >=12 (specified in package.json engines)

## Special Considerations for Linux/WSL2

- File permissions may need attention
- Cross-platform compatibility is maintained in build scripts
- Uses Unix-style line endings (`newLine: "lf"` in tsconfig)
