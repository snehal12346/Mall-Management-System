-- ============================================================================
-- EXP 7: MALL MANAGEMENT SYSTEM (Case Study: Phoenix Marketcity, Mumbai)
-- SCRIPT 01: Database Creation
-- Database Name: Mini_project_172_173
-- DBMS Target: PostgreSQL 14+ / 15 / 16 / 17 / 18
-- ============================================================================

-- Terminate active connections to the database if it exists (for clean recreation)
SELECT pg_terminate_backend(pid)
FROM pg_stat_activity
WHERE datname = 'mini_project_172_173'
  AND pid <> pg_backend_pid();

-- Drop database if already exists
DROP DATABASE IF EXISTS mini_project_172_173;

-- Create Database
CREATE DATABASE mini_project_172_173
    WITH
    OWNER = postgres
    ENCODING = 'UTF8'
    LC_COLLATE = 'C'
    LC_CTYPE = 'C'
    TABLESPACE = pg_default
    CONNECTION LIMIT = -1;

\echo 'Database mini_project_172_173 successfully created.'
\c mini_project_172_173;
