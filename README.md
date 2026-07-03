# Committee Task Management System

A robust, full-stack web application designed to streamline operations, track responsibilities, and manage task delegations for university dormitory committees (such as those within BME faculties). 

This system replaces chaotic group chats with a structured dashboard featuring Role-Based Access Control (RBAC), proof-of-work image uploads, and automated semester-based data retention.

## ✨ Key Features

* **Role-Based Access Control (RBAC):** Four distinct tier levels (`Admin`, `Committee`, `Member`, `Observer`) ensuring users only see and interact with what they are permitted to.
* **Smart Categorization:** Tasks are grouped by category (e.g., Bathroom, Kitchen, Repairs). Categories can be customized to explicitly require photographic proof of completion.
* **Proof-of-Work Uploads:** Integrated multipart file uploading using `multer`, allowing residents to upload images (like a clean stove or a repaired door) directly to the server filesystem.
* **Automated Data Pruning:** Built-in SQLite rolling-window retention policy that allows Admins to securely wipe tasks older than one year to keep the database lightweight across academic semesters.
* **Leaderboards & Analytics:** Dynamic tracking of "Most Tasks" and "Most Points" aggregated strictly by the current calendar month.
* **Secure Authentication:** JWT-based session management and bcrypt password hashing.

## 🛠️ Tech Stack

**Frontend:**
* React.js
* Tailwind CSS
* Lucide React (Icons)

**Backend:**
* Node.js & Express.js
* SQLite3 (Relational Database)
* Multer (Filesystem Image Handling)
* JSON Web Tokens (JWT) & Bcrypt (Security)

## 🚀 Installation & Setup

1. **Clone the repository:**
   ```bash
   git clone [https://github.com/abdy-007/CommitteeTaskManagementWebsite.git](https://github.com/abdy-007/CommitteeTaskManagementWebsite.git)
   cd CommitteeTaskManagementWebsite