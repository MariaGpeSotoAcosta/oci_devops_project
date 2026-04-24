import os
from dotenv import load_dotenv
from pages.telegram.Functions import Telegram
from pages.telegram.Functions import Messages
from pages.telegram.Functions import Selectors

import time


load_dotenv()


def test_telegram_response(driver):
    telegram_url = os.getenv("TELEGRAM_URL")
    tg = Telegram(driver)

    try:
        tg.open(telegram_url)

        # Enable to sign in into app
        # time.sleep(100)

        # tg.send_msg(Messages.START_COMMAND)
        # tg.assert_last_response(Messages.START_RESPONSE)

        tg.send_msg(Messages.CREATE_TASK)
        tg.assert_last_response(Messages.WRITE_TASK_NAME)

        tg.send_msg(Messages.TASK_NAME)
        tg.assert_last_response(Messages.WRITE_TASK_HOURS)

        tg.send_msg(Messages.TASK_HOURS)
        tg.assert_last_response(Messages.TASK_CREATED)

    finally:
        print("\n🧹 Cleaning up conversation...")
        tg.close_conversation()