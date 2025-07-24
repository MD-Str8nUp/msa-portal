# Story MSA-002: Implement enhanced role-based authentication

**Epic**: MSA-E001 - Core Account System Foundation  
**Priority**: Critical  
**Story Points**: 5  
**Sprint**: 1  
**Status**: In Progress

## Story
As a **user with any account type**, I want to log in with my email and password and be automatically routed to the appropriate dashboard based on my role.

## Acceptance Criteria
- [ ] Authentication supports all 4 roles (parent, leader, leader1, executive)
- [ ] Leaders automatically route to their assigned scout group
- [ ] Leader1 accounts present dual-mode selection after login
- [ ] Executive accounts route to admin dashboard
- [ ] Parent accounts route to child-focused dashboard
- [ ] Session management handles role switching for leader1

## Technical Requirements
- Update AuthContext to handle `leader1` role (✅ Already done in MSA-001)
- Enhance middleware for role-based routing
- Implement group assignment lookup for leaders
- Create session state management for dual-mode switching
- Update login API endpoints

## Tasks
- [x] Update AuthContext for leader1 support (completed in MSA-001)
- [ ] Create role-based routing middleware
- [ ] Implement leader group assignment lookup
- [ ] Build leader1 dual-mode selection interface
- [ ] Update login API for enhanced routing
- [ ] Test authentication flow for all roles

## Dev Agent Record

### Agent Model Used
Claude Sonnet 4 (claude-sonnet-4-20250514)

### Debug Log References
- Building on MSA-001 foundation
- Implementing role-based routing logic

### Tasks / Subtasks Status
- [x] Update AuthContext for leader1 support
  - [x] Completed in MSA-001 story
- [ ] Create role-based routing middleware
  - [ ] Update middleware.ts with role detection
  - [ ] Add routing logic for each role type
- [ ] Implement leader group assignment lookup
  - [ ] Create API endpoint for group assignments
  - [ ] Add logic to detect assigned groups
- [ ] Build leader1 dual-mode selection interface
  - [ ] Create mode selection component
  - [ ] Add toggle functionality
- [ ] Update login API for enhanced routing
  - [ ] Modify login routes for role-based redirect
  - [ ] Add session management for dual modes
- [ ] Test authentication flow for all roles
  - [ ] Test each role login scenario
  - [ ] Verify routing works correctly

### Completion Notes
- Starting implementation of role-based routing
- Building on leader1 support from MSA-001

### File List
- middleware.ts (to be modified)
- app/api/auth/login/route.ts (to be modified)
- components/auth/ (new components to be created)

### Change Log
- Story created and development started