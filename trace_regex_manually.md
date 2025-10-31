# Manual Trace of Regex Pattern

## Folder Name
```
Управление техническим состоянием железнодорожного пути по направлению Строительство железных дорог, мостов и транспортных тоннелей (для специалистов с высшим образованием) (курсовая работа)
```

Length: Let me count each part:
- Main text before first parenthesis
- (для специалистов с высшим образованием)  
- Space
- (курсовая работа)

## Regex Pattern
```
^(.+?)\s*\((.+?)\)\s*$
```

## How it works with nested parentheses

The pattern MUST:
- Start at ^ (beginning)
- End at $ (end)
- Have format: (text) \s* ( (text) ) \s* END

With the string:
```
...тоннелей (для специалистов с высшим образованием) (курсовая работа)
```

### Regex Engine Behavior:

1. **Start**: Position 0
2. **(.+?)**: Match minimum - tries to match just first char
3. **\s*\(**: Looking for whitespace then (
4. Keep expanding (.+?) until we find \s*\(
5. First ( found at "...тоннелей ("
6. **(.+?)**: Now match minimum in Group 2
7. Tries "д" then checks if next is \)\s*$
8. "д" followed by "л" not ")", so expand
9. Eventually matches "для специалистов с высшим образованием"
10. **\)**: Found the )
11. **\s*$**: Check if we're at end... NO! There's still " (курсовая работа)"
12. **BACKTRACK**: This match doesn't work
13. Go back and try different split

### After Backtracking:

The regex engine realizes the first (...) isn't the right one.
It continues expanding Group 1 to INCLUDE the first parentheses pair:
- Group 1: "...тоннелей (для специалистов с высшим образованием)"
- Then looks for next (
- Group 2: "курсовая работа"
- Then ) and end of string - SUCCESS!

## Result:

**Group 1 (Title)**: 
```
Управление техническим состоянием железнодорожного пути по направлению Строительство железных дорог, мостов и транспортных тоннелей (для специалистов с высшим образованием)
```

**Group 2 (Work Type)**:
```
курсовая работа
```

## Length Calculation:

Let me count the title character by character:

```
Управление = 10
  = 1
техническим = 11
  = 1
состоянием = 10
  = 1
железнодорожного = 17
  = 1
пути = 4
  = 1
по = 2
  = 1
направлению = 11
  = 1
Строительство = 13
  = 1
железных = 8
  = 1
дорог, = 6
  = 1
мостов = 6
  = 1
и = 1
  = 1
транспортных = 12
  = 1
тоннелей = 8
  = 1
(для = 4
  = 1
специалистов = 13
  = 1
с = 1
  = 1
высшим = 6
  = 1
образованием) = 12
```

Total: 10+1+11+1+10+1+17+1+4+1+2+1+11+1+13+1+8+1+6+1+6+1+1+1+12+1+8+1+4+1+13+1+1+1+6+1+12 = 170 characters

**This is well within the 1000 character limit!**

So this is NOT the problematic folder.

## Conclusion

I need to check ALL 100 folders in the offset 400-499 range to find the one with title > 1000 chars or work_type > 100 chars.

The folder I've analyzed so far is fine. The error must be coming from a different folder in that batch.
