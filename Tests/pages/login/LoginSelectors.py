# Selectors for the Login page
from selenium.webdriver.common.by import By

LOGIN_EMAIL       = (By.ID, "email")
LOGIN_PASSWORD    = (By.ID, "password")
LOGIN_BUTTON      = (By.CSS_SELECTOR, "button[type='submit']")
LOGIN_TOAST_ERROR = (By.CSS_SELECTOR, "[data-sonner-toast][data-type='error']")
DASHBOARD_INDICATOR = (By.CSS_SELECTOR, "nav, aside, [class*='sidebar']")