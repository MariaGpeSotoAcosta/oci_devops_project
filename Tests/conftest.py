import pytest
from selenium import webdriver
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager


@pytest.fixture
def driver():
    options = webdriver.ChromeOptions()
    
    # Remove Brave-specific binary location
    # Chrome will be auto-detected from standard install locations
    
    # Use Chrome-specific profile directory
    options.add_argument("--user-data-dir=/tmp/chrome-telegram-profile")
    options.add_argument("--start-maximized")

    # Let webdriver-manager auto-detect and install the correct ChromeDriver version
    driver = webdriver.Chrome(
        service=Service(ChromeDriverManager().install()),
        options=options
    )

    yield driver
    driver.quit()