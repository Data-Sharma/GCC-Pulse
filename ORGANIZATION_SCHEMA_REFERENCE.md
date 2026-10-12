# Organization Schema Reference

This document provides a reference for the organization and membership schema that would support the multi-tenant features described in the project requirements.

## Overview

GCC Pulse is designed to support both personal accounts and organization accounts. Organizations allow multiple users to collaborate and share access to GCC intelligence workspaces.

## Proposed Schema

Below is a reference schema for implementing organization and membership management. This is **for reference only** and should be reviewed and adapted for your specific requirements.

```sql
-- Organizations table
create table if not exists public.organizations (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text unique not null,
  description text,
  website text,
  created_by uuid not null references auth.users(id) on delete set null,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Organization members table
create table if not exists public.organization_members (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  role text not null default 'member' check (role in ('owner', 'admin', 'member', 'viewer')),
  joined_at timestamptz not null default now(),
  unique(organization_id, user_id)
);

-- Organization invitations table (optional)
create table if not exists public.organization_invitations (
  id uuid primary key default gen_random_uuid(),
  organization_id uuid not null references public.organizations(id) on delete cascade,
  email text not null,
  role text not null default 'member',
  token text unique not null,
  expires_at timestamptz not null,
  accepted_at timestamptz,
  created_at timestamptz not null default now()
);

-- Create indexes
create index if not exists organizations_slug_idx on public.organizations(slug);
create index if not exists org_members_user_idx on public.organization_members(user_id);
create index if not exists org_members_org_idx on public.organization_members(organization_id);
create index if not exists org_invitations_email_idx on public.organization_invitations(email);

-- Enable row level security
alter table public.organizations enable row level security;
alter table public.organization_members enable row level security;
alter table public.organization_invitations enable row level security;

-- RLS Policies for organizations
drop policy if exists "Users can read organizations they belong to" on public.organizations;
create policy "Users can read organizations they belong to" on public.organizations
  for select
  using (
    id in (
      select organization_id
      from public.organization_members
      where user_id = auth.uid()
    )
  );

drop policy if exists "Organization owners can update their org" on public.organizations;
create policy "Organization owners can update their org" on public.organizations
  for update
  using (
    created_by = auth.uid() or
    id in (
      select organization_id
      from public.organization_members
      where user_id = auth.uid() and role = 'owner'
    )
  );

-- RLS Policies for organization members
drop policy if exists "Users can read members of their organizations" on public.organization_members;
create policy "Users can read members of their organizations" on public.organization_members
  for select
  using (
    organization_id in (
      select organization_id
      from public.organization_members
      where user_id = auth.uid()
    )
  );

drop policy if exists "Org admins can manage members" on public.organization_members;
create policy "Org admins can manage members" on public.organization_members
  for all
  using (
    organization_id in (
      select organization_id
      from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );

-- RLS Policies for invitations
drop policy if exists "Users can read their invitations" on public.organization_invitations;
create policy "Users can read their invitations" on public.organization_invitations
  for select
  using (
    email = (select email from auth.users where id = auth.uid())
  );

drop policy if exists "Org admins can manage invitations" on public.organization_invitations;
create policy "Org admins can manage invitations" on public.organization_invitations
  for all
  using (
    organization_id in (
      select organization_id
      from public.organization_members
      where user_id = auth.uid() and role in ('owner', 'admin')
    )
  );
```

## Authorization Model

### Roles

- **Owner**: Full control over the organization, including ability to delete it, manage members, and change settings
- **Admin**: Can manage members, invitations, and organization settings
- **Member**: Can access shared resources and data
- **Viewer**: Read-only access to shared resources

### Key Principles

1. **Least Privilege**: Users start with minimal permissions and must be explicitly granted access
2. **Organization Isolation**: Users can only see organizations they belong to
3. **Server-Side Verification**: All membership checks are verified server-side before exposing data
4. **No Domain-Based Access**: Organization membership is not automatically granted based on email domain

## Implementation Notes

### Personal Accounts

When a user first signs in with a personal account, they:
1. Get an entry in the `auth.users` table (handled by Supabase Auth)
2. Can access GCC Pulse public data immediately
3. Can create an organization later if needed

### Organization Accounts

When a user signs in with an organization account, they must:
1. Have an entry in `organization_members` with an appropriate role
2. This can be established through:
   - Invitation token (via email)
   - Admin adding them directly
   - Joining with a valid invite code

## Migration Strategy

To implement this schema:

1. **Phase 1**: Set up the tables and RLS policies in your Supabase database
2. **Phase 2**: Create backend endpoints for organization CRUD operations
3. **Phase 3**: Create backend endpoints for membership management
4. **Phase 4**: Build the UI for organization creation and management
5. **Phase 5**: Implement invitation flow and membership acceptance

## Testing Checklist

- [ ] Users can create organizations
- [ ] Organization creators are auto-added as owners
- [ ] Organization members can read the organization
- [ ] Non-members cannot read the organization
- [ ] Admins can add/remove members
- [ ] Role-based access control is enforced
- [ ] RLS prevents unauthorized data access
- [ ] Invitations can be created and accepted
- [ ] Expired invitations are not accepted
- [ ] Users with multiple organizations see only their memberships
