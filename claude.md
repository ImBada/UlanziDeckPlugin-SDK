# Claude Development Rules for UlanziDeck Plugin

## Critical Rules - MUST Follow

### 1. UUID Naming Convention (MANDATORY)

**Rule**: Action UUID must follow this exact format:
```
{plugin_name}.{action_name}
```

**CORRECT Format**:
- `com.speedrun.timer.start`
- `com.speedrun.timer.pause1p`
- `com.speedrun.timer.donation_empty`

**INCORRECT Format** (DO NOT USE):
- ❌ `com.speedrun.timer.donation.empty` (Extra dot after plugin name)
- ❌ `com.speedrun.timer.action.name` (Multiple dots after plugin name)

**Key Points**:
- Plugin name: `com.speedrun.timer` (3 segments with dots)
- Action name: Must be ONE segment only (no additional dots)
- Use underscore `_` instead of dot `.` for multi-word action names
- After the plugin name, only ONE more segment is allowed

**Example**:
```json
{
  "Name": "Show Donation Empty",
  "UUID": "com.speedrun.timer.donation_empty"  // ✅ Correct
}
```

### 2. Why This Rule Exists

This is a **strict requirement** of the UlanziDeck plugin system. Breaking this rule will cause:
- Plugin registration failures
- Action routing errors
- Undefined behavior in the plugin system

### 3. When Creating New Actions

Always verify UUID format before committing:
1. Check manifest.json for UUID format
2. Check action handler switch cases match the UUID exactly
3. Ensure no extra dots (.) after plugin name
4. Use underscore (_) for compound action names

---

**Last Updated**: 2025-12-02
**Status**: MANDATORY - Do not deviate from these rules
