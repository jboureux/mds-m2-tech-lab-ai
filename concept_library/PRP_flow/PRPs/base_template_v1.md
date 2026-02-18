# [Feature Name] PRP

> A PRP is the minimum viable packet an AI needs to ship production-ready code on the first pass.

## Goal

[One clear sentence: "Enable [user type] to [action] so that [benefit]"]

## Why

**Business Justification:**
- [Who benefits from this feature?]
- [What problem does it solve?]
- [What's the expected impact?]

**Priority:** [High/Medium/Low]

## What

### Feature Description
[Detailed explanation of what the feature does]

### Scope
**In Scope:**
- [Feature aspect 1]
- [Feature aspect 2]

**Out of Scope:**
- [Explicitly excluded aspect 1]
- [Explicitly excluded aspect 2]

### User Stories
1. As a [user type], I want to [action] so that [benefit]
2. ...

## Technical Context

### Files to Reference (Read-Only)
These files provide context and patterns to follow:

| File | Purpose |
|------|---------|
| `path/to/file.ts` | [Why relevant] |
| `path/to/another.ts` | [Why relevant] |

### Files to Implement/Modify

| File | Action | Description |
|------|--------|-------------|
| `path/to/new.ts` | CREATE | [What it does] |
| `path/to/existing.ts` | MODIFY | [What changes] |

### Existing Patterns to Follow

```typescript
// Example pattern from codebase
// Copy this style for consistency
```

### Dependencies
- [Library/package if new ones needed]
- [Existing internal dependencies to use]

## Implementation Details

### API Endpoints (if applicable)

#### `POST /api/endpoint`
**Purpose:** [What this endpoint does]

**Request:**
```typescript
{
  field: string
  optionalField?: number
}
```

**Response:**
```typescript
{
  success: boolean
  data: { ... }
}
```

**Auth:** [Required role(s)]

### Database Schema (if applicable)

```sql
-- New table or modifications
CREATE TABLE table_name (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  ...
);

-- RLS Policy
CREATE POLICY "policy_name" ON table_name
  FOR SELECT USING (organization_id = public.user_organization_id());
```

### Components (if applicable)

| Component | Location | Props |
|-----------|----------|-------|
| `ComponentName` | `components/feature/` | `prop1: type, prop2: type` |

## Validation Criteria

### Functional Requirements
- [ ] [Requirement 1 - testable]
- [ ] [Requirement 2 - testable]
- [ ] [Requirement 3 - testable]

### Technical Requirements
- [ ] TypeScript compiles without errors (`pnpm build`)
- [ ] ESLint passes (`pnpm lint`)
- [ ] RLS policies enforce organization isolation
- [ ] No console errors in browser
- [ ] Loading states implemented
- [ ] Error handling in place

### Security Checklist
- [ ] Input validation on user data
- [ ] RLS policies on new tables
- [ ] No service role key in frontend
- [ ] Proper auth checks on API routes

### Testing Steps
1. [Step 1: How to test]
2. [Step 2: Expected result]
3. [Step 3: Edge case to verify]

## External Resources

- [Link to relevant documentation]
- [Link to design/mockup if available]
- [Link to related issue/ticket]

---

**Created:** [Date]
**Status:** Draft | Ready | In Progress | Completed
