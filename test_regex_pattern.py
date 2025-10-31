#!/usr/bin/env python3
"""
Test the regex pattern used in the backend to understand how it parses folder names
"""

import re

# Test folder names
test_cases = [
    # Normal case
    "Курсовая работа по электрике (курсовая работа)",
    
    # Case with nested parentheses  
    "Управление техническим состоянием железнодорожного пути по направлению Строительство железных дорог, мостов и транспортных тоннелей (для специалистов с высшим образованием) (курсовая работа)",
    
    # Very long title
    "A" * 1005 + " (курсовая работа)",
    
    # Very long work type
    "Короткое название (" + "B" * 105 + ")",
]

pattern = r'^(.+?)\s*\((.+?)\)\s*$'

print("="*80)
print("TESTING REGEX PATTERN:", pattern)
print("="*80)

for i, folder_name in enumerate(test_cases):
    print(f"\n\nTest Case {i+1}:")
    print("-"*80)
    print(f"Folder name length: {len(folder_name)}")
    print(f"Folder name: {folder_name[:100]}{'...' if len(folder_name) > 100 else ''}")
    print()
    
    match = re.match(pattern, folder_name)
    
    if match:
        title = match.group(1).strip()
        work_type = match.group(2).strip()
        
        print(f"✓ MATCHED")
        print(f"\n  Group 1 (title): {len(title)} chars")
        print(f"  {title[:100]}{'...' if len(title) > 100 else ''}")
        print(f"\n  Group 2 (work_type): {len(work_type)} chars")
        print(f"  {work_type[:100]}{'...' if len(work_type) > 100 else ''}")
        
        # Check violations
        if len(title) > 1000:
            print(f"\n  ❌ VIOLATION: Title exceeds 1000 chars by {len(title) - 1000}")
        if len(work_type) > 100:
            print(f"\n  ❌ VIOLATION: Work type exceeds 100 chars by {len(work_type) - 100}")
    else:
        print(f"✗ NO MATCH - regex failed")

# Now let's specifically analyze the problematic case
print("\n\n" + "="*80)
print("DETAILED ANALYSIS OF NESTED PARENTHESES CASE")
print("="*80)

problem_case = "Управление техническим состоянием железнодорожного пути по направлению Строительство железных дорог, мостов и транспортных тоннелей (для специалистов с высшим образованием) (курсовая работа)"

print(f"\nFolder name: {problem_case}")
print(f"Length: {len(problem_case)}")

# The regex r'^(.+?)\s*\((.+?)\)\s*$' is tricky with nested parentheses
# Let's trace through it:

print("\n\nRegex pattern breakdown:")
print("  ^           - Start of string")
print("  (.+?)       - Group 1: Match minimum chars (non-greedy)")
print("  \\s*         - Optional whitespace")
print("  \\(          - Literal '('")
print("  (.+?)       - Group 2: Match minimum chars (non-greedy)")
print("  \\)          - Literal ')'")
print("  \\s*         - Optional whitespace")
print("  $           - End of string")

print("\n\nWith nested parentheses:")
print("The (.+?) in group 1 is non-greedy BUT the overall pattern MUST match to the end ($)")
print("So the regex engine will backtrack to find a match that ends with ) at the string end")

match = re.match(pattern, problem_case)
if match:
    g1 = match.group(1)
    g2 = match.group(2)
    
    print(f"\n\nActual match:")
    print(f"Group 1 (title): '{g1}'")
    print(f"Group 1 length: {len(g1)}")
    print(f"\nGroup 2 (work_type): '{g2}'")
    print(f"Group 2 length: {len(g2)}")
    
    # Check what's between the last two ) (
    last_open = problem_case.rfind('(')
    second_last_close = problem_case.rfind(')', 0, last_open)
    
    print(f"\n\nString structure:")
    print(f"Last '(' at position: {last_open}")
    print(f"Second-to-last ')' at position: {second_last_close}")
    
    if second_last_close > 0:
        between = problem_case[second_last_close+1:last_open]
        print(f"Text between ')' and '(': '{between}'")
