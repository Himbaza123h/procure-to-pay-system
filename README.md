# Procure-to-Pay System

A modern Purchase Request & Approval System with AI-powered document processing capabilities.

**Live Demo:** [https://app-url.com](https://app-url.com)  
**API Documentation:** [https://app-url.com/api/docs](https://app-url.com/api/docs)

---

## 🎯 Overview

This system streamlines the procurement process from purchase request to payment approval, featuring:

- **Multi-level approval workflow** - Requests flow through management levels with proper authorization
- **AI document processing** - Automatic extraction of vendor details, items, and prices from proformas and receipts
- **Smart PO generation** - Automatic purchase order creation upon final approval
- **Receipt validation** - AI-powered comparison of receipts against purchase orders to flag discrepancies
- **Role-based access** - Tailored interfaces for Staff, Approvers, and Finance teams

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Git

### Running Locally

```bash
# Clone the repository
git clone https://github.com/Himbaza123h/procure-to-pay-system
cd procure-to-pay-system

# Set up environment variables
cp .env.example .env
# Edit .env and add OPENAI_API_KEY

# Build and run
docker-compose up --build

# In a new terminal, run migrations
docker-compose exec backend python manage.py migrate

# Create a superuser (optional)
docker-compose exec backend python manage.py createsuperuser
```

**Access the application:**
- Frontend: http://localhost:3000
- Backend API: http://localhost:8000
- API Docs: http://localhost:8000/api/docs

---

## 📱 Features by Role

### Staff
- Create purchase requests with proforma uploads
- Track request status in real-time
- Submit receipts after purchase completion
- View approval history

### Approvers (Level 1 & 2)
- Review pending requests
- Approve or reject with comments
- View complete approval chain
- Access detailed request information

### Finance Team
- View all approved requests
- Access purchase orders and receipts
- Monitor procurement activities
- Generate reports

---

## 🛠️ Technology Stack

**Backend:**
- Django 4.2 + Django REST Framework
- PostgreSQL 15
- JWT Authentication
- OpenAI API for document processing

**Frontend:**
- React 18 with Hooks
- Tailwind CSS
- Axios for API calls

**DevOps:**
- Docker & Docker Compose
- AWS EC2 deployment

---

## 📚 API Endpoints

```
POST   /api/auth/login/                    - User login
POST   /api/requests/                      - Create request
GET    /api/requests/                      - List requests
GET    /api/requests/{id}/                 - Request details
PATCH  /api/requests/{id}/approve/         - Approve request
PATCH  /api/requests/{id}/reject/          - Reject request
PUT    /api/requests/{id}/                 - Update request
POST   /api/requests/{id}/submit-receipt/  - Submit receipt
```

Full API documentation available at `/api/docs/`

---

## 🏗️ System Architecture

### Approval Workflow
```
PENDING → Approver L1 → Approver L2 → APPROVED
    ↓           ↓             ↓
REJECTED    REJECTED      REJECTED
```

### Document Processing Pipeline
1. **Proforma Upload** → AI extracts vendor, items, prices
2. **Final Approval** → System generates Purchase Order automatically
3. **Receipt Upload** → AI validates against PO, flags discrepancies

---

## 🧪 Testing

```bash
# Backend tests
docker-compose exec backend python manage.py test

# Frontend tests
docker-compose exec frontend npm test

# Test coverage
docker-compose exec backend pytest --cov
```

---

## 🚢 Deployment

The application is deployed on AWS EC2 and accessible at:
**[Live URL]**

### Environment Variables Required
```
SECRET_KEY=django-secret
DATABASE_URL=postgresql://user:pass@host:5432/db
OPENAI_API_KEY=openai-key
ALLOWED_HOSTS=domain.com
```

---

## 📖 Documentation

- **Setup Guide:** See [SETUP.md](docs/SETUP.md)
- **API Reference:** See [API.md](docs/API.md)
- **Deployment Guide:** See [DEPLOYMENT.md](docs/DEPLOYMENT.md)
- **Architecture:** See [ARCHITECTURE.md](docs/ARCHITECTURE.md)

---

## 🔐 Security Features

- JWT-based authentication
- Role-based access control (RBAC)
- File upload validation and sanitization
- SQL injection prevention
- CSRF protection
- Rate limiting on API endpoints

---

## 📝 Project Structure

```
procure-to-pay-system/
├── backend/              # Django REST API
├── frontend/             # React application
├── docker-compose.yml    # Docker configuration
├── docs/                 # Detailed documentation
└── README.md            # This file
```

---

## 👤 Author

**Alain Honore**

For IST Africa - Full Stack Python/Django Developer Position

---

## 📄 License

This project was created for technical assessment purposes.