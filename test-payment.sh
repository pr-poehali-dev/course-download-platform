#!/bin/bash

echo "========================================="
echo "ТЕСТ 1: Создание платежа"
echo "========================================="

curl -X POST https://functions.poehali.dev/4b9b82b8-34d8-43e7-a9ac-c3cb0bd67fb1 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "init_payment",
    "user_id": 1000015,
    "package_id": "100",
    "success_url": "https://techforma.pro/payment/success",
    "fail_url": "https://techforma.pro/payment/failed"
  }' | jq '.'

echo -e "\n========================================="
echo "ТЕСТ 2: Создание платежа (пакет 50)"
echo "========================================="

curl -X POST https://functions.poehali.dev/4b9b82b8-34d8-43e7-a9ac-c3cb0bd67fb1 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "init_payment",
    "user_id": 1000015,
    "package_id": "50",
    "success_url": "https://techforma.pro/payment/success",
    "fail_url": "https://techforma.pro/payment/failed"
  }' | jq '.'

echo -e "\n========================================="
echo "ТЕСТ 3: Создание платежа (пакет 200)"
echo "========================================="

curl -X POST https://functions.poehali.dev/4b9b82b8-34d8-43e7-a9ac-c3cb0bd67fb1 \
  -H "Content-Type: application/json" \
  -d '{
    "action": "init_payment",
    "user_id": 1000015,
    "package_id": "200",
    "success_url": "https://techforma.pro/payment/success",
    "fail_url": "https://techforma.pro/payment/failed"
  }' | jq '.'

echo -e "\n========================================="
echo "ТЕСТ 4-10: Повторные тесты пакета 100"
echo "========================================="

for i in {4..10}
do
  echo -e "\nТЕСТ $i:"
  curl -s -X POST https://functions.poehali.dev/4b9b82b8-34d8-43e7-a9ac-c3cb0bd67fb1 \
    -H "Content-Type: application/json" \
    -d '{
      "action": "init_payment",
      "user_id": 1000015,
      "package_id": "100",
      "success_url": "https://techforma.pro/payment/success",
      "fail_url": "https://techforma.pro/payment/failed"
    }' | jq -c '{success: (.payment_url != null), error: .error, error_code: .error_code}'
  sleep 1
done

echo -e "\n========================================="
echo "ВСЕ 10 ТЕСТОВ ЗАВЕРШЕНЫ"
echo "Проверь логи backend/payment для деталей"
echo "========================================="
