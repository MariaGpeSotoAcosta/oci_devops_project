# Functions used in Telegram tests

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

from utils.wait_utils import *
from pages.base_page import BasePage

from . import Selectors
from . import Messages


class Telegram(BasePage):
    def __init__(self, driver):
        self.driver = driver

    def send_msg(self, message):
        input_box = wait_for_element(self.driver, Selectors.CHAT_INPUT)
        input_box.send_keys(message)
        input_box.send_keys(Keys.ENTER)
        wait_seconds(3)


    def get_last_response(self):
        elements = WebDriverWait(self.driver, 10).until(
            EC.presence_of_all_elements_located(Selectors.BOT_MESSAGE)
        )
        return elements[-1].text


    def assert_last_response(self, expected_text, timeout=10, interval=1):
        end_time = time.time() + timeout

        while time.time() < end_time:
            try:
                response = self.get_last_response()

                print(f"\n<Response: {response}>")
                print(f"<Expected: {expected_text}>")

                if expected_text in response:
                    print("✅ Match found")
                    return

            except Exception as e:
                print(f"⚠️ Retry due to error: {e}")

            time.sleep(interval)

        raise AssertionError(f"❌ Expected '{expected_text}' not found within {timeout}s")


    def close_conversation(self):
        input_box = wait_for_element(self.driver, Selectors.CHAT_INPUT)
        input_box.send_keys(Messages.CANCEL)
        input_box.send_keys(Keys.ENTER)