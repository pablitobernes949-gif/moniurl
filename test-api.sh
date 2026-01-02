#!/bin/bash

# Script para testar todos os endpoints da API
# Use: ./test-api.sh

BASE_URL="http://localhost:3000"
SERVICE_ID=""

echo "🧪 Service Monitor API Test Suite"
echo "=================================="
echo ""

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
NC='\033[0m' # No Color

test_endpoint() {
  local method=$1
  local endpoint=$2
  local data=$3
  local expected=$4

  echo -n "Testing: $method $endpoint ... "
  
  if [ -z "$data" ]; then
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint")
  else
    response=$(curl -s -w "\n%{http_code}" -X $method "$BASE_URL$endpoint" \
      -H "Content-Type: application/json" \
      -d "$data")
  fi
  
  http_code=$(echo "$response" | tail -n 1)
  body=$(echo "$response" | head -n -1)
  
  if [[ "$http_code" == "$expected" ]]; then
    echo -e "${GREEN}✓ OK ($http_code)${NC}"
    echo "$body"
  else
    echo -e "${RED}✗ FAILED (expected $expected, got $http_code)${NC}"
    echo "$body"
  fi
  echo ""
}

# 1. Health Check
echo "1️⃣  Health Check"
test_endpoint "GET" "/api/health" "" "200"

# 2. List Services (should be empty initially)
echo "2️⃣  List Services (empty)"
test_endpoint "GET" "/api/services" "" "200"

# 3. Create Service
echo "3️⃣  Create Service"
response=$(curl -s -X POST "$BASE_URL/api/services" \
  -H "Content-Type: application/json" \
  -d '{"name":"Google DNS","url":"https://8.8.8.8"}')
SERVICE_ID=$(echo "$response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Created service ID: $SERVICE_ID"
echo "$response"
echo ""

# 4. Get Service
echo "4️⃣  Get Service"
test_endpoint "GET" "/api/services/$SERVICE_ID" "" "200"

# 5. Update Service
echo "5️⃣  Update Service"
test_endpoint "PUT" "/api/services/$SERVICE_ID" \
  '{"name":"Updated Google DNS"}' "200"

# 6. Get Service History
echo "6️⃣  Get Service History"
test_endpoint "GET" "/api/services/$SERVICE_ID/history" "" "200"

# 7. Force Check
echo "7️⃣  Force Health Check"
test_endpoint "POST" "/api/services/$SERVICE_ID/check" "" "200"

# 8. List Services (now with one service)
echo "8️⃣  List Services (with service)"
test_endpoint "GET" "/api/services" "" "200"

# 9. Create Another Service
echo "9️⃣  Create Another Service"
response=$(curl -s -X POST "$BASE_URL/api/services" \
  -H "Content-Type: application/json" \
  -d '{"name":"GitHub","url":"https://github.com"}')
SERVICE_ID_2=$(echo "$response" | grep -o '"id":"[^"]*' | head -1 | cut -d'"' -f4)
echo "Created service ID: $SERVICE_ID_2"
echo ""

# 10. List Services (now with two services)
echo "🔟 List Services (with two services)"
test_endpoint "GET" "/api/services" "" "200"

# 11. Delete Service
echo "1️⃣1️⃣  Delete Service"
test_endpoint "DELETE" "/api/services/$SERVICE_ID" "" "200"

# 12. Get Deleted Service (should fail)
echo "1️⃣2️⃣  Get Deleted Service (should fail)"
test_endpoint "GET" "/api/services/$SERVICE_ID" "" "404"

# 13. List Services (back to one)
echo "1️⃣3️⃣  List Services (back to one)"
test_endpoint "GET" "/api/services" "" "200"

echo ""
echo "=================================="
echo "✅ Test suite completed!"
echo ""
echo "💡 Tips:"
echo "  - Open browser at http://localhost:3000"
echo "  - Check .data/ folder for persisted data"
echo "  - Logs show in the terminal where pnpm dev runs"
