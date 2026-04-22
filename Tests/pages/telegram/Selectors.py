# Selectors to be used in the Telegram page

from selenium.webdriver.common.by import By

CHAT_INPUT = (By.ID, "editable-message-text")
SEND_BUTTON = (By.CSS_SELECTOR, ".Button.send")
BOT_MESSAGE = (By.CSS_SELECTOR, ".message-content.text.peer-color-6")
USER_MESSAGE = (By.CSS_SELECTOR, ".message-content.text.has-solid-background")