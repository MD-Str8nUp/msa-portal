# MSA Portal Database Setup Instructions

## 🚨 **Critical Step Required**

Your database schema needs to be updated to match your application's API expectations. Please complete this step:

### Step 1: Run Schema Fix in Supabase

1. **Go to your Supabase Dashboard**: https://supabase.com/dashboard/project/munqzgxhluteurttlydq
2. **Navigate to**: SQL Editor
3. **Copy and paste** the contents of `supabase/fix-schema.sql`
4. **Click "Run"** to execute the schema updates

### What This Fixes

✅ **Creates `users` table** with `first_name`, `last_name` columns (your API expects these)  
✅ **Fixes RLS recursion issues** that prevent data access  
✅ **Adds missing tables** for scouts, events, messages, documents  
✅ **Creates test users** you can login with immediately  
✅ **Proper foreign key relationships** between users → scouts → groups  

### Test Users After Setup

- **Admin**: admin@msaportal.com / MSA@Admin2025!
- **Test Parent**: test@test.com / test123  
- **Leader**: jane@example.com / test123

## Next Steps (Automated)

Once you've run the SQL schema:

1. ✅ **MCP Server** is already configured and running  
2. ✅ **API Integration** will automatically work with new schema  
3. 🔄 **Mock Data Replacement** will happen automatically  
4. 🔄 **Component Updates** will connect to real database  

## Current Status

- ✅ MCP server connected to your Supabase database
- ✅ Schema analysis completed  
- ⏳ **Waiting for you to run the SQL schema update**
- ⏳ Then automatic mock data replacement begins

## Why This is Needed

Your current database has:
- `profiles` table with single `name` column
- RLS policies causing infinite recursion  
- Empty tables with no test data

Your application expects:
- `users` table with `first_name`, `last_name` columns
- Working authentication with real data
- Inter-connected scouts, groups, and events data

The schema fix bridges this gap perfectly.