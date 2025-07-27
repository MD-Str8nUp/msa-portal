# Mi'raj Scouts Academy Portal - Complete Multi-Account System
## BMad-Method Project Brief

### 📊 Project Overview

**Project Name**: MSA Portal - Complete 4-Account Interactive System  
**Project Type**: App Completion & Enhancement  
**Target Completion**: 4-5 Weeks  
**Priority Level**: Critical  

### 🎯 Business Context & Requirements

**Organization**: Mi'raj Scouts Academy - Islamic Scouting Community  
**Current State**: Partially built Next.js portal with Supabase backend  
**Objective**: Complete and perfect a fully functional multi-account interactive system  

### 📋 Core System Requirements

#### 4 Required Account Types

1. **PARENT Account**
   - Login: Email + Password
   - Pages: Dashboard, Child's Progress, Admin (Profile), Resources
   - Functions: View child data, access uploaded resources

2. **LEADER Account** 
   - Login: Email + Password → Auto-route to assigned scout group
   - Pages: Dashboard, Attendance Reporting, Incidents Reporting, Resources (Lessons)
   - Functions: Manage group attendance, report incidents, access lesson materials

3. **LEADER1 Account** (Leader + Parent Hybrid)
   - Login: Email + Password
   - Pages: Toggle between Leader view and Parent view
   - Functions: Full leader capabilities + parent access to own child's data

4. **EXECUTIVE Account** (Backend Admin)
   - Login: Email + Password  
   - Pages: All administrative functions
   - Functions: Create groups, create students, assign leaders, upload resources, report incidents, full system management

### 🔄 Inter-Account Communication Requirements

**Critical Requirement**: All accounts must interact seamlessly
- Messages between accounts (parent ↔ leader ↔ executive)
- Real-time notifications and updates
- Data sharing across account types
- Activity feeds and communication logs

### 🏗️ Current State Analysis vs Requirements

#### What Exists in Current Codebase
- ✅ Next.js 14 + TypeScript + Tailwind setup
- ✅ Supabase backend with authentication
- ✅ Basic dashboard structures for different roles
- ✅ Database schema with users, scouts, groups, events
- ✅ API routes for basic CRUD operations
- ✅ Some UI components for different dashboards

#### What Needs Implementation/Enhancement

**Authentication & Routing System**
- [ ] Role-based login routing (leader → specific group)
- [ ] Leader1 dual-mode toggle functionality
- [ ] Session management for account switching

**Account-Specific Pages & Functions**
- [ ] Parent: Child progress tracking system
- [ ] Leader: Attendance reporting interface
- [ ] Leader: Incident reporting system  
- [ ] Leader1: Seamless role toggle mechanism
- [ ] Executive: Complete admin backend interface

**Inter-Account Communication**
- [ ] Real-time messaging system between accounts
- [ ] Notification system for cross-account interactions
- [ ] Activity feeds and communication logs
- [ ] Data synchronization across account views

**Data Management Integration**
- [ ] Resources upload/access system
- [ ] Student-parent-leader data relationships
- [ ] Group assignment and management
- [ ] Progress tracking and reporting

### 🔧 Technical Architecture Strategy

#### Enhanced Authentication Flow
```
Login → Role Detection → Route to Specific Dashboard
├── Parent → Parent Dashboard + Child Data
├── Leader → Assigned Group Dashboard + Tools  
├── Leader1 → Dual Mode Toggle Interface
└── Executive → Full Admin Backend Access
```

#### Inter-Account Communication Architecture
```
Real-time Layer (Socket.io/Supabase Realtime)
├── Message Broadcasting
├── Notification System  
├── Activity Streams
└── Data Synchronization
```

#### Data Flow Design
```
Supabase Backend
├── User Management (roles, permissions)
├── Scout/Group Relationships
├── Communication Logs
├── Resources Storage
└── Progress Tracking
```

### 📋 Implementation Phases

#### Phase 1: Core Account System (Week 1-2)
**Priority: Critical**
- Fix and enhance role-based authentication
- Implement proper dashboard routing per account type
- Complete parent dashboard with child progress
- Build leader attendance and incident reporting
- Create executive admin interface

#### Phase 2: Inter-Account Communication (Week 2-3)  
**Priority: Critical**
- Real-time messaging between accounts
- Notification system implementation
- Activity feeds and communication logs
- Leader1 toggle functionality

#### Phase 3: Data Integration & Resources (Week 3-4)
**Priority: High**
- Resources upload/download system
- Complete data relationships (parent-child-leader-group)
- Progress tracking and reporting
- Executive backend management tools

#### Phase 4: Polish & Optimization (Week 4-5)
**Priority: Medium**
- Mobile responsiveness optimization
- Performance improvements
- UI/UX refinements
- Testing and bug fixes

### 🎯 Success Criteria

#### Functional Requirements
1. **4 Distinct Account Types** - Each with specific pages and functions
2. **Seamless Communication** - Messages and interactions work between all accounts
3. **Data Integration** - Supabase data properly displayed and managed
4. **Role-Based Access** - Proper permissions and data visibility per account
5. **Real-time Updates** - Live communication and data synchronization

#### Technical Standards
- Mobile-first responsive design
- Fast loading and smooth navigation
- Secure authentication and data handling
- Islamic community values in UI/messaging
- Scalable architecture for growth

### 💡 Key Technical Challenges & Solutions

#### Challenge 1: Role-Based Routing
**Solution**: Enhanced middleware with role detection and automatic routing to correct dashboard

#### Challenge 2: Leader1 Dual Mode
**Solution**: Session state management with UI toggle between parent/leader views

#### Challenge 3: Inter-Account Communication
**Solution**: Supabase Realtime + custom notification system

#### Challenge 4: Data Relationships
**Solution**: Optimized Prisma queries with proper joins and data fetching strategies

### 📊 BMad Development Workflow

#### Next Steps with BMad Method
1. **Analyst Phase Complete** ✅ - Project brief and requirements analysis
2. **PM Phase** - Detailed project planning and story creation
3. **Architect Phase** - Technical architecture and database design
4. **Dev Phase** - Implementation with story-driven development
5. **QA Phase** - Testing and quality assurance

### 🚀 Immediate Action Items

1. **Stakeholder Approval** - Review and approve this project brief
2. **Current Code Audit** - Detailed analysis of existing implementation
3. **Database Schema Review** - Ensure Supabase structure supports all requirements  
4. **BMad PM Handoff** - Move to project management phase for detailed planning

---

**Document Status**: Initial Brief - Ready for PM Phase  
**Next Document**: Detailed PRD and Technical Architecture  
**BMad Workflow**: Ready for PM story creation and architecture design