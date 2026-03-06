#!/bin/bash

# Configuration
RESOURCE_GROUP="Marketplace-Prod-RG"
BACKEND_APP_NAME="marknaden-sweden-api"
FRONTEND_APP_NAME="marknaden-sweden"

echo "⚙️  Configuring Azure App Service Environment Variables..."

# Backend Settings
echo "🖥️  Setting Backend Config..."
az webapp config appsettings set --name $BACKEND_APP_NAME --resource-group $RESOURCE_GROUP --settings \
  DATABASE_URL="postgresql+asyncpg://neondb_owner:npg_XCRc4PT9bGgS@ep-ancient-leaf-a9c9s3bf-pooler.gwc.azure.neon.tech/neondb" \
  DATABASE_SSL="true" \
  AUTH0_DOMAIN="dev-nc7m1b5u53tsisac.eu.auth0.com" \
  AUTH0_API_AUDIENCE="https://api.marketplace.production" \
  AUTH0_CLIENT_ID="d0m5MHpwfzUTInrabA9aDGYhEkWLAHSL" \
  AUTH0_CLIENT_SECRET="3ztxa0ry6pk_-s6SPvai_4KVv-YYnSN6g1_uIt7HXcV_3sMOJDe09gfOrZBCXm5G" \
  CORS_ORIGINS="https://$FRONTEND_APP_NAME.azurewebsites.net,http://localhost:3000" \
  DEBUG="false"

# Frontend Settings (Optional if baked in, but good for reference)
echo "🖥️  Setting Frontend Config..."
az webapp config appsettings set --name $FRONTEND_APP_NAME --resource-group $RESOURCE_GROUP --settings \
  NEXT_PUBLIC_API_URL="https://$BACKEND_APP_NAME.azurewebsites.net/api/v1" \
  AUTH0_SECRET="65e32921a88890b947bef6525440556d74e7de8121d82dc1e6b7bbfe95c40a20" \
  AUTH0_BASE_URL="https://$FRONTEND_APP_NAME.azurewebsites.net" \
  AUTH0_ISSUER_BASE_URL="https://dev-nc7m1b5u53tsisac.eu.auth0.com" \
  AUTH0_DOMAIN="dev-nc7m1b5u53tsisac.eu.auth0.com" \
  AUTH0_CLIENT_ID="d0m5MHpwfzUTInrabA9aDGYhEkWLAHSL" \
  AUTH0_CLIENT_SECRET="3ztxa0ry6pk_-s6SPvai_4KVv-YYnSN6g1_uIt7HXcV_3sMOJDe09gfOrZBCXm5G" \
  AUTH0_AUDIENCE="https://api.marketplace.production"

echo "✅ Configuration Set! The apps will now restart with the new settings."
