import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()

    options.binary_location = "/usr/bin/brave"
    options.add_argument("--user-data-dir=/tmp/brave-telegram-profile")
    options.add_argument("--start-maximized")

    # 👇 IMPORTANT: match driver version to Brave
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager(driver_version="145").install()),
        options=options
    )

    yield driver
    driver.quit()