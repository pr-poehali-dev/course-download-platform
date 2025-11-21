#!/bin/bash

echo "=========================================="
echo "🧪 БЫСТРЫЙ ТЕСТ СИСТЕМЫ ПОКУПОК"
echo "=========================================="
echo ""

USER_ID=1000023
WORK_ID=4371
PURCHASE_URL="https://functions.poehali.dev/7f219e70-5e9f-44d1-9011-e6246d4274a9"
USER_DATA_URL="https://functions.poehali.dev/c605690e-3ba9-40eb-86cd-4c470a0b3387"

echo "1️⃣ Получаю начальный баланс test_buyer..."
BALANCE_BEFORE=$(curl -s "${USER_DATA_URL}?userId=${USER_ID}" | grep -o '"balance":[0-9]*' | grep -o '[0-9]*')
echo "   Баланс: ${BALANCE_BEFORE} баллов"
echo ""

echo "2️⃣ Покупаю работу #${WORK_ID} за 600 баллов..."
PURCHASE_RESULT=$(curl -s -X POST "${PURCHASE_URL}" \
  -H "Content-Type: application/json" \
  -d "{\"userId\": ${USER_ID}, \"workId\": ${WORK_ID}, \"price\": 600}")
echo "   Результат: ${PURCHASE_RESULT}"
echo ""

echo "3️⃣ Жду 2 секунды для обработки транзакции..."
sleep 2
echo ""

echo "4️⃣ Получаю финальный баланс..."
BALANCE_AFTER=$(curl -s "${USER_DATA_URL}?userId=${USER_ID}" | grep -o '"balance":[0-9]*' | grep -o '[0-9]*')
echo "   Баланс: ${BALANCE_AFTER} баллов"
echo ""

echo "=========================================="
echo "📊 РЕЗУЛЬТАТ"
echo "=========================================="
echo "Баланс до:    ${BALANCE_BEFORE} баллов"
echo "Баланс после: ${BALANCE_AFTER} баллов"

DEDUCTED=$((BALANCE_BEFORE - BALANCE_AFTER))
echo "Списано:      ${DEDUCTED} баллов"
echo ""

if [ ${DEDUCTED} -eq 0 ]; then
    echo "❌ ПРОБЛЕМА: Баллы НЕ СПИСАЛИСЬ!"
    exit 1
elif [ ${DEDUCTED} -eq 600 ]; then
    echo "✅ УСПЕХ: Баллы списались корректно!"
    exit 0
else
    echo "⚠️  Списано неожиданное количество: ${DEDUCTED} (ожидалось 600)"
    exit 1
fi
