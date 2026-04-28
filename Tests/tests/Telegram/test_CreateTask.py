import os
import pytest
from dotenv import load_dotenv

from pages.telegram.Functions import Telegram
from pages.telegram import Messages

load_dotenv()


def test_create_task(driver):
    """TC-TG-01: Flujo completo /NewTask con selector de proyecto."""
    tg = Telegram(driver)
    try:
        tg.open(os.getenv("TELEGRAM_URL"))

        tg.send_msg(Messages.CREATE_TASK)
        tg.assert_last_response(Messages.WRITE_TASK_NAME)

        tg.send_msg(Messages.TASK_NAME)
        tg.assert_last_response(Messages.SELECT_PROJECT)

        tg.click_keyboard_button(Messages.PROJECT_NAME)
        tg.assert_last_response(Messages.WRITE_TASK_HOURS)

        tg.send_msg(Messages.TASK_HOURS)
        tg.assert_last_response(Messages.TASK_CREATED)

    finally:
        tg.close_conversation()


def test_start_command(driver):
    """TC-TG-02: /JTDI regresa mensaje de bienvenida."""
    tg = Telegram(driver)
    try:
        tg.open(os.getenv("TELEGRAM_URL"))
        tg.send_msg(Messages.START_COMMAND)
        tg.assert_last_response(Messages.START_RESPONSE)
    finally:
        tg.close_conversation()


def test_cancel_resets_flow(driver):
    """TC-TG-03: /Cancel durante un flujo resetea la conversación."""
    tg = Telegram(driver)
    try:
        tg.open(os.getenv("TELEGRAM_URL"))
        tg.send_msg(Messages.CREATE_TASK)
        tg.assert_last_response(Messages.WRITE_TASK_NAME)
        tg.send_msg(Messages.CANCEL)
        tg.assert_last_response(Messages.CANCEL_RESPONSE)
    finally:
        tg.close_conversation()


def test_my_tasks(driver):
    """TC-TG-04: /MyTasks lista las tareas asignadas."""
    tg = Telegram(driver)
    try:
        tg.open(os.getenv("TELEGRAM_URL"))
        tg.send_msg(Messages.MY_TASKS)
        tg.assert_last_response(Messages.MY_TASKS_RESPONSE)
    finally:
        tg.close_conversation()


def test_modify_task_menu(driver):
    """TC-TG-05: /ModifyTask muestra el submenú de modificación."""
    tg = Telegram(driver)
    try:
        tg.open(os.getenv("TELEGRAM_URL"))
        tg.send_msg(Messages.MOD_TASK)
        tg.assert_last_response(Messages.MOD_TASK_MENU)
    finally:
        tg.close_conversation()