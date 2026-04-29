import pytest
import os
import tempfile
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()

    # ── Siempre usar perfil temporal ──────────────────────────────────
    # El perfil real de Chrome no puede usarse si Chrome ya está abierto
    # (el OS bloquea el acceso al directorio de perfil).
    # Usamos un directorio temporal dedicado para los tests.
    profile_dir = os.path.join(tempfile.gettempdir(), "chrome-selenium-profile")
    os.makedirs(profile_dir, exist_ok=True)
    options.add_argument(f"--user-data-dir={profile_dir}")
    options.add_argument("--profile-directory=Default")

    options.add_argument("--start-maximized")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    options.add_argument("--disable-extensions")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    yield driver

    driver.quit()