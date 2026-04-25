# Functions used in Telegram tests

import time
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

from utils.wait_utils import wait_seconds
from pages.base_page import BasePage
from . import Messages

_INPUT_SELECTORS = [
    ("css", "div.input-message-input[contenteditable='true']"),
    ("id",  "editable-message-text"),
    ("css", "div[contenteditable='true']"),
]
_BOT_MSG_SELECTORS = [
    ("css", ".bubble:not(.is-out) .translatable-message"),
    ("css", ".bubble:not(.is-out) .message"),
    ("css", ".message-content.text.peer-color-6"),
]
_KEYBOARD_SELECTORS = [
    ("css", ".reply-keyboard button"),
    ("css", ".keyboard-button"),
    ("css", "button.btn-primary.reply-keyboard-button"),
]

from selenium.webdriver.common.by import By
_BY = {"css": By.CSS_SELECTOR, "id": By.ID}


class Telegram(BasePage):
    def __init__(self, driver):
        self.driver = driver

    def open(self, url):
        self.driver.get(url)
        wait_seconds(5)

    def _find_input(self, timeout=10):
        end = time.time() + timeout
        while time.time() < end:
            for by, sel in _INPUT_SELECTORS:
                try:
                    el = WebDriverWait(self.driver, 2).until(
                        EC.element_to_be_clickable((_BY[by], sel))
                    )
                    return el
                except Exception:
                    continue
            time.sleep(0.5)
        raise Exception("❌ Could not find Telegram chat input.")

    def _find_bot_messages(self, timeout=10):
        for by, sel in _BOT_MSG_SELECTORS:
            try:
                els = WebDriverWait(self.driver, timeout).until(
                    EC.presence_of_all_elements_located((_BY[by], sel))
                )
                if els:
                    return els
            except Exception:
                continue
        raise Exception("❌ Could not find bot messages.")

    def send_msg(self, message):
        box = self._find_input()
        box.click()
        wait_seconds(0.5)
        try:
            box.send_keys(message)
        except Exception:
            self.driver.execute_script(
                "arguments[0].textContent = arguments[1];", box, message
            )
        wait_seconds(0.5)
        box.send_keys(Keys.ENTER)
        wait_seconds(3)

    def get_last_response(self):
        return self._find_bot_messages()[-1].text

    def assert_last_response(self, expected_text, timeout=20, interval=1):
        end_time = time.time() + timeout
        while time.time() < end_time:
            try:
                response = self.get_last_response()
                print(f"\n<Response: {response[:80]}>")
                print(f"<Expected: {expected_text}>")
                if expected_text in response:
                    print("✅ Match found")
                    return
            except Exception as e:
                print(f"⚠️ Retry: {e}")
            time.sleep(interval)
        raise AssertionError(f"❌ '{expected_text}' not found within {timeout}s")

    def click_keyboard_button(self, label):
        wait_seconds(2)
        for by, sel in _KEYBOARD_SELECTORS:
            try:
                btns = self.driver.find_elements(_BY[by], sel)
                for btn in btns:
                    if label.strip() in btn.text.strip():
                        btn.click()
                        wait_seconds(2)
                        return
            except Exception:
                continue
        print(f"⚠️ Button '{label}' not found — sending as text.")
        self.send_msg(label)

    def close_conversation(self):
        try:
            box = self._find_input(timeout=5)
            box.send_keys(Messages.CANCEL)
            box.send_keys(Keys.ENTER)
        except Exception:
            pass