# Selectors for Telegram Web (web.telegram.org/k/)
from selenium.webdriver.common.by import By

CHAT_INPUT   = (By.CSS_SELECTOR,
    "div.input-message-input[contenteditable='true'], "
    "#editable-message-text, "
    "div[contenteditable='true']"
)
BOT_MESSAGE  = (By.CSS_SELECTOR,
    ".bubble:not(.is-out) .translatable-message, "
    ".bubble:not(.is-out) .message, "
    ".message-content.text.peer-color-6"
)
KEYBOARD_BUTTON = (By.CSS_SELECTOR,
    ".reply-keyboard button, "
    ".keyboard-button, "
    "button.btn-primary.reply-keyboard-button"
)