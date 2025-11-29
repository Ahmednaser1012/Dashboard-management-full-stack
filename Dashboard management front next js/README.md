#   لوحة تحكم إدارة المشاريع

تطبيق ويب حديث لإدارة المشاريع والمهام والفريق. يساعدك تنظم شغلك وتتابع التقدم وتدير الميزانية بسهولة.

## Tech Stack

Next.js 15, React 19, Tailwind CSS, shadcn/ui, Redux Toolkit, React Query, React Hook Form, Zod, Lucide React, Recharts

## Features

- Dashboard
- Project management: create, edit, delete with pagination, sorting, filtering
- Tasks: create, prioritize, track progress
- Inline editing (projects and tasks)
- Search by name + filter by status, priority, assigned user
- Role-based permissions (Admin, PM, Developer)
- Budget tracking
- Charts and analytics
- Auth and protected routes
- Responsive UI
- Skeleton loaders


## Architecture

Architecture : Layered + Domain-based:
Presentation: src/app, src/components, src/shared/components
State: src/store (slices: auth, projects)
Data/Services: src/services
base/BaseCrudApi.ts (CRUD base) → modules/*.service.ts (auth/projects/tasks/users)
config/axios.config.ts(Axios)
Hooks: src/hooks (useAuth/useProjects/useTasks/useUsers + queryKeys)
Lib: src/lib (permissions/utils), Types: src/types

## Getting Started

- Requirements: Node.js , npm
- Install: npm install
- Dev: npm run dev → http://localhost:3000
- Build: npm run build

## Test Accounts

- Admin: admin@example.com | 12345678
- Project Manager: pm@example.com | 12345678
- Developer: dev@example.com | 12345678

## How to Use

### Login

1. Open the app
2. Use a test account
3. You'll be redirected to the dashboard

### Create a Project

1. Go to Projects
2. Click "Add Project"
3. Fill required fields
4. Save

### Manage Tasks

1. Open a project
2. Click "Add Task"
3. Enter details
4. Set priority and assignee
5. Save

### Find & Organize

- Search by name
- Filter by status, priority, assignee
- Use pagination and sorting
- Inline edit directly in table rows

### Budget & Analytics

- Live stats on the dashboard
- Charts for progress/budget
- View remaining budget

# ProjectHub API - Laravel Backend

Backend API for project management system built with Laravel.

## Tech Stack

- Laravel 11
- PHP 8.2+
- MySQL/PostgreSQL
- JWT Authentication
- Laravel Sanctum
