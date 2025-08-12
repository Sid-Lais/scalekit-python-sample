# Production Deployment Guide

## Uvicorn + Gunicorn (Recommended)

1. Install production dependencies:
   ```bash
   pip install gunicorn uvicorn
   ```
2. Run with Gunicorn and Uvicorn workers:
   ```bash
   gunicorn app.main:app -k uvicorn.workers.UvicornWorker --bind 0.0.0.0:8000 --workers 4
   ```

## Environment Variables
- Use `.env` file for secrets and config.

## Database
- Use PostgreSQL or MySQL for production.
- Update `DATABASE_URL` in `.env` accordingly.

## Reverse Proxy
- Use Nginx or Caddy as a reverse proxy for SSL and static files.

## Scalekit
- Set your `SCALEKIT_API_KEY` in `.env`.

## Static Files
- Serve static files (if any) via Nginx or a CDN.

## Example Dockerfile
```
FROM python:3.11-slim
WORKDIR /app
COPY . .
RUN pip install --no-cache-dir -r requirements.txt
CMD ["gunicorn", "app.main:app", "-k", "uvicorn.workers.UvicornWorker", "--bind", "0.0.0.0:8000", "--workers", "4"]
```
