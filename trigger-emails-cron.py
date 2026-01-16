"""
Скрипт для запуска триггерных писем (можно вызывать через cron)
Запуск: python trigger-emails-cron.py [type]
type: payment, favorites, inactive, all
"""

import sys
import os
import psycopg2
import resend
from datetime import datetime, timedelta

# === НАСТРОЙКИ (заполнить перед использованием) ===
DATABASE_URL = "postgresql://..."  # DSN базы данных
RESEND_API_KEY = "re_..."  # API ключ Resend
MAIL_FROM = "Tech Forma <noreply@techforma.pro>"

# === ШАБЛОНЫ ПИСЕМ ===

def get_payment_reminder_html(username: str) -> str:
    return f"""
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 26px;">⏰ {username}, готов скачать первую работу?</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Пополни баланс и начни экономить время на учёбе</p>
    </div>
    <div style="padding: 40px 30px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6;">Привет! Мы заметили, что ты зарегистрировался на Tech Forma, но ещё не пополнил баланс.</p>
      <p style="color: #333; margin-top: 20px;"><strong>Почему стоит попробовать прямо сейчас?</strong></p>
      <ul style="color: #555; line-height: 1.8;">
        <li>💰 <strong>Работы от 200₽</strong> — в 25 раз дешевле заказа новой</li>
        <li>⚡ <strong>Скачаешь за 2 минуты</strong> — не нужно ждать неделями</li>
        <li>📐 <strong>500+ готовых работ</strong> — чертежи, 3D-модели, курсовые</li>
      </ul>
      <div style="background: linear-gradient(135deg, #ffd89b 0%, #19547b 100%); border-radius: 8px; padding: 25px; margin: 30px 0; text-align: center;">
        <h3 style="color: white; margin: 0 0 10px;">🎁 Специальное предложение!</h3>
        <p style="color: rgba(255,255,255,0.95); margin: 0; font-size: 16px;">Пополни от <strong>500₽</strong> → получи бонус <strong>+20%</strong> + промокод на <strong>100 баллов</strong></p>
      </div>
      <div style="text-align: center; margin: 35px 0;">
        <a href="https://techforma.pro/buy-points" style="display: inline-block; background: linear-gradient(135deg, #f093fb 0%, #f5576c 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">💳 Пополнить баланс</a>
      </div>
      <p style="color: #666; font-size: 14px; border-top: 1px solid #e0e0e0; padding-top: 20px;">Вопросы? <a href="mailto:tech.forma@yandex.ru">tech.forma@yandex.ru</a> | <a href="https://vk.com/club234274626">ВК группа</a></p>
    </div>
  </div>
</body>
    """

def get_favorites_reminder_html(username: str, works: list) -> str:
    works_html = ""
    for w in works[:3]:
        works_html += f'<div style="background: #f8f9fa; border-radius: 8px; padding: 15px; margin-bottom: 15px;"><h4 style="color: #333; margin: 0 0 8px; font-size: 16px;">{w["title"]}</h4><div style="color: #666; margin-bottom: 10px;"><span style="color: #f5576c; font-weight: 600;">{w["price"]} баллов</span></div><a href="https://techforma.pro/work/{w["id"]}" style="display: inline-block; background: #f5576c; color: white; text-decoration: none; padding: 8px 20px; border-radius: 6px; font-size: 14px;">Купить →</a></div>'
    
    return f"""
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 26px;">💝 {username}, твоё избранное ждёт!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">Работы, которые ты сохранил, могут скоро разобрать</p>
    </div>
    <div style="padding: 40px 30px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6;">Привет! Ты добавил работы в избранное, но так и не скачал. Не упусти момент!</p>
      <h3 style="color: #333; font-size: 18px; margin: 25px 0 15px;">📌 Твои избранные работы:</h3>
      {works_html}
      <div style="text-align: center; margin: 35px 0;">
        <a href="https://techforma.pro/profile?tab=favorites" style="display: inline-block; background: linear-gradient(135deg, #fa709a 0%, #fee140 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">❤️ Открыть избранное</a>
      </div>
      <p style="color: #666; font-size: 14px; border-top: 1px solid #e0e0e0; padding-top: 20px;">Вопросы? <a href="mailto:tech.forma@yandex.ru">tech.forma@yandex.ru</a> | <a href="https://vk.com/club234274626">ВК группа</a></p>
    </div>
  </div>
</body>
    """

def get_reactivation_html(username: str) -> str:
    return f"""
<body style="font-family: Arial, sans-serif; background: #f5f5f5; padding: 40px 20px;">
  <div style="max-width: 600px; margin: 0 auto; background: white; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 12px rgba(0,0,0,0.1);">
    <div style="background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); padding: 40px; text-align: center;">
      <h1 style="color: white; margin: 0; font-size: 26px;">👋 {username}, скучаем по тебе!</h1>
      <p style="color: rgba(255,255,255,0.9); margin: 10px 0 0;">За 2 недели на Tech Forma появилось много нового</p>
    </div>
    <div style="padding: 40px 30px;">
      <p style="color: #333; font-size: 16px; line-height: 1.6;">Давно не виделись! Мы добавили новые работы и улучшили платформу.</p>
      <ul style="color: #555; line-height: 1.8;">
        <li>🆕 <strong>50+ новых работ</strong> — чертежи, 3D-модели, курсовые</li>
        <li>🎓 <strong>Защитный пакет</strong> — доклад, презентация, шпаргалки</li>
        <li>⚡ <strong>Быстрый поиск</strong> — находи работы за секунды</li>
      </ul>
      <div style="text-align: center; margin: 35px 0;">
        <a href="https://techforma.pro/catalog" style="display: inline-block; background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%); color: white; text-decoration: none; padding: 16px 40px; border-radius: 8px; font-size: 16px; font-weight: 600;">🚀 Посмотреть новинки</a>
      </div>
      <p style="color: #666; font-size: 14px; border-top: 1px solid #e0e0e0; padding-top: 20px;">Вопросы? <a href="mailto:tech.forma@yandex.ru">tech.forma@yandex.ru</a> | <a href="https://vk.com/club234274626">ВК группа</a></p>
    </div>
  </div>
</body>
    """

# === ОСНОВНЫЕ ФУНКЦИИ ===

def send_email(to_email: str, subject: str, html: str) -> bool:
    try:
        resend.api_key = RESEND_API_KEY
        resend.Emails.send({
            "from": MAIL_FROM,
            "to": to_email,
            "subject": subject,
            "html": html
        })
        print(f"✅ Sent to {to_email}: {subject}")
        return True
    except Exception as e:
        print(f"⚠️ Failed {to_email}: {e}")
        return False

def send_payment_reminders(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT u.id, u.username, u.email
        FROM t_p63326274_course_download_plat.users u
        WHERE u.created_at BETWEEN NOW() - INTERVAL '49 hours' AND NOW() - INTERVAL '47 hours'
          AND NOT EXISTS (SELECT 1 FROM t_p63326274_course_download_plat.transactions t WHERE t.user_id = u.id AND t.type = 'deposit')
          AND u.email IS NOT NULL
    """)
    users = cur.fetchall()
    sent = 0
    for user_id, username, email in users:
        if send_email(email, f"⏰ {username}, готов скачать первую работу?", get_payment_reminder_html(username)):
            sent += 1
    cur.close()
    print(f"📧 Payment reminders: {sent}/{len(users)}")

def send_favorites_reminders(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT u.id, u.username, u.email,
               json_agg(json_build_object('id', w.id, 'title', w.title, 'price', w.price_points)) as works
        FROM t_p63326274_course_download_plat.users u
        JOIN t_p63326274_course_download_plat.favorites f ON u.id = f.user_id
        JOIN t_p63326274_course_download_plat.works w ON f.work_id = w.id
        WHERE f.added_at < NOW() - INTERVAL '3 days'
          AND NOT EXISTS (SELECT 1 FROM t_p63326274_course_download_plat.user_purchases up WHERE up.user_id = u.id AND up.work_id = w.id)
          AND u.email IS NOT NULL
        GROUP BY u.id, u.username, u.email
        HAVING COUNT(*) >= 1
    """)
    users = cur.fetchall()
    sent = 0
    for user_id, username, email, works in users:
        if send_email(email, f"💝 {username}, твоё избранное ждёт!", get_favorites_reminder_html(username, works)):
            sent += 1
    cur.close()
    print(f"💝 Favorites reminders: {sent}/{len(users)}")

def send_reactivation_emails(conn):
    cur = conn.cursor()
    cur.execute("""
        SELECT u.id, u.username, u.email
        FROM t_p63326274_course_download_plat.users u
        WHERE COALESCE(u.last_login_at, u.created_at) < NOW() - INTERVAL '14 days'
          AND u.created_at < NOW() - INTERVAL '15 days'
          AND u.email IS NOT NULL
    """)
    users = cur.fetchall()
    sent = 0
    for user_id, username, email in users:
        if send_email(email, f"👋 {username}, скучаем по тебе!", get_reactivation_html(username)):
            sent += 1
    cur.close()
    print(f"👋 Reactivation emails: {sent}/{len(users)}")

# === MAIN ===

if __name__ == "__main__":
    trigger_type = sys.argv[1] if len(sys.argv) > 1 else "all"
    
    if not DATABASE_URL or "..." in DATABASE_URL:
        print("❌ Настрой DATABASE_URL в скрипте!")
        sys.exit(1)
    
    if not RESEND_API_KEY or "..." in RESEND_API_KEY:
        print("❌ Настрой RESEND_API_KEY в скрипте!")
        sys.exit(1)
    
    print(f"🚀 Запуск триггерных писем: {trigger_type}")
    conn = psycopg2.connect(DATABASE_URL)
    
    try:
        if trigger_type in ["all", "payment"]:
            send_payment_reminders(conn)
        if trigger_type in ["all", "favorites"]:
            send_favorites_reminders(conn)
        if trigger_type in ["all", "inactive"]:
            send_reactivation_emails(conn)
        print("✅ Готово!")
    finally:
        conn.close()
