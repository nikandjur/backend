#!/bin/bash

# Базовый URL API
API_URL="http://localhost:5000"

# Тестовые данные
TEST_EMAIL="test@example.com"
TEST_PASSWORD="test123456789"
POST_ID="cmb463zrd0001ppyc1lefg6fx"
COMMENT_ID="cmb4656pg0003ppyc1mvcabsf"
USER_ID="cmb2q55o20000ppbcjs7pfy54"

echo "🚀 Тест: Авторизация"
SESSION_COOKIE=$(curl -s -S -X POST "$API_URL/api/auth/login" \
  -H "Content-Type: application/json" \
  -d "{\"email\":\"$TEST_EMAIL\",\"password\":\"$TEST_PASSWORD\"}" \
  -i | grep -i 'set-cookie' | awk '{print $2}' | tr -d '\n')

if [ -z "$SESSION_COOKIE" ]; then
  echo "❌ Ошибка авторизации: кука не получена"
  exit 1
else
  echo "✅ Авторизация успешна"
fi

echo ""

# --- Функция для проверки запроса и вывода скорости ---
function test_endpoint() {
  local name="$1"
  local url="$2"
  
  echo "📡 Запрос: $name"
  curl -s -S -X GET "$url" \
    -H "Cookie: $SESSION_COOKIE" \
    -o /dev/null \
    -w "CurrentSpeed: %{speed_download} B/s\n"
  echo "-----------------------------"
}

# --- Выполняем тесты ---
test_endpoint "GET /api/auth/me" "$API_URL/api/auth/me"
test_endpoint "GET /api/posts/$POST_ID" "$API_URL/api/posts/$POST_ID"
test_endpoint "GET /api/posts/$POST_ID/comments" "$API_URL/api/posts/$POST_ID/comments"
test_endpoint "GET /api/posts/search?q=первый" "$API_URL/api/posts/search?q=первый"
test_endpoint "GET /api/posts/top" "$API_URL/api/posts/top"
test_endpoint "GET /api/user/$USER_ID" "$API_URL/api/user/$USER_ID"

echo ""
echo "✅ Все тесты выполнены"