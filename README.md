# Scout Management System

A comprehensive platform for managing scout groups, activities, and communication built with Next.js 14, TypeScript, and Tailwind CSS.

## Features

- **Role-based Dashboards**: Separate portals for Parents, Leaders, and Executives
- **Scout Management**: Track scout information, achievements, and attendance
- **Event Planning**: Create and manage events for scout groups
- **Communication**: Messaging system between parents, leaders, and executives
- **Reporting**: Generate and view reports on attendance, achievements, and more

## User Roles

1. **Parent Portal**: View their scouts' information, upcoming events, and communicate with leaders
2. **Leader Portal**: Manage scouts in their groups, track attendance, plan events, and generate reports
3. **Executive Portal**: Oversee all groups, leaders, members, and organization-wide metrics

## Getting Started

First, run the development server:

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## Demo Accounts

- **Parent**: john@example.com
- **Leader**: jane@example.com
- **Executive**: michael@example.com
- Password: any non-empty string (for demo purposes)

## Tech Stack

- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **Database**: Mock data (can be replaced with Supabase or another DB solution)

## Project Structure

- **/app**: Next.js app router pages and layouts
  - **(auth)**: Authentication related routes (login)
  - **(dashboard)**: Dashboard routes for each user role
- **/components**: Reusable UI components
  - **/layout**: Layout components (Header, Sidebar, DashboardLayout)
  - **/navigation**: Navigation configurations for each role
  - **/scouts**: Scout-related components
  - **/ui**: Base UI components (Button, Card, Input, Modal, Select)
- **/lib**: Utility functions and mock data
- **/types**: TypeScript interfaces and types
- **/public**: Static assets

## Development Notes

- The system currently uses mock data to simulate backend functionality
- Authentication is simulated through localStorage
- For production use, implement proper authentication and database integration
