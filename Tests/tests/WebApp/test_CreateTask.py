import os
import pytest
from dotenv import load_dotenv

from pages.login.LoginFunctions import Login
from pages.webapp.TaskFunctions import TaskPage

load_dotenv()

APP_URL        = os.getenv("APP_URL", "http://localhost:3000")
VALID_EMAIL    = os.getenv("VALID_EMAIL")
VALID_PASSWORD = os.getenv("VALID_PASSWORD")
LOGIN_URL      = APP_URL + "/login"
BOARD_URL      = APP_URL + "/board"

TASK_TITLE       = "Tarea Selenium Test"
TASK_DESCRIPTION = "Descripcion creada por prueba automatizada"
TASK_HOURS       = "3"
PROJECT_NAME     = "PROJECTO1"  # texto parcial — matchea "PROJECTO1 (1919)"


def _login(driver):
    login = Login(driver)
    login.open(LOGIN_URL)
    login.login(VALID_EMAIL, VALID_PASSWORD)
    assert login.is_logged_in(), "No se pudo hacer login antes del test."


def test_create_task_basic(driver):
    """TC-WEB-01: Crear tarea con titulo, descripcion y proyecto."""
    _login(driver)
    task = TaskPage(driver)
    task.open(BOARD_URL)
    task.click_new_task()
    task.fill_title(TASK_TITLE)
    task.fill_description(TASK_DESCRIPTION)
    task.select_project(PROJECT_NAME)
    task.submit()

    assert task.is_task_visible(TASK_TITLE), (
        f"La tarea '{TASK_TITLE}' no aparecio en el board."
    )
    print(f"Tarea '{TASK_TITLE}' creada y visible en el board.")


def test_create_task_with_hours(driver):
    """TC-WEB-02: Crear tarea con horas estimadas."""
    _login(driver)
    title = "Tarea con horas Selenium"
    task = TaskPage(driver)
    task.open(BOARD_URL)
    task.click_new_task()
    task.fill_title(title)
    task.fill_hours(TASK_HOURS)
    task.select_project(PROJECT_NAME)
    task.submit()

    assert task.is_task_visible(title), (
        f"La tarea '{title}' no aparecio en el board."
    )
    print(f"Tarea '{title}' con {TASK_HOURS}h creada correctamente.")


def test_create_task_empty_title(driver):
    """TC-WEB-03: No debe permitir crear una tarea sin titulo."""
    _login(driver)
    task = TaskPage(driver)
    task.open(BOARD_URL)
    task.click_new_task()
    # No llenamos titulo — solo proyecto y submit
    task.select_project(PROJECT_NAME)
    task.submit()

    # El dialog debe seguir abierto — la tarea no se creo
    assert task.dialog_still_open(), (
        "Se creo una tarea sin titulo, no deberia ser posible."
    )
    print("El formulario bloqueo correctamente la creacion sin titulo.")