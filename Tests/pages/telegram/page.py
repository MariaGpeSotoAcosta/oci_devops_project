# Functions used in Telegram tests

from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC

from utils.wait_utils import *
from pages.base_page import BasePage

from . import Selectors
from . import Messages


class Telegram(BasePage):
    def __init__(self, driver):
        self.driver = driver

    def send_msg(self, message):
        wait_for_element(self.driver, Selectors.CHAT_INPUT).send_keys(message)
        wait_for_clickable(self.driver, Selectors.SEND_BUTTON).click()
        wait_seconds(1)

    def get_last_response(self):
        messages_elements = WebDriverWait(self.driver, 10).until(EC.presence_of_all_elements_located(Selectors.BOT_MESSAGE))[-1].text
        return messages_elements

    def assert_last_response(self, expected_text):
        response = self.get_last_response()
        print(f"\n<Response: " + response + ">")
        print(f"\n<Expected: " + expected_text + ">")
        assert expected_text in response