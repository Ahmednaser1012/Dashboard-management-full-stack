 
# لوحة تحكم المشاريع - Project Dashboard

## نظرة عامة
تطبيق ويب متكامل لإدارة المشاريع والمهام مع واجهة مستخدم تفاعلية. يوفر النظام إمكانية متابعة المشاريع، إدارة المهام، وتتبع التقدم.

## المميزات الرئيسية
- نظام مصادقة مستخدمين متكامل
- إدارة المشاريع والمهام
- واجهة مستخدم تفاعلية
- تقارير وإحصائيات

## متطلبات النظام
- PHP 8.1 أو أحدث
- Composer
- Node.js و NPM
- قاعدة بيانات MySQL/PostgreSQL/SQLite

 
## Overview
A comprehensive web application for project and task management with an interactive user interface. The system allows tracking projects, managing tasks, and monitoring progress.

## Key Features
- Integrated user authentication system
- Project and task management
- Interactive user interface
- Real-time updates via WebSockets
- Reports and statistics

## System Requirements
- PHP 8.1 or later
- Composer
- Node.js and NPM
- MySQL/PostgreSQL/SQLite database

## Installation
1. Clone the repository
2. `composer install`
3. `npm install`
4. `cp .env.example .env`
5. `php artisan key:generate`
6. Configure `.env` with your database connection details
7. `php artisan migrate --seed`
8. `php artisan serve`
  