# Fleet Management System

A comprehensive fleet management solution featuring a robust Django backend and a modern React frontend. This system allows for efficient management of vehicles, drivers, and operational data.

## 🚀 Tech Stack

### Backend
- **Framework:** Django 5.2.8
- **API:** Django REST Framework (DRF)
- **Database:** PostgreSQL (Production), SQLite (Development)
- **Documentation:** DRF Spectacular (Swagger/OpenAPI)

### Frontend
- **Framework:** React 19
- **Build Tool:** Vite
- **Language:** TypeScript
- **UI Components:** Lucide React (Icons), Recharts (Charts)

### Infrastructure & DevOps
- **Containerization:** Docker & Docker Compose
- **Web Server:** Nginx
- **CI/CD:** GitHub Actions
- **Registry:** GitHub Container Registry (GHCR)
- **Cloud Provider:** Digital Ocean

## 🛠️ Local Development

### Prerequisites
- Docker & Docker Compose
- Node.js (v18+) & npm
- Python 3.11+ (optional, if running backend without Docker)

### 1. Backend Setup
The backend and database can be run using Docker Compose.

1. Create a `.env` file in the `backend` directory (or root, depending on setup) with necessary variables (see Environment Variables section).
2. Start the backend and database:
   ```bash
   docker-compose up -d
   ```
   The API will be available at `http://localhost:8000`.

### 2. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd idafleet-ui
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server:
   ```bash
   npm run dev
   ```
   The frontend will be available at `http://localhost:5173`.

## 🚢 Production Deployment

The project is configured with a complete CI/CD pipeline using GitHub Actions.

### Pipeline Overview
1.  **Build:** On push to `main`, Docker images for the backend and frontend are built.
2.  **Push:** Images are pushed to GitHub Container Registry (GHCR).
3.  **Deploy:** The pipeline connects to the Digital Ocean Droplet via SSH, pulls the new images, and updates the running containers.

### Configuration
To set up the deployment, you need to configure the following **GitHub Repository Secrets**:

| Secret Name | Description |
| :--- | :--- |
| `DO_HOST` | IP address of your Digital Ocean Droplet. |
| `DO_USERNAME` | SSH username (e.g., `root`). |
| `DO_SSH_KEY` | Private SSH key for server access. |
| `DOMAIN_NAME` | Your custom domain name (e.g., `example.com`). |

### Manual Deployment (On Server)
If you need to manually run the production setup on the server:
```bash
# Export necessary variables
export DOMAIN_NAME=yourdomain.com
export GITHUB_REPOSITORY_OWNER=yourusername

# Pull and run
docker-compose -f docker-compose.prod.yml pull
docker-compose -f docker-compose.prod.yml up -d
```

## 🔐 Environment Variables

### Backend (`.env`)
```env
DEBUG=True
SECRET_KEY=your_secret_key
ALLOWED_HOSTS=localhost,127.0.0.1
DATABASE_URL=postgres://user:password@db:5432/dbname
DOMAIN_NAME=example.com
```

### Frontend
The frontend is built as a static site in production and served by Nginx. API base URLs should be configured in the build environment or via Nginx proxying (current setup proxies `/api` requests).