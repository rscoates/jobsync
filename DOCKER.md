# JobSync Docker Deployment

This directory contains Docker configuration for running JobSync on RaspberryOS (ARM64).

## Prerequisites

- Docker and Docker Compose installed on your Raspberry Pi
- At least 2GB RAM (4GB recommended)
- 10GB free disk space

## Quick Start

### Option 1: Using the Setup Script

```bash
chmod +x docker-setup.sh
./docker-setup.sh
```

### Option 2: Manual Setup

1. **Create necessary directories:**
```bash
mkdir -p data uploads
```

2. **Configure environment variables:**
```bash
# Copy and edit .env file
cp .env.example .env
# Generate a secure AUTH_SECRET
openssl rand -base64 32
# Update .env with your settings
```

3. **Build and start containers:**
```bash
docker-compose build
docker-compose up -d
```

4. **Initialize the database:**
```bash
# Run migrations
docker-compose exec jobsync pnpm prisma db push

# Seed initial data
docker-compose exec jobsync pnpm prisma db seed
```

5. **Access the application:**
- JobSync: http://localhost:3000
- Ollama: http://localhost:11434

## Environment Variables

Key environment variables in `.env`:

- `DATABASE_URL`: SQLite database location (default: `file:/app/data/dev.db`)
- `AUTH_SECRET`: Secret key for authentication (generate with `openssl rand -base64 32`)
- `NEXTAUTH_URL`: Public URL of your application
- `USER_EMAIL`: Admin user email
- `USER_PASSWORD`: Admin user password
- `OPENAI_API_KEY`: OpenAI API key (if using OpenAI)
- `OLLAMA_BASE_URL`: Ollama service URL (default: `http://ollama:11434`)

## Docker Commands

### Start services
```bash
docker-compose up -d
```

### Stop services
```bash
docker-compose down
```

### View logs
```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f jobsync
docker-compose logs -f ollama
```

### Restart services
```bash
docker-compose restart
```

### Rebuild after code changes
```bash
docker-compose build --no-cache
docker-compose up -d
```

### Access container shell
```bash
docker-compose exec jobsync sh
```

## Database Management

### Backup database
```bash
docker-compose exec jobsync cp /app/data/dev.db /app/data/backup-$(date +%Y%m%d).db
# Copy from container to host
docker cp jobsync-app:/app/data/backup-$(date +%Y%m%d).db ./data/
```

### Restore database
```bash
docker cp ./data/backup-YYYYMMDD.db jobsync-app:/app/data/dev.db
docker-compose restart jobsync
```

### Access Prisma Studio
```bash
docker-compose exec jobsync pnpm prisma studio
```

## Ollama Setup

The docker-compose includes an Ollama service for local AI models.

### Pull a model
```bash
docker-compose exec ollama ollama pull llama2
```

### List installed models
```bash
docker-compose exec ollama ollama list
```

## Volumes

Data is persisted in the following locations:

- `./data`: SQLite database files
- `./uploads`: User uploaded files
- `ollama-data`: Ollama models and data (Docker volume)

## Troubleshooting

### Container won't start
```bash
# Check logs
docker-compose logs jobsync

# Check if ports are available
netstat -tuln | grep 3000
netstat -tuln | grep 11434
```

### Database errors
```bash
# Reset database (WARNING: deletes all data)
docker-compose down
rm -rf data/dev.db*
docker-compose up -d
docker-compose exec jobsync pnpm prisma db push
docker-compose exec jobsync pnpm prisma db seed
```

### Rebuild completely
```bash
docker-compose down -v
docker-compose build --no-cache
docker-compose up -d
```

### Check container health
```bash
docker-compose ps
docker inspect jobsync-app
```

## Performance Tips for Raspberry Pi

1. **Reduce memory usage:**
   - Close unnecessary applications
   - Use `docker-compose down` when not in use

2. **Optimize build time:**
   - Use Docker BuildKit: `export DOCKER_BUILDKIT=1`
   - Keep `node_modules` cache between builds

3. **Monitor resources:**
   ```bash
   docker stats
   ```

4. **Limit container resources (optional):**
   Edit `docker-compose.yml` and add:
   ```yaml
   services:
     jobsync:
       deploy:
         resources:
           limits:
             memory: 1G
   ```

## Updating the Application

```bash
# Pull latest code
git pull

# Rebuild and restart
docker-compose build
docker-compose up -d

# Run any new migrations
docker-compose exec jobsync pnpm prisma migrate deploy
```

## Security Notes

1. **Change default credentials** in `.env` before deploying
2. **Generate a strong AUTH_SECRET**: `openssl rand -base64 32`
3. **Use HTTPS** in production with a reverse proxy (nginx/traefik)
4. **Regular backups** of the database
5. **Keep Docker and images updated**

## Default Credentials

- Email: `admin@example.com`
- Password: `password123`

**⚠️ Change these immediately after first login!**
