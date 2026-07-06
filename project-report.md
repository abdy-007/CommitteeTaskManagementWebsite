---
title: "Committee Task Management System: Architecture & Engineering Decisions"
date: 2026-07-06
description: "A technical overview of a full-stack dormitory task management dashboard built for student committee operations."
tags: ["react", "node.js", "sqlite", "systems-engineering", "pledge-project"]
---

# Committee Task Management System

**Project Type:** Engineering Pledge Project / Systems Development  
**Tech Stack:** React, Tailwind CSS, Node.js, Express, SQLite, Multer  

## 1. Project Overview & Methodology

Managing shared dormitory operations through standard group chats introduces a single point of failure: a lack of accountability and the rapid loss of operational data. To solve this, our team engineered a full-stack web application that acts as a centralized control hub for task delegation, proof-of-work tracking, and role-based access control (RBAC). 

**Iterative Development:** Throughout the development lifecycle, I collaborated closely with my team to debug architecture bottlenecks and implement core features. We utilized an Agile approach, iteratively presenting our patches to a committee member for feedback. This ensured the system evolved directly alongside their actual operational needs rather than in a vacuum.

## 2. Technical Architecture

The system utilizes a decoupled client-server architecture:
* **Frontend:** A responsive Single Page Application (SPA) built with React and Tailwind CSS, utilizing conditional rendering to adapt complex dashboard layouts to mobile viewports.
* **Backend:** A RESTful API driven by Node.js and Express.
* **Database:** SQLite, chosen for its lightweight, serverless nature which is ideal for embedded and localized committee operations.
* **Authentication:** JSON Web Tokens (JWT) paired with Bcrypt for secure password hashing and session management.

## 3. Key Engineering Decisions

Instead of deploying a basic CRUD application, we implemented several specific engineering solutions to ensure the system's long-term scalability and resilience.

### A. Decoupled Storage: Filesystem vs. Database Bloat
Storing Base64 image data directly inside a relational database severely degrades query speeds and causes massive file bloat. To solve this, we integrated the `multer` middleware. Images uploaded as "proof-of-work" (e.g., a cleaned kitchen or repaired hardware) are written directly to the server's local filesystem. The SQLite database only stores a lightweight URL pointer, ensuring fast database reads while handling heavy binary payloads efficiently.

### B. Automated Data Lifecycle Management
Dormitory task data becomes operationally irrelevant after the academic semester concludes. To prevent infinite database growth, we built an automated rolling-window deletion endpoint. Using strict SQLite date-parsing logic, administrators can execute a mass-prune of any tasks older than one year. This acts as an automated garbage collector, maintaining query performance across multiple semesters.

### C. Single-Port Network Tunneling
To move the application out of a local development environment and allow real-world mobile testing by committee members, we reconfigured the Node.js backend to serve the compiled React production build natively. By routing both the API and the static assets through a single port, we bypassed cross-origin limitations. This allowed the entire full-stack application to be securely tunneled to the web using Ngrok, granting immediate mobile access to the team without requiring a dedicated cloud hosting setup.

### D. Strict Role-Based Access Control (RBAC)
To protect system integrity, the application enforces a strict permission matrix (`Admin`, `Committee`, `Member`, `Observer`). The UI dynamically evaluates the active user's cryptographic token against the target data's ownership ID. For example, a standard `Member` can only execute a "Delete Task" operation if the database confirms they are the original author of that specific task, preventing accidental or malicious data loss.

## 4. Conclusion

This project required applying strict systems thinking to a highly practical workflow problem. By focusing on database optimization, secure routing, responsive UI design, and continuous stakeholder feedback, we successfully delivered a production-ready application capable of handling the operational load of a student committee.
