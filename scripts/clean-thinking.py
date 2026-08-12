#!/usr/bin/env python3
"""Strip English thinking leaks from AI Builders Digest cron output.

The LLM sometimes prepends English chain-of-thought before the actual Chinese digest.
This script reads the agent's output file and removes any leading English text
that appears before the first substantive Chinese content.
"""
import re
import sys

def strip_thinking_leak(text: str) -> str:
    """Remove English thinking patterns from the beginning of the output."""
    lines = text.split('\n')
    
    # Find the first line that contains Chinese characters (substantive content)
    first_content_idx = 0
    for i, line in enumerate(lines):
        stripped = line.strip()
        if not stripped:
            continue
        # Check if line contains Chinese characters
        if re.search(r'[\u4e00-\u9fff]', stripped):
            first_content_idx = i
            break
        # Check for the digest header pattern (even if no Chinese yet)
        if re.match(r'\*?\*?AI Builders Digest', stripped, re.IGNORECASE):
            first_content_idx = i
            break
    
    # Check if there's any English-only text before the first content line
    before_content = lines[:first_content_idx]
    has_thinking = any(
        re.search(r'[a-zA-Z]', line.strip()) and not line.strip().startswith('#')
        for line in before_content if line.strip()
    )
    
    if has_thinking and first_content_idx > 0:
        cleaned = '\n'.join(lines[first_content_idx:])
        return cleaned.strip()
    
    return text

if __name__ == '__main__':
    if len(sys.argv) > 1:
        filepath = sys.argv[1]
        with open(filepath, 'r') as f:
            content = f.read()
        cleaned = strip_thinking_leak(content)
        if cleaned != content:
            with open(filepath, 'w') as f:
                f.write(cleaned)
            print(f"Cleaned thinking leak from {filepath}", file=sys.stderr)
        else:
            print(f"No thinking leak found in {filepath}", file=sys.stderr)
    else:
        # Read from stdin, write to stdout
        content = sys.stdin.read()
        print(strip_thinking_leak(content))
