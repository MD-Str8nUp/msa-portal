# Supabase Setup Instructions

## 1. Create a Supabase Project

1. Go to [supabase.com](https://supabase.com) and create an account
2. Create a new project
3. Wait for the project to be set up

## 2. Get Your Project Credentials

From your Supabase dashboard:

1. Go to Settings → API
2. Copy your Project URL
3. Copy your `anon` (public) key
4. Copy your `service_role` (secret) key

## 3. Update Environment Variables

Update your `.env` file with your Supabase credentials:

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL="https://your-project-ref.supabase.co"
NEXT_PUBLIC_SUPABASE_ANON_KEY="your-anon-key-here"
SUPABASE_SERVICE_ROLE_KEY="your-service-role-key-here"
```

## 4. Run the Database Migration

1. In your Supabase dashboard, go to the SQL Editor
2. Copy the contents of `supabase/migration.sql`
3. Paste and run the SQL to create all tables

## 5. Run the Seed Script

Once your tables are created, run the seed script:

```bash
node scripts/seed.js
```

## 6. Update Your Application Code

The main changes needed in your application:

### Replace Prisma imports with Supabase

```javascript
// Old (Prisma)
import { prisma } from '@/lib/prisma'

// New (Supabase)
import { supabase, supabaseAdmin } from '@/lib/supabase'
```

### Update API calls

```javascript
// Old (Prisma)
const users = await prisma.user.findMany()

// New (Supabase)
const { data: users, error } = await supabase
  .from('users')
  .select('*')
```

## 7. Key Differences

### Table Names
- Tables use snake_case in Supabase (e.g., `group_id` instead of `groupId`)
- Some field names have changed to follow PostgreSQL conventions

### Field Mapping
- `groupId` → `group_id`
- `parentId` → `parent_id`
- `startDate` → `start_date`
- `endDate` → `end_date`
- `requiresPermissionSlip` → `requires_permission_slip`

### Error Handling
Supabase returns `{ data, error }` objects, so you need to check for errors:

```javascript
const { data, error } = await supabase.from('users').select('*')
if (error) {
  console.error('Error:', error)
  return
}
// Use data here
```

## 8. Authentication

Supabase has built-in authentication. You can:

1. Enable email/password auth in the Supabase dashboard
2. Use `supabase.auth.signIn()` and `supabase.auth.signUp()`
3. Set up Row Level Security policies for data access control

## 9. Real-time Features

Supabase supports real-time subscriptions:

```javascript
supabase
  .from('messages')
  .on('INSERT', payload => {
    console.log('New message:', payload.new)
  })
  .subscribe()
```

## 10. File Storage

For file uploads (avatars, documents), use Supabase Storage:

```javascript
const { data, error } = await supabase.storage
  .from('avatars')
  .upload('public/avatar.png', file)
```
