#!/bin/bash

# Colors for output
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m' # No Color

echo -e "${GREEN}JobSync Docker Setup for RaspberryOS${NC}\n"

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    echo -e "${RED}Docker is not installed. Please install Docker first.${NC}"
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null && ! docker compose version &> /dev/null; then
    echo -e "${RED}Docker Compose is not installed. Please install Docker Compose first.${NC}"
    exit 1
fi

# Create necessary directories
echo -e "${YELLOW}Creating necessary directories...${NC}"
mkdir -p data uploads

# Check if .env file exists
if [ ! -f .env ]; then
    echo -e "${YELLOW}No .env file found. Creating from template...${NC}"
    cat > .env << EOF
DATABASE_URL="file:/app/data/dev.db"

# Change your username and password here
USER_EMAIL=admin@example.com
USER_PASSWORD=password123

# Generate auth secret with: openssl rand -base64 32
AUTH_SECRET=$(openssl rand -base64 32)
NEXTAUTH_URL='http://localhost:3000'
AUTH_TRUST_HOST=http://localhost:3000

OPENAI_API_KEY=your-api-key
OLLAMA_BASE_URL=http://ollama:11434
EOF
    echo -e "${GREEN}Created .env file with generated AUTH_SECRET${NC}"
else
    echo -e "${GREEN}.env file already exists${NC}"
fi

# Build the Docker image
echo -e "\n${YELLOW}Building Docker image (this may take a while on Raspberry Pi)...${NC}"
docker-compose build

if [ $? -eq 0 ]; then
    echo -e "\n${GREEN}Build successful!${NC}"
    
    # Start the containers
    echo -e "\n${YELLOW}Starting containers...${NC}"
    docker-compose up -d
    
    if [ $? -eq 0 ]; then
        echo -e "\n${GREEN}Containers started successfully!${NC}"
        
        # Wait for the database to be ready
        echo -e "\n${YELLOW}Waiting for application to start...${NC}"
        sleep 10
        
        # Run database migrations and seed
        echo -e "\n${YELLOW}Setting up database...${NC}"
        docker-compose exec jobsync sh -c "cd /app && pnpm prisma db push && pnpm prisma db seed"
        
        echo -e "\n${GREEN}Setup complete!${NC}"
        echo -e "\n${GREEN}JobSync is now running at: http://localhost:3000${NC}"
        echo -e "${GREEN}Ollama is running at: http://localhost:11434${NC}"
        echo -e "\nTo view logs: ${YELLOW}docker-compose logs -f${NC}"
        echo -e "To stop: ${YELLOW}docker-compose down${NC}"
        echo -e "To restart: ${YELLOW}docker-compose restart${NC}"
    else
        echo -e "${RED}Failed to start containers${NC}"
        exit 1
    fi
else
    echo -e "${RED}Build failed${NC}"
    exit 1
fi
