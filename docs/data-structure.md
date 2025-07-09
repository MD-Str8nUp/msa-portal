# MSA Portal Data Structure Documentation

> **Database Schema and Relationships for Mi'raj Scouts Academy Portal**

## Overview

The MSA Portal uses a comprehensive relational database structure designed to support Islamic scouting activities, family management, and community engagement. The database is implemented using Prisma ORM with SQLite for development and production deployment.

**Database Technology**: SQLite with Prisma ORM  
**Generated Client**: Prisma Client for type-safe database operations  
**Schema Location**: `/prisma/schema.prisma`  

---

## Core Data Models

### 👤 User Model

The central user management system supporting multiple roles and Islamic community structure.

```prisma
model User {
  id             String    @id @default(cuid())
  name           String
  email          String    @unique
  password       String
  role           String    // "parent", "leader", "executive", "parent_leader", "support"
  avatar         String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  
  // Multi-role support for parent_leaders
  isParent       Boolean   @default(false)
  isLeader       Boolean   @default(false)
  isExecutive    Boolean   @default(false)
  isSupport      Boolean   @default(false)
  
  // Default portal preference for parent_leaders
  defaultPortal  String?   // "parent" or "leader" - for users with both roles
  
  // Online status tracking
  lastSeen       DateTime  @default(now())
  isOnline       Boolean   @default(false)
}
```

#### User Role Structure
- **parent**: Family account with child management access
- **leader**: Scout group leadership and activity management
- **executive**: Academy-wide administrative access
- **parent_leader**: Combined roles common in MSA community
- **support**: Limited administrative support access

#### Multi-Role Support
The system accommodates community members who serve multiple roles:
- `isParent`, `isLeader`, `isExecutive` boolean flags
- `defaultPortal` preference for initial login destination
- Flexible permission system based on role combinations

#### Islamic Community Features
- Real family data from 79 NSW Islamic families
- Community-appropriate avatar system
- Online status for community coordination

---

### 👦 Scout Model

Individual scout profiles with Islamic education and outdoor skills tracking.

```prisma
model Scout {
  id             String    @id @default(cuid())
  name           String
  age            Int
  rank           String
  joinedDate     DateTime  @default(now())
  parentId       String
  groupId        String
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

#### Scout Demographics
- **Age Groups**: Joeys (5-7), Cubs (8-10), Scouts (11-15)
- **Rank System**: Progressive advancement within age groups
- **Join Date**: Tracking scout tenure and experience
- **Parent Relationship**: Strong family connection emphasis

#### Group Assignment
- **groupId**: Links to specific scout group (Joeys/Cubs/Scouts A/B/C)
- **Age-Based Allocation**: Automatic group suggestions based on age
- **Transition Management**: Moving between groups as scouts age

---

### 👥 Group Model

Scout group management with Islamic values and community structure.

```prisma
model Group {
  id             String    @id @default(cuid())
  name           String    @unique
  description    String?
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

#### MSA Group Structure
- **Joeys**: Ages 5-7, foundation Islamic values and basic skills
- **Cubs**: Ages 8-10, intermediate Islamic education and outdoor skills
- **Scouts**: Ages 11-15, advanced Islamic leadership and community service
- **Sub-Groups**: A/B/C divisions for capacity management

#### Group Features
- **Unique Names**: Preventing duplicate group creation
- **Flexible Descriptions**: Customisable group information
- **Scalable Structure**: Supporting academy growth

---

### 🏆 Achievement Model

Islamic-focused badge and achievement system.

```prisma
model Achievement {
  id             String    @id @default(cuid())
  name           String
  description    String
  dateEarned     DateTime  @default(now())
  scoutId        String
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

#### MSA Achievement Categories

**Islamic Achievements**
- Salah Excellence: Prayer leadership and consistency
- Quran Memorisation: Surah memorisation and recitation  
- Islamic History: Knowledge of Islamic heritage
- Arabic Language: Reading and communication skills
- Hadith Knowledge: Prophet's sayings and teachings
- Islamic Calendar: Understanding Islamic months and events

**Character Building**
- Honesty Badge: Truthfulness demonstration
- Community Service: Mosque and community contribution
- Leadership: Mentoring younger scouts
- Charity: Sadaqah and zakah participation
- Respect: Showing adab to elders and peers
- Responsibility: Accountability for actions

**Outdoor Skills**
- Bush Craft: Survival and nature skills
- Navigation: Map reading and direction finding
- First Aid: Emergency response knowledge
- Environmental Care: Stewardship of Allah's creation

**Life Skills**
- Halal Cooking: Preparing nutritious Islamic meals
- Emergency Response: Community support systems
- Technology: Responsible digital citizenship
- Communication: Public speaking and presentation

---

### 📅 Event Model

Islamic calendar-integrated event management system.

```prisma
model Event {
  id                  String    @id @default(cuid())
  title               String
  description         String
  location            String
  startDate           DateTime
  endDate             DateTime
  groupId             String?
  requiresPermissionSlip Boolean @default(false)
  createdAt           DateTime  @default(now())
  updatedAt           DateTime  @updatedAt
}
```

#### Event Types

**Religious Events**
- Ramadan Activities: Special iftar gatherings, night prayers
- Eid Celebrations: Community festivals and family events
- Mawlid: Prophet's birthday educational activities
- Islamic New Year: Hijri calendar celebrations

**Educational Events**
- Mosque Visits: Learning about Islamic architecture
- Islamic History Tours: Heritage site visits
- Arabic Classes: Language learning activities
- Quran Study Circles: Group recitation and understanding

**Outdoor Adventures**
- Halal Camping: Overnight adventures with Islamic values
- Nature Walks: Environmental awareness and appreciation
- Bush Craft: Survival skills and self-reliance

**Community Service**
- Charity Drives: Organising donations for those in need
- Elderly Visits: Spending time with community elders
- Mosque Cleaning: Contributing to community spaces

#### Islamic Event Features
- **Prayer Time Integration**: Events scheduled around salah times
- **Halal Requirements**: Food and activity compliance
- **Permission Management**: Parent consent for activities
- **Group Flexibility**: Academy-wide or group-specific events

---

### 📋 Attendance Model

Comprehensive attendance tracking with Islamic considerations.

```prisma
model Attendance {
  id             String    @id @default(cuid())
  scoutId        String
  userId         String
  eventId        String
  status         String    // "present", "absent", "excused"
  date           DateTime  @default(now())
}
```

#### Attendance Categories
- **Present**: Scout attended full session
- **Absent**: Scout did not attend (requires follow-up)
- **Excused**: Legitimate absence (family, medical, religious obligations)

#### Islamic Attendance Considerations
- **Prayer Time Absences**: Scouts attending mosque prayers
- **Family Obligations**: Islamic family events and responsibilities
- **Religious Education**: Madrasah and Islamic school commitments
- **Ramadan Adjustments**: Modified schedule during fasting month

---

### 💬 Message Model

Islamic-appropriate communication system.

```prisma
model Message {
  id             String    @id @default(cuid())
  content        String
  senderId       String
  receiverId     String
  read           Boolean   @default(false)
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

#### Message Types
- **Direct Messages**: One-on-one communication between users
- **Group Announcements**: Leader broadcasts to families
- **Academy Notices**: Organisation-wide communications
- **Event Reminders**: Automated notifications

#### Islamic Communication Features
- **Islamic Greetings**: Messages begin with "Assalamu Alaikum"
- **Respectful Language**: Community-appropriate communication
- **Read Receipts**: Confirmation of message delivery
- **Thread Management**: Conversation organisation

---

### 📄 Document Model

Community document and resource management.

```prisma
model Document {
  id             String    @id @default(cuid())
  title          String
  fileUrl        String
  fileType       String
  description    String?
  uploadedBy     String
  uploadDate     DateTime  @default(now())
  type           String    // "form", "policy", "announcement", etc.
  size           Int       // Size in bytes
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

#### Document Categories
- **Permission Slips**: Event-specific authorisation forms
- **Islamic Policies**: Halal food, prayer time accommodations
- **Community Announcements**: Mosque events, Islamic holidays
- **Educational Resources**: Islamic history, Arabic language materials
- **Safety Documents**: Emergency procedures and protocols

---

### 📊 Report Model

Comprehensive reporting system for community insights.

```prisma
model Report {
  id             String    @id @default(cuid())
  title          String
  type           String    // "attendance", "achievement", "financial", etc.
  date           DateTime  @default(now())
  generatedBy    String
  data           Json      // Report data in JSON format
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
}
```

#### Report Types
- **Attendance Reports**: Individual and group participation patterns
- **Achievement Reports**: Badge progress and Islamic milestone tracking
- **Financial Reports**: Event costs and community contributions
- **Activity Reports**: Event participation and community engagement
- **Incident Reports**: Safety and behavioural documentation

---

### 🚨 Incident Report Model

Safety and community incident management.

```prisma
model IncidentReport {
  id             String    @id @default(cuid())
  title          String
  description    String
  severity       String    // "low", "medium", "high", "critical"
  status         String    // "open", "investigating", "resolved", "closed"
  reportedBy     String
  assignedTo     String?
  location       String?
  dateOccurred   DateTime
  createdAt      DateTime  @default(now())
  updatedAt      DateTime  @updatedAt
  groupId        String?
}
```

#### Incident Categories
- **Safety Incidents**: Accidents, injuries, near-misses
- **Behavioural Issues**: Character development opportunities
- **Equipment Problems**: Resource and facility maintenance
- **Communication Concerns**: Community feedback and resolution

#### Islamic Approach to Incidents
- **Restorative Justice**: Focus on learning and community healing
- **Privacy Protection**: Respectful handling of sensitive information
- **Community Support**: Mobilising resources for affected families
- **Prevention Focus**: Learning from incidents to improve safety

---

## Relationship Mapping

### 👤 User Relationships

```prisma
// User can have multiple scouts as children
User -> Scout[] (one-to-many via parentId)

// User can send and receive messages
User -> Message[] (one-to-many as sender)
User -> Message[] (one-to-many as receiver)

// User can have group leadership roles
User -> UserGroup[] (many-to-many through junction table)

// User can record attendance
User -> Attendance[] (one-to-many via userId)

// User can report incidents
User -> IncidentReport[] (one-to-many via reportedBy)
```

### 👦 Scout Relationships

```prisma
// Scout belongs to one parent
Scout -> User (many-to-one via parentId)

// Scout belongs to one group
Scout -> Group (many-to-one via groupId)

// Scout can earn multiple achievements
Scout -> Achievement[] (one-to-many via scoutId)

// Scout has attendance records
Scout -> Attendance[] (one-to-many via scoutId)
```

### 👥 Group Relationships

```prisma
// Group has multiple scouts
Group -> Scout[] (one-to-many via groupId)

// Group has multiple leaders
Group -> UserGroup[] (many-to-many with User)

// Group can host events
Group -> Event[] (one-to-many via groupId)

// Group can have incident reports
Group -> IncidentReport[] (one-to-many via groupId)
```

### 📅 Event Relationships

```prisma
// Event can belong to a group (optional for academy-wide events)
Event -> Group? (many-to-one via groupId)

// Event has attendance records
Event -> Attendance[] (one-to-many via eventId)
```

---

## Data Integrity and Constraints

### 🔐 Primary Keys
- All models use `cuid()` for unique, URL-safe identifiers
- Consistent ID generation across all tables
- No sequential integers for security

### 🔗 Foreign Key Constraints
- **Cascade Deletes**: Removing parent deletes related children
- **Set Null**: Optional relationships become null when parent deleted
- **Referential Integrity**: Ensuring valid relationships

### ✅ Unique Constraints
- **User Email**: Preventing duplicate accounts
- **Group Names**: Avoiding group name conflicts
- **UserGroup Combinations**: One role per user per group

### 🕐 Timestamps
- **createdAt**: Automatic creation timestamp
- **updatedAt**: Automatic modification tracking
- **Custom Dates**: Event dates, achievement dates, incident dates

---

## Islamic Data Considerations

### 🌙 Islamic Calendar Integration
- **Hijri Dates**: Supporting Islamic calendar events
- **Prayer Times**: Integration with daily prayer schedules
- **Ramadan Handling**: Special scheduling during fasting month
- **Islamic Holidays**: Recognition of Eid and other celebrations

### 🍽️ Halal Requirements
- **Food Preferences**: Tracking dietary restrictions and requirements
- **Event Catering**: Ensuring halal compliance for all activities
- **Allergy Management**: Medical and dietary safety protocols

### 👥 Community Structure
- **Family-Centric Design**: Emphasising family unit importance
- **Multi-Generational Support**: Accommodating extended family involvement
- **Community Roles**: Recognising various contribution types
- **Privacy Considerations**: Respecting Islamic privacy guidelines

### 🎓 Educational Integration
- **Islamic Knowledge Tracking**: Quran memorisation, Arabic skills
- **Character Development**: Akhlaq and moral development metrics
- **Community Service**: Tracking ummah contribution activities
- **Leadership Development**: Preparing future community leaders

---

## Performance Optimisations

### 📊 Indexing Strategy
- **Primary Keys**: Automatic B-tree indexes on all ID fields
- **Foreign Keys**: Indexes on all relationship fields
- **User Email**: Unique index for login performance
- **Date Fields**: Indexes on event dates and timestamps

### 🔄 Query Optimisation
- **Selective Loading**: Include statements for efficient relationship loading
- **Pagination**: Limit and offset for large data sets
- **Aggregation**: Count queries for statistics and metrics
- **Filtering**: Where clauses with indexed fields

### 📈 Scalability Considerations
- **Connection Pooling**: Efficient database connection management
- **Caching Strategy**: Redis integration for frequently accessed data
- **Read Replicas**: Potential for read-heavy operations
- **Horizontal Scaling**: Database sharding for growth

---

## Data Migration and Seeding

### 📁 Real Data Integration
- **MSA Family Data**: 79 real families from NSW Islamic community
- **Leadership Team**: 35+ actual MSA leaders and support staff
- **Group Assignments**: Age-based allocation with realistic distributions
- **Historical Data**: Previous years' activities and achievements

### 🔄 Migration Scripts
- **Schema Updates**: Version-controlled database changes
- **Data Transformations**: Converting legacy data formats
- **Rollback Procedures**: Safe migration reversal processes
- **Testing Protocols**: Validation of migration success

### 🌱 Seed Data
- **Achievement Templates**: Pre-configured Islamic badge system
- **Group Structure**: Standard MSA group configuration
- **Sample Events**: Template Islamic calendar events
- **Default Settings**: Community-appropriate initial configurations

---

## Security and Privacy

### 🔒 Data Protection
- **Password Hashing**: Bcrypt for secure password storage
- **Role-Based Access**: Granular permissions by user role
- **Data Encryption**: Sensitive field encryption at rest
- **Audit Logging**: Tracking data access and modifications

### 👨‍👩‍👧‍👦 Family Privacy
- **Parent Consent**: Explicit permissions for child data usage
- **Photo Permissions**: Separate consent for image sharing
- **Contact Information**: Secure storage of family details
- **Communication Preferences**: Respecting family communication choices

### 🛡️ Islamic Privacy Guidelines
- **Gender Considerations**: Appropriate data access by leader gender
- **Community Confidentiality**: Protecting sensitive family information
- **Incident Privacy**: Careful handling of behavioural and safety reports
- **Spiritual Privacy**: Respecting personal religious progress information

---

## Backup and Recovery

### 💾 Backup Strategy
- **Daily Backups**: Automated database snapshots
- **Point-in-Time Recovery**: Ability to restore to specific moments
- **Offsite Storage**: Secure cloud backup storage
- **Encryption**: Encrypted backup files for security

### 🔄 Disaster Recovery
- **Recovery Testing**: Regular validation of backup restoration
- **Documentation**: Clear procedures for emergency recovery
- **Communication Plan**: Notifying community during system issues
- **Minimal Downtime**: Strategies for rapid service restoration

---

*This data structure supports the Islamic values and community needs of Mi'raj Scouts Academy whilst providing robust, scalable technology for family and scout management.*

**For technical support or schema questions, contact the development team or database administrators.**

---

*بارك الله فيكم - May Allah bless this system that serves our community*