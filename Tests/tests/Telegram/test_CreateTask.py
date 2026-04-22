import os
from dotenv import load_dotenv
from pages.telegram.page import Telegram
from pages.telegram.page import Messages
from pages.telegram.page import Selectors

import time


load_dotenv()


def test_telegram_response(driver):
    telegram_url = os.getenv("TELEGRAM_URL")
    tg = Telegram(driver)
    tg.open(telegram_url)

    # Start a conversation
    tg.send_msg(Messages.START_COMMAND)
    tg.assert_last_response(Messages.START_RESPONSE)


    # Create new task
    tg.send_msg(Messages.CREATE_TASK)
    tg.assert_last_response(Messages.WRITE_TASK_NAME)


    # Write task name
    tg.send_msg(Messages.TASK_NAME)
    tg.assert_last_response(Messages.WRITE_TASK_HOURS)


    # Write task hours
    tg.send_msg(Messages.TASK_HOURS)
    tg.assert_last_response(Messages.TASK_CREATED)