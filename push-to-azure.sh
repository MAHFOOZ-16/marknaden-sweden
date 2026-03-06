#!/bin/bash

# Configuration
RESOURCE_GROUP="Marketplace-Prod-RG"
ACR_NAME="marknadenswedenacr" # Must be globally unique, alphanumeric only
LOCATION="swedencentral"
FRONTEND_APP_NAME="marknaden-sweden"
BACKEND_APP_NAME="marknaden-sweden-api"

echo "🐳 Starting Container Build & Push to ACR..."

# 1. Create Azure Container Registry if it doesn't exist
echo "📦 Creating Azure Container Registry: $ACR_NAME..."
az acr create --resource-group $RESOURCE_GROUP --name $ACR_NAME --sku Basic --admin-enabled true

# 2. Get ACR Credentials
ACR_LOGIN_SERVER=$(az acr show --name $ACR_NAME --query loginServer --output tsv)
ACR_USERNAME=$(az acr credential show --name $ACR_NAME --query username --output tsv)
ACR_PASSWORD=$(az acr credential show --name $ACR_NAME --query passwords[0].value --output tsv)

echo "🔑 ACR Login Server: $ACR_LOGIN_SERVER"

# 3. Login to Docker
echo "🐳 Logging into Docker registry..."
echo $ACR_PASSWORD | docker login $ACR_LOGIN_SERVER --username $ACR_USERNAME --password-stdin

# 4. Build & Push Backend
echo "🔨 Building Backend Image (AMD64 for Azure)..."
BACKEND_IMG="$ACR_LOGIN_SERVER/marketplace-backend:latest"
docker build --platform linux/amd64 -t $BACKEND_IMG ./backend
docker push $BACKEND_IMG

# 5. Build & Push Frontend
echo "🔨 Building Frontend Image (AMD64 for Azure)..."
FRONTEND_IMG="$ACR_LOGIN_SERVER/marketplace-frontend:latest"
BACKEND_URL="https://$BACKEND_APP_NAME.azurewebsites.net/api/v1"
docker build --platform linux/amd64 \
  --build-arg NEXT_PUBLIC_API_URL="$BACKEND_URL" \
  -t "$FRONTEND_IMG" ./frontend
docker push "$FRONTEND_IMG"

# 6. Configure Web Apps to use the images
echo "🚀 Configuring Web Apps to use ACR images..."

# Backend config
az webapp config container set --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP \
  --container-image-name "$BACKEND_IMG" \
  --container-registry-url "https://$ACR_LOGIN_SERVER" \
  --container-registry-user "$ACR_USERNAME" \
  --container-registry-password "$ACR_PASSWORD"

# Frontend config
az webapp config container set --name $FRONTEND_APP_NAME --resource-group $RESOURCE_GROUP \
  --container-image-name "$FRONTEND_IMG" \
  --container-registry-url "https://$ACR_LOGIN_SERVER" \
  --container-registry-user "$ACR_USERNAME" \
  --container-registry-password "$ACR_PASSWORD"

echo "✅ Deployment Triggered! Azure is now pulling and starting your containers."
echo "🌐 Frontend: https://$FRONTEND_APP_NAME.azurewebsites.net"
echo "🌐 Backend API: https://$BACKEND_APP_NAME.azurewebsites.net/docs"
