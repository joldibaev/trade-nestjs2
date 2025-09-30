# Запуск Docker в продакшн режиме

## Быстрый запуск

```bash
# Запуск в фоновом режиме
docker-compose up -d

# Проверка статуса контейнеров
docker-compose ps

# Остановка
docker-compose down
```

## Что запускается

- **PostgreSQL** - база данных на порту 5431 (внешний), 5432 (внутренний)
- **NestJS приложение** - API сервер на порту 3000

## Логи

```bash
# Просмотр логов всех сервисов
docker-compose logs

# Логи конкретного сервиса
docker-compose logs nestjs-app
docker-compose logs postgres
```

## Развертывание на сервере

### Первоначальная настройка

```bash
# Клонируем репозиторий
git clone <repository-url>
cd trade2-nestjs

# Запускаем проект
docker-compose up -d
```

### Обновление проекта

```bash
# Получаем последние изменения
git pull origin main

# Останавливаем контейнеры
docker-compose down

# Пересобираем образ (обязательно!)
docker-compose build --no-cache

# Запускаем обновленную версию
docker-compose up -d

# Проверяем статус
docker-compose ps
```

### Автоматическое обновление (опционально)

```bash
# Создайте скрипт update.sh
#!/bin/bash
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
echo "Обновление завершено!"

# Сделайте скрипт исполняемым
chmod +x update.sh

# Запустите обновление
./update.sh
```

## Очистка старых образов

Docker сохраняет все старые образы и занимает место на диске. Периодически нужно очищать:

```bash
# Показать использование места Docker
docker system df

# Удалить неиспользуемые образы, контейнеры, сети
docker system prune

# Удалить ВСЕ неиспользуемые данные (включая volumes!)
docker system prune -a --volumes

# Удалить только старые образы (старше 24 часов)
docker image prune -a --filter "until=24h"
```

### Автоматическая очистка в скрипте обновления

```bash
# Обновленный update.sh
#!/bin/bash
git pull origin main
docker-compose down
docker-compose build --no-cache
docker-compose up -d
# Очищаем старые образы
docker image prune -f
echo "Обновление завершено!"
```

## Важные замечания

- **ВСЕГДА используйте `--no-cache`** при пересборке на сервере
- **Регулярно очищайте старые образы** чтобы не забить диск
- При изменении структуры БД сначала сгенерируйте миграцию, затем проверьте её
- Миграции применяются автоматически при запуске контейнера
