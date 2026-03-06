#!/bin/bash

# Configuration
RESOURCE_GROUP="Marketplace-Prod-RG"
LOCATION="swedencentral"
FRONTEND_APP_NAME="marknaden-sweden"
BACKEND_APP_NAME="marknaden-sweden-api"
PLAN_NAME="Marketplace-App-Plan"

echo "🚀 Starting Azure Deployment for $FRONTEND_APP_NAME..."

# 1. Login to Azure (if not already logged in)
az account show > /dev/null 2>&1
if [ $? -ne 0 ]; then
    echo "🔑 Please login to Azure..."
    az login
fi

# 2. Create Resource Group
echo "📦 Creating Resource Group: $RESOURCE_GROUP..."
az group create --name $RESOURCE_GROUP --location $LOCATION

# 3. Create App Service Plan (F1 Free tier as requested, but B1 is recommended for production)
echo "🏗️ Creating App Service Plan..."
az appservice plan create --name $PLAN_NAME --resource-group $RESOURCE_GROUP --sku F1 --is-linux

# 4. Create Backend Web App (Container)
echo "🖥️ Creating Backend Web App: $BACKEND_APP_NAME..."
az webapp create --resource-group $RESOURCE_GROUP --plan $PLAN_NAME --name $BACKEND_APP_NAME --deployment-container-image-name "nginx" # Placeholder

# 5. Create Frontend Web App (Container)
echo "🖥️ Creating Frontend Web App: $FRONTEND_APP_NAME..."
az webapp create --resource-group $RESOURCE_GROUP --plan $PLAN_NAME --name $FRONTEND_APP_NAME --deployment-container-image-name "nginx" # Placeholder

echo "✅ Azure Infrastructure placeholders created!"
echo "⚠️  Next step: We will configure GitHub Actions or Local Container Push to deploy your code."
