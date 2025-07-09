# MSA Portal API Reference

> **Assalamu Alaikum** - Welcome to the Mi'raj Scouts Academy Portal API Documentation

## Overview

The MSA Portal API provides comprehensive endpoints for managing an Islamic scouting organisation, supporting three main portal types:
- **Parent Portal**: Family account management and child tracking
- **Leader Portal**: Scout group management and activity coordination  
- **Executive Portal**: Academy-wide administration and oversight

**Base URL**: `https://your-domain.vercel.app/api`
**Authentication**: JWT-based authentication with role-based access control
**Data Format**: JSON requests and responses
**Framework**: Next.js 14 API Routes with Prisma ORM

---

## Authentication

### JWT Token Structure
All authenticated endpoints require a valid JWT token in the Authorization header:

```http
Authorization: Bearer <jwt_token>
```

**User Roles**:
- `parent`: Access to own children's data and family information
- `leader`: Access to assigned scout groups and activities
- `executive`: Full academy-wide access
- `parent_leader`: Combined parent and leader permissions
- `support`: Limited administrative access

---

## Core Endpoints

### 🏆 Achievements API

Manage scout achievements and badges with Islamic values integration.

#### GET `/api/achievements`
Retrieve achievements with optional filtering.

**Query Parameters**:
- `scoutId`: Filter by specific scout (optional)
- `page`: Page number for pagination (default: 1)
- `limit`: Items per page (default: 50)

**Example Request**:
```http
GET /api/achievements?scoutId=scout_123&page=1&limit=10
```

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "achievement_456",
      "name": "Salah Excellence Badge",
      "description": "Demonstrated consistent daily prayers for 30 days",
      "dateEarned": "2025-01-15T00:00:00.000Z",
      "scoutId": "scout_123",
      "scout": {
        "id": "scout_123",
        "name": "Ahmad Hassan",
        "group": {
          "id": "group_cubs",
          "name": "Cubs"
        }
      }
    }
  ],
  "pagination": {
    "page": 1,
    "limit": 10,
    "total": 25,
    "totalPages": 3
  },
  "timestamp": "2025-01-21T10:30:00.000Z"
}
```

#### POST `/api/achievements`
Award a new achievement to a scout.

**Request Body**:
```json
{
  "name": "Quran Memorisation Badge",
  "description": "Successfully memorised Surah Al-Fatiha and 3 short surahs",
  "scoutId": "scout_123",
  "dateEarned": "2025-01-20T00:00:00.000Z"
}
```

**MSA-Specific Achievement Types**:
- **Islamic Achievements**: Salah Excellence, Quran Memorisation, Islamic History
- **Character Building**: Honesty Badge, Community Service, Leadership
- **Outdoor Skills**: Bush Craft, Navigation, First Aid
- **Life Skills**: Cooking, Emergency Response, Technology

#### PUT `/api/achievements`
Update an existing achievement.

**Request Body**:
```json
{
  "id": "achievement_456",
  "name": "Advanced Salah Excellence",
  "description": "Demonstrated leadership in group prayers",
  "dateEarned": "2025-01-21T00:00:00.000Z"
}
```

#### DELETE `/api/achievements?id=achievement_456`
Remove an achievement (requires leader or executive role).

---

### 📅 Events API

Manage scout events and activities with Islamic calendar integration.

#### GET `/api/events`
Retrieve events with filtering options.

**Query Parameters**:
- `groupId`: Filter by scout group (optional)
- `upcoming`: Show only future events (boolean)
- `page`: Page number (default: 1)
- `limit`: Items per page (default: 20)

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "event_789",
      "title": "Ramadan Night Hike",
      "description": "Special night hike during the blessed month with Islamic reflections",
      "location": "Royal National Park",
      "startDate": "2025-03-15T18:00:00.000Z",
      "endDate": "2025-03-15T22:00:00.000Z",
      "requiresPermissionSlip": true,
      "group": {
        "id": "group_scouts",
        "name": "Scouts"
      },
      "stats": {
        "totalAttendees": 15,
        "present": 12,
        "absent": 2,
        "excused": 1
      }
    }
  ]
}
```

#### POST `/api/events`
Create a new event.

**Request Body**:
```json
{
  "title": "Eid Community Celebration",
  "description": "Celebrating Eid with the MSA community and families",
  "location": "Lakemba Mosque Community Hall",
  "startDate": "2025-04-10T10:00:00.000Z",
  "endDate": "2025-04-10T15:00:00.000Z",
  "groupId": "group_all",
  "requiresPermissionSlip": false
}
```

**Islamic Event Types**:
- **Religious Observances**: Ramadan activities, Eid celebrations, Mawlid
- **Community Service**: Charity drives, mosque cleaning, elderly visits
- **Educational**: Islamic history tours, mosque visits, Arabic classes
- **Outdoor Adventures**: Halal camping, nature walks, star gazing

---

### 👦 Scouts API

Manage scout profiles and information.

#### GET `/api/scouts`
Retrieve scout information with relationships.

**Query Parameters**:
- `groupId`: Filter by scout group
- `parentId`: Filter by parent

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "scout_123",
      "name": "Ahmad Hassan",
      "age": 10,
      "rank": "Senior Cub",
      "joinedDate": "2024-09-01T00:00:00.000Z",
      "parent": {
        "name": "Hassan Al-Ahmad",
        "email": "hassan.ahmad@email.com"
      },
      "group": {
        "name": "Cubs",
        "description": "Ages 8-10 Islamic scouting group"
      },
      "achievements": [
        {
          "name": "Salah Excellence Badge",
          "dateEarned": "2025-01-15T00:00:00.000Z"
        }
      ],
      "attendance": [
        {
          "event": {
            "title": "Weekend Bushwalk",
            "startDate": "2025-01-14T09:00:00.000Z"
          },
          "status": "present"
        }
      ]
    }
  ],
  "count": 75,
  "message": "Found 75 scouts in Mi'raj Scouts Academy"
}
```

#### POST `/api/scouts`
Register a new scout.

**Request Body**:
```json
{
  "name": "Fatimah Ali",
  "age": 7,
  "rank": "Joey",
  "parentId": "user_parent_456",
  "groupId": "group_joeys"
}
```

**MSA Group Structure**:
- **Joeys** (Ages 5-7): Foundation Islamic values and basic skills
- **Cubs** (Ages 8-10): Intermediate Islamic education and outdoor skills
- **Scouts** (Ages 11-15): Advanced Islamic leadership and community service

---

### 👥 Users API

Manage user accounts across all portal types.

#### GET `/api/users`
Retrieve user information with role-based filtering.

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "user_789",
      "name": "Sarah Droubi",
      "email": "sarah.droubi@hotmail.com",
      "role": "executive",
      "isParent": false,
      "isLeader": false,
      "isExecutive": true,
      "defaultPortal": null,
      "lastSeen": "2025-01-21T09:30:00.000Z",
      "isOnline": true
    }
  ]
}
```

**User Role Types**:
- **parent**: Family account with child management
- **leader**: Scout group leadership and activity management
- **executive**: Academy-wide administrative access
- **parent_leader**: Combined parent and leader roles (common in community)
- **support**: Limited administrative support access

---

### 💬 Messages API

Handle communication between parents, leaders, and executives.

#### GET `/api/messages`
Retrieve messages and conversations.

**Features**:
- One-on-one messaging between users
- Group announcements from leaders
- Islamic-appropriate communication guidelines
- Read/unread status tracking
- Message threading and conversation management

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "message_123",
      "content": "Assalamu Alaikum. Reminder: Jummah prayer attendance for all scouts this Friday.",
      "senderId": "leader_456",
      "receiverId": "parent_789",
      "read": false,
      "createdAt": "2025-01-21T08:00:00.000Z",
      "sender": {
        "name": "Brother Ali Makki",
        "role": "leader"
      }
    }
  ]
}
```

---

### 📊 Groups API

Manage scout groups and their structure.

#### GET `/api/groups`
Retrieve group information with statistics.

**Example Response**:
```json
{
  "success": true,
  "data": [
    {
      "id": "group_cubs",
      "name": "Cubs",
      "description": "Ages 8-10: Intermediate Islamic education and outdoor adventures",
      "scouts": [
        {
          "id": "scout_123",
          "name": "Ahmad Hassan",
          "age": 10
        }
      ],
      "groupLeaders": [
        {
          "user": {
            "name": "Brother Hassan Hijazi",
            "role": "leader"
          }
        }
      ],
      "statistics": {
        "totalScouts": 36,
        "activeEvents": 3,
        "recentAchievements": 12
      }
    }
  ]
}
```

---

### 📋 Attendance API

Track scout attendance at events and activities.

**Features**:
- Event-based attendance tracking
- Parent notification system
- Excuse management for Islamic observances
- Attendance statistics and reporting

---

### 📄 Documents API

Manage forms, policies, and announcements.

**Document Types**:
- **Permission Slips**: Event-specific authorisation forms
- **Islamic Policies**: Halal food, prayer time accommodations
- **Community Announcements**: Mosque events, Islamic holidays
- **Educational Resources**: Islamic history, Arabic language materials

---

### 📈 Reports API

Generate comprehensive reports for different user roles.

**Report Types**:
- **Attendance Reports**: Individual and group attendance patterns
- **Achievement Reports**: Badge progress and Islamic milestone tracking
- **Financial Reports**: Event costs and community contributions
- **Activity Reports**: Event participation and community engagement

---

## Executive Portal APIs

### 🏛️ Executive Dashboard
**Endpoint**: `/api/executive/dashboard-stats`

Provides academy-wide statistics and analytics for executive oversight.

### 👨‍💼 Leader Management
**Endpoints**: 
- `/api/executive/leaders` - CRUD operations for leader accounts
- `/api/executive/leaders/[id]/groups` - Group assignment management

### 🎯 Event Management
**Endpoints**:
- `/api/executive/events` - Academy-wide event management
- `/api/executive/events/[id]/attendance` - Cross-group attendance tracking

---

## Data Import APIs

### 📊 MSA Data Import
**Endpoint**: `/api/import-msa-data`

Bulk import system for MSA family applications and community data.

**Features**:
- CSV processing for family applications
- Automatic parent and scout account creation
- Group assignment based on age demographics
- NSW address validation for local community
- Duplicate detection and handling

---

## Error Handling

All API endpoints follow consistent error response format:

```json
{
  "success": false,
  "error": "Detailed error message",
  "details": "Technical error details",
  "timestamp": "2025-01-21T10:30:00.000Z"
}
```

**Common HTTP Status Codes**:
- `200 OK`: Successful operation
- `400 Bad Request`: Invalid request data
- `401 Unauthorized`: Authentication required
- `403 Forbidden`: Insufficient permissions
- `404 Not Found`: Resource not found
- `500 Internal Server Error`: Server error

---

## Rate Limiting

API requests are limited to ensure fair usage:
- **Authenticated Users**: 1000 requests per hour
- **Unauthenticated**: 100 requests per hour
- **Bulk Operations**: 50 requests per hour

---

## Islamic Considerations

The MSA Portal API is designed with Islamic values and community needs in mind:

### 🕌 **Prayer Time Integration**
- Events scheduled around prayer times
- Automatic prayer break reminders
- Qibla direction information for outdoor activities

### 🌙 **Islamic Calendar Support**
- Hijri date integration
- Ramadan and Eid event handling
- Islamic holiday notifications

### 🍽️ **Halal Compliance**
- Food preference tracking
- Halal certification requirements for events
- Dietary restriction management

### 🎓 **Islamic Education Features**
- Quran memorisation tracking
- Islamic knowledge assessments
- Arabic language progress monitoring

### 👥 **Community Values**
- Family-first approach to data organisation
- Respect for privacy and Islamic guidelines
- Community service and charity integration

---

## Getting Started

1. **Authentication**: Obtain JWT token via login endpoint
2. **Role Assignment**: Ensure proper role for API access
3. **Test Endpoints**: Start with GET requests to understand data structure
4. **Islamic Integration**: Consider prayer times and Islamic calendar in scheduling
5. **Community Focus**: Remember the family and community-centric approach

**Next Steps**: Explore the [User Guides](./user-guides/) for portal-specific functionality and the [Data Structure](./data-structure.md) documentation for detailed schema information.

---

*بارك الله فيكم - May Allah bless your development efforts*