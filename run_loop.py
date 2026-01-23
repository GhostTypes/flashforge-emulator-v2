#!/usr/bin/env python3
"""
Claudius Loop Runner for FlashForge Emulator V2

This script runs Claude Code in autonomous mode, implementing the PRD.md tasks.
Each iteration starts fresh (no memory between sessions), reads PRD.md and progress.txt,
picks the next task, implements it, and commits.
"""

import subprocess
import sys
import time
from pathlib import Path

# Configuration
MAX_ITERATIONS = 100
PRD_FILE = Path("PRD.md")
PROGRESS_FILE = Path("progress.txt")

def main():
    print("=" * 60)
    print("FlashForge Emulator V2 - Claudius Loop")
    print("=" * 60)
    print(f"Max iterations: {MAX_ITERATIONS}")
    print(f"PRD file: {PRD_FILE}")
    print(f"Progress file: {PROGRESS_FILE}")
    print()

    # Verify files exist
    if not PRD_FILE.exists():
        print(f"ERROR: PRD file not found: {PRD_FILE}")
        sys.exit(1)

    if not PROGRESS_FILE.exists():
        print(f"ERROR: Progress file not found: {PROGRESS_FILE}")
        sys.exit(1)

    print("Starting Claude Code in autonomous mode...")
    print("Press Ctrl+C to stop the loop at any time")
    print("-" * 60)
    print()

    # Read PRD to pass as context (explicit UTF-8 for Windows compatibility)
    prd_content = PRD_FILE.read_text(encoding='utf-8')

    for iteration in range(1, MAX_ITERATIONS + 1):
        print(f"\n[Iteration {iteration}/{MAX_ITERATIONS}]")
        print("-" * 60)

        # Build the prompt with PRD context
        prompt = f"""You are implementing the FlashForge Emulator V2. Read PRD.md for the complete requirements and progress.txt for what's been done.

Continue from where we left off. Pick the next incomplete task from the PRD checklist and implement it.

CRITICAL REQUIREMENTS:
1. ALWAYS invoke the appropriate skill when working on specific technologies:
   - React components → invoke react-19 skill
   - Tailwind styling → invoke tailwind-css skill
   - TypeScript types → invoke typescript-best-practices skill
   - Biome linting → invoke biome skill
   - Electron APIs → invoke electron skill
   - Icons → invoke lucide-react skill
   - UI design → invoke modern-frontend-design skill
   - Get timestamps → invoke get-time skill

2. After completing each task, BEFORE committing:
   - Run: npm run type-check (must pass)
   - Run: npm run lint:fix (apply fixes)
   - Run: npm run lint (must pass)

3. At the END of each session (after pushes):
   - Use get-time skill to record end time
   - Update TIMELOG.md with session summary
   - Update progress.txt with completed tasks
   - Commit changes with message following the format in PRD

4. When ALL tasks in PRD.md are complete:
   - Output: <workflow_complete>
   - Exit successfully

5. After EACH task completion (not the final task):
   - Output: <iteration_complete>

Source of truth for all protocols: ai_reference/flashforge-api-docs/

Start working on the next incomplete task now."""

        try:
            # Run Claude Code with the prompt
            cmd = [
                "claude",
                "-p", prompt,
                "--dangerously-skip-permissions",
                "--no-session-persistence",
                "--max-turns", "50"
            ]

            result = subprocess.run(
                cmd,
                capture_output=False,
                text=True
            )

            # Check for completion signals in output
            if result.returncode == 0:
                output = result.stdout if result.stdout else result.stderr
                if "<workflow_complete>" in output:
                    print("\n" + "=" * 60)
                    print("WORKFLOW COMPLETE!")
                    print("=" * 60)
                    break
                elif "<iteration_complete>" in output:
                    print(f"\nIteration {iteration} complete. Starting next iteration...")
                    time.sleep(2)  # Brief pause between iterations
                    continue

        except KeyboardInterrupt:
            print("\n\nLoop interrupted by user.")
            break
        except Exception as e:
            print(f"\nError in iteration {iteration}: {e}")
            print("Continuing to next iteration...")
            time.sleep(5)
            continue

if __name__ == "__main__":
    main()
