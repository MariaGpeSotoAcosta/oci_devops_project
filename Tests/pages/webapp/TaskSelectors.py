from selenium.webdriver.common.by import By

# Boton "+ New Task" del Board (el ultimo, no el del TopBar)
NEW_TASK_BUTTON = (By.XPATH, "(//button[normalize-space()='New Task'])[last()]")

# Campos del TaskDialog
TASK_TITLE       = (By.ID, "td-title")
TASK_DESCRIPTION = (By.ID, "td-desc")
TASK_HOURS       = (By.ID, "td-hours")

# Select trigger proyecto
PROJECT_TRIGGER  = (By.ID, "td-project")

# Boton submit
SUBMIT_BUTTON    = (By.CSS_SELECTOR, "button[type='submit']")

# Titulo del dialog — para verificar que sigue abierto
DIALOG_TITLE     = (By.XPATH, "//*[contains(normalize-space(),'Create New Task')]")


def task_card_by_title(title):
    return (By.XPATH, f"//*[contains(@class,'card') or contains(@class,'Card')]//*[normalize-space()='{title}']")