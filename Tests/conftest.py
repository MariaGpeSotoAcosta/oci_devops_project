import pytest
import os
import tempfile
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()

    # ── Use your real Chrome profile so Telegram session is preserved ──
    # This avoids having to log in to Telegram every time.
    # Replace JUPZT with your actual Windows username if different.
    real_profile = os.path.join(
        os.environ.get("LOCALAPPDATA", ""),
        "Google", "Chrome", "User Data"
    )

    if os.path.exists(real_profile):
        options.add_argument(f"--user-data-dir={real_profile}")
        options.add_argument("--profile-directory=Default")
    else:
        # Fallback to temp profile
        profile_dir = os.path.join(tempfile.gettempdir(), "chrome-test-profile")
        options.add_argument(f"--user-data-dir={profile_dir}")

    options.add_argument("--start-maximized")
    options.add_argument("--no-sandbox")
    options.add_argument("--disable-dev-shm-usage")
    # Disable extensions to avoid conflicts
    options.add_argument("--disable-extensions")

    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    yield driver
    driver.quit()