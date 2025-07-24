# Mi'raj Scouts Academy Portal - Brownfield Enhancement PRD

## 1. Project Analysis and Context

### Existing Project Overview
**Analysis Source**: IDE-based fresh analysis combined with comprehensive codebase review

**Current Project State**: 
Mi'raj Scouts Academy Portal is a partially built Islamic scouting management platform using Next.js 14, TypeScript, Tailwind CSS, Prisma ORM, and Supabase backend. The project currently has basic authentication, dashboard structure, and database schema but requires substantial enhancement to achieve the complete 4-account interactive system specification.

### Documentation Analysis
**Current Assets**:
- Complete database schema with user/scout/group/event/achievement models
- Supabase authentication with role-based system (parent/leader/executive)
- Dashboard layouts with MSA branding and Islamic community design
- Basic API routes for CRUD operations
- Existing CSV import system for MSA application data

**Critical Gaps**:
- Missing `leader1` role entirely from database and code
- Most dashboard pages are placeholder components
- No inter-account communication system
- No role-based auto-routing (leaders to assigned groups)
- Limited real-time functionality

## 2. Enhancement Goals & Success Metrics

### Primary Enhancement Objectives
1. **Complete 4-Account System Implementation**
   - Parent: Dashboard, child progress, profile admin, resources access
   - Leader: Group-specific dashboard, attendance reporting, incident reporting, lesson resources
   - Leader1: Dual-mode toggle between leader and parent functions
   - Executive: Complete backend administration, group/student creation, resource management

2. **Inter-Account Communication System**
   - Real-time messaging between all account types
   - Notification system for cross-account interactions
   - Activity feeds and communication logs

3. **Data Integration & Functionality**
   - Supabase data properly displayed across all dashboards
   - Role-based data access and permissions
   - Leader auto-routing to assigned scout groups

### Success Metrics
- 4 distinct account types with full functionality operational
- Real-time communication working between all accounts
- Role-based authentication with proper group assignments
- Mobile-responsive interface across all account types
- Islamic community values maintained in all UI elements

## 3. User Stories & Account Specifications

### Account Type Detailed Requirements

#### PARENT Account
- **Login Flow**: Email + Password → Parent Dashboard
- **Dashboard**: Child overview, recent activities, upcoming events, progress summary
- **Child's Progress**: Achievements, badges, activity history, development tracking, milestone completion
- **Admin Page**: Profile management, contact information, emergency contacts, preferences
- **Resources**: Access to uploaded educational materials, Islamic scouting guides, community announcements

#### LEADER Account
- **Login Flow**: Email + Password → Auto-route to assigned scout group dashboard
- **Dashboard**: Group overview, scout roster, upcoming activities, group statistics
- **Attendance**: Report and track scout attendance for activities with notes and excuses
- **Incidents**: Report and manage any incidents, behavioral notes, safety concerns
- **Resources**: Access to lesson plans, activity guides, training materials, Islamic teachings

#### LEADER1 Account (Leader + Parent Hybrid)
- **Login Flow**: Email + Password → Dual-mode interface with toggle
- **Toggle Function**: Seamless switch between Leader view and Parent view
- **Leader Mode**: Full leader capabilities for assigned group management
- **Parent Mode**: Full parent access to own child's data and progress

#### EXECUTIVE Account (Super Admin)
- **Login Flow**: Email + Password → Executive admin dashboard
- **Group Management**: Create, modify, delete scout groups, assign group leaders
- **Student Management**: Add, edit, assign scouts to groups, manage registrations
- **Leader Assignment**: Assign leaders to specific groups, manage leader permissions
- **Resource Management**: Upload, organize, distribute materials to groups/leaders
- **Incident Oversight**: View and manage all incident reports, escalation procedures

## 4. Inter-Account Communication Requirements

### Real-time Communication Matrix
- **Parent ↔ Leader**: Questions about child, activity updates, progress discussions
- **Leader ↔ Executive**: Resource requests, incident escalation, administrative support
- **Executive → All**: Announcements, policy updates, community messages
- **Leader1**: Communication capabilities in both parent and leader contexts

### Technical Communication Requirements
- Supabase Realtime integration for instant messaging
- Push notifications for important communications
- Message history, threading, and search functionality
- Read receipts and delivery status indicators
- File sharing capabilities for documents and images

## 5. Technical Requirements

### Database Schema Enhancements
- Add `leader1` role to user role constraints
- Create message/communication tables for inter-account messaging
- Add notification system tables
- Implement proper foreign key relationships for group assignments
- Add incident reporting and resource management tables

### Authentication & Authorization
- Enhanced role-based middleware with `leader1` support
- Auto-routing logic for leaders to assigned groups
- Session management for dual-mode switching (leader1)
- Permission boundaries and data access controls per account type

### API Enhancements
- Real-time messaging endpoints
- Role-specific data filtering APIs
- Notification system APIs
- File upload/download for resources
- Incident reporting and management APIs

### UI/UX Requirements
- Mobile-first responsive design across all account types
- Islamic community branding and values integration
- Intuitive navigation with role-based menus
- Real-time updates and notifications
- Accessibility compliance (WCAG 2.1 AA)

## 6. Implementation Phases

### Phase 1: Core Account System (Weeks 1-2)
**Priority: Critical**
- Database schema updates for `leader1` role
- Complete dashboard implementations for all 4 account types
- Role-based authentication and routing enhancements
- Basic functionality for each account type

### Phase 2: Inter-Account Communication (Weeks 2-3)
**Priority: Critical**
- Real-time messaging system implementation
- Notification system development
- Activity feeds and communication logs
- Leader1 dual-mode toggle functionality

### Phase 3: Data Integration & Advanced Features (Weeks 3-4)
**Priority: High**
- Resources upload/download system
- Attendance and incident reporting workflows
- Child progress tracking for parents
- Executive backend management tools

### Phase 4: Polish & Optimization (Weeks 4-5)
**Priority: Medium**
- Mobile responsiveness optimization
- Performance improvements and caching
- UI/UX refinements and testing
- Security auditing and bug fixes

## 7. Acceptance Criteria

### Functional Acceptance Criteria
1. **Authentication System**
   - All 4 account types can log in with email/password
   - Leaders auto-route to their assigned scout group
   - Leader1 accounts can toggle between parent/leader modes
   - Proper session management and security

2. **Dashboard Functionality**
   - Each account type displays relevant, personalized data
   - Real-time updates and notifications work correctly
   - Mobile-responsive design on all devices
   - Islamic branding and community values maintained

3. **Inter-Account Communication**
   - Messages can be sent/received between appropriate account types
   - Notifications work in real-time
   - Message history and threading function properly
   - File sharing capabilities operational

4. **Data Management**
   - Supabase data properly integrated and displayed
   - Role-based permissions enforced correctly
   - CRUD operations work for all account types
   - Data relationships maintain integrity

### Technical Acceptance Criteria
- All API endpoints return proper HTTP status codes
- Database queries optimized for performance
- Security vulnerabilities addressed
- Cross-browser compatibility achieved
- Accessibility standards met (WCAG 2.1 AA)

## 8. Risk Assessment

### High Risk Items
- **Database Migration Complexity**: Adding `leader1` role to existing data
- **Real-time Performance**: Scaling messaging system for community size
- **Dual-Mode Complexity**: Leader1 toggle functionality without data conflicts

### Medium Risk Items
- **Mobile Performance**: Ensuring smooth experience on various devices
- **User Adoption**: Training community on new features
- **Data Privacy**: Ensuring proper access controls for child data

### Mitigation Strategies
- Comprehensive testing environment with production data replica
- Phased rollout with pilot user groups
- Detailed documentation and training materials
- Regular security audits and penetration testing

## 9. Success Validation

### Key Performance Indicators
- User login success rate >95%
- Real-time message delivery <2 seconds
- Dashboard load time <3 seconds
- Mobile usability score >4.5/5
- Security vulnerability count = 0

### User Satisfaction Metrics
- Account-specific functionality satisfaction survey
- Inter-account communication effectiveness rating
- Overall platform usability score
- Community adoption rate within 30 days

---

**Document Status**: Complete PRD - Ready for Epic Story Creation  
**Next Phase**: Epic Story Breakdown and Development Story Creation  
**Estimated Implementation**: 4-5 weeks with dedicated development resources