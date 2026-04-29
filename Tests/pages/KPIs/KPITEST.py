import unittest
import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.service import Service
from webdriver_manager.chrome import ChromeDriverManager
from dotenv import load_dotenv
import tempfile

load_dotenv()

BASE_URL = os.getenv("APP_URL", "http://localhost:3000")
EMAIL    = os.getenv("VALID_EMAIL")
PASSWORD = os.getenv("VALID_PASSWORD")


class TestKPIsDashboard(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        options = webdriver.ChromeOptions()

        # Mismo perfil temporal que conftest.py para evitar conflictos
        profile_dir = os.path.join(tempfile.gettempdir(), "chrome-selenium-profile")
        os.makedirs(profile_dir, exist_ok=True)
        options.add_argument(f"--user-data-dir={profile_dir}")
        options.add_argument("--profile-directory=Default")
        options.add_argument("--start-maximized")
        options.add_argument("--no-sandbox")
        options.add_argument("--disable-dev-shm-usage")
        options.add_argument("--disable-extensions")

        cls.driver = webdriver.Chrome(
            service=Service(ChromeDriverManager().install()),
            options=options
        )
        cls.wait = WebDriverWait(cls.driver, 15)
        cls._login()

    @classmethod
    def _login(cls):
        cls.driver.get(BASE_URL + "/login")
        time.sleep(2)
        email_field = cls.wait.until(
            EC.presence_of_element_located((By.ID, "email"))
        )
        email_field.clear()
        email_field.send_keys(EMAIL)
        cls.driver.find_element(By.ID, "password").clear()
        cls.driver.find_element(By.ID, "password").send_keys(PASSWORD)
        cls.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(3)

    @classmethod
    def tearDownClass(cls):
        cls.driver.quit()

    def _ir_al_dashboard(self):
        self.driver.get(BASE_URL + "/dashboard")
        self.wait.until(
            EC.presence_of_element_located(
                (By.XPATH, "//*[contains(text(),'Dashboard') or contains(text(),'KPI')]")
            )
        )
        time.sleep(2)

    def test_01_tarjetas_metricas_visibles(self):
        """
        TC-KPI-01
        DADO que el usuario inicio sesion en JustToDoIt,
        CUANDO navega al Dashboard,
        ENTONCES las 4 tarjetas de metricas deben ser visibles:
        Total Tasks | In Progress | Hours | Active Sprints
        """
        print("\n TC-KPI-01: Verificando tarjetas de metricas...")
        self._ir_al_dashboard()

        tarjetas_esperadas = ["Total Tasks", "In Progress", "Hours", "Active Sprints"]

        for label in tarjetas_esperadas:
            elemento = self.driver.find_elements(
                By.XPATH, f"//*[contains(text(),'{label}')]"
            )
            self.assertGreater(len(elemento), 0,
                f"No se encontro la tarjeta: '{label}'")
            self.assertTrue(elemento[0].is_displayed(),
                f"La tarjeta '{label}' no esta visible.")
            print(f"  '{label}' visible")

    def test_02_valores_numericos_validos(self):
        """
        TC-KPI-02
        DADO que las tarjetas de metricas estan visibles,
        CUANDO se leen sus valores numericos,
        ENTONCES cada valor debe ser un numero entero >= 0
        """
        print("\n TC-KPI-02: Verificando valores numericos...")
        self._ir_al_dashboard()

        todos = self.driver.find_elements(By.XPATH, "//*[text()]")
        valores = []
        for el in todos:
            texto = el.text.strip().replace("h", "").replace(",", "")
            if texto.isdigit():
                valores.append(int(texto))

        self.assertGreater(len(valores), 0,
            "No se encontro ningun valor numerico en el dashboard.")
        for v in valores:
            self.assertGreaterEqual(v, 0, f"Valor negativo: {v}")

        print(f"  Valores encontrados: {sorted(set(valores))}")

    def test_03_graficas_kpi_presentes(self):
        """
        TC-KPI-03
        DADO que el usuario esta en el Dashboard,
        CUANDO carga la seccion KPI Dashboard,
        ENTONCES deben estar presentes las 4 graficas
        """
        print("\n TC-KPI-03: Verificando graficas del KPI Dashboard...")
        self._ir_al_dashboard()

        seccion = self.driver.find_elements(
            By.XPATH, "//*[contains(text(),'KPI Dashboard')]")
        self.assertGreater(len(seccion), 0,
            "No se encontro la seccion 'KPI Dashboard'.")

        graficas = [
            "Task Completion Velocity",
            "Task Urgency Distribution",
            "Worked Hours per Team Member",
            "Task Distribution by Member",
        ]
        for titulo in graficas:
            elementos = self.driver.find_elements(
                By.XPATH, f"//*[contains(text(),'{titulo}')]")
            self.assertGreater(len(elementos), 0,
                f"No se encontro: '{titulo}'")
            print(f"  '{titulo}' presente")

        elementos_graficos = self.driver.find_elements(By.CSS_SELECTOR, "canvas, svg")
        self.assertGreaterEqual(len(elementos_graficos), 4,
            f"Se esperaban >= 4 graficos, se encontraron: {len(elementos_graficos)}")
        print(f"  Elementos graficos: {len(elementos_graficos)}")

    def test_04_filtro_rango_tiempo(self):
        """
        TC-KPI-04
        DADO que el usuario esta en el KPI Dashboard,
        CUANDO interactua con el filtro de rango de tiempo,
        ENTONCES la pagina debe permanecer en el dashboard
        y las graficas deben seguir siendo visibles
        """
        print("\n TC-KPI-04: Verificando filtro de rango de tiempo...")
        self._ir_al_dashboard()

        filtro = self.driver.find_elements(
            By.XPATH,
            "//*[contains(text(),'Last') and (contains(text(),'week') or contains(text(),'month'))]"
        )
        if not filtro:
            filtro = self.driver.find_elements(
                By.XPATH, "//*[contains(text(),'Time range')]")

        self.assertGreater(len(filtro), 0,
            "No se encontro el filtro de rango de tiempo.")

        self.driver.execute_script("arguments[0].click();", filtro[0])
        time.sleep(1.5)

        url = self.driver.current_url
        self.assertIn("dashboard", url.lower(),
            f"La URL cambio: {url}")

        graficos = self.driver.find_elements(By.CSS_SELECTOR, "canvas, svg")
        self.assertGreater(len(graficos), 0,
            "Las graficas desaparecieron tras usar el filtro.")
        print(f"  Graficas siguen presentes: {len(graficos)}")


if __name__ == "__main__":
    unittest.main(verbosity=2)