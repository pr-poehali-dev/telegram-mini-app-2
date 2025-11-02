# Настройка Telegram Stars Integration

## Шаг 1: Получите токен бота

1. Откройте [@BotFather](https://t.me/BotFather) в Telegram
2. Создайте нового бота командой `/newbot` или используйте существующего
3. Скопируйте токен бота (формат: `1234567890:ABCdefGHIjklMNOpqrsTUVwxyz`)
4. Добавьте токен в секреты проекта как `TELEGRAM_BOT_TOKEN`

## Шаг 2: Настройте webhook

Выполните следующий HTTP запрос (замените `YOUR_BOT_TOKEN` на ваш токен):

```bash
curl -X POST "https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{
    "url": "https://functions.poehali.dev/24bfa3ab-9225-4aca-9bce-4e16cbbe0d99",
    "allowed_updates": ["message", "pre_checkout_query"]
  }'
```

Или откройте в браузере:
```
https://api.telegram.org/botYOUR_BOT_TOKEN/setWebhook?url=https://functions.poehali.dev/24bfa3ab-9225-4aca-9bce-4e16cbbe0d99&allowed_updates=["message","pre_checkout_query"]
```

## Шаг 3: Проверьте webhook

Проверьте, что webhook установлен:
```bash
curl "https://api.telegram.org/botYOUR_BOT_TOKEN/getWebhookInfo"
```

Должен вернуться ответ с вашим URL.

## Готово!

Теперь при оплате через Telegram Stars:
1. Пользователь нажимает "Купить" в приложении
2. Открывается платёжная форма Telegram
3. После оплаты Telegram отправляет webhook на наш сервер
4. Сервер начисляет монеты пользователю в базе данных
5. Баланс обновляется в приложении

## Endpoints

- **Create Invoice**: `https://functions.poehali.dev/d6505aff-9b33-449b-82ac-35dfe9826a70`
- **Webhook Handler**: `https://functions.poehali.dev/24bfa3ab-9225-4aca-9bce-4e16cbbe0d99`
