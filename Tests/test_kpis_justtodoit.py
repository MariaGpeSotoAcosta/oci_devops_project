import unittest
import os
import time
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.chrome.options import Options
from dotenv import load_dotenv

load_dotenv()

BASE_URL = os.getenv("BASE_URL", "http://localhost:3000")
HEADLESS = os.getenv("HEADLESS", "false").lower() == "true"
EMAIL    = os.getenv("EMAIL",    "tu_email@correo.com")
PASSWORD = os.getenv("PASSWORD", "tu_password")


class TestKPIsDashboard(unittest.TestCase):

    @classmethod
    def setUpClass(cls):
        options = Options()
        if HEADLESS:
            options.add_argument("--headless")
        options.add_argument("--window-size=1920,1080")
        cls.driver = webdriver.Chrome(options=options)
        cls.driver.implicitly_wait(10)
        cls.wait = WebDriverWait(cls.driver, 15)
        cls._login()

    @classmethod
    def _login(cls):
        cls.driver.get(BASE_URL + "/login")
        time.sleep(1)
        email_field = cls.wait.until(
            EC.presence_of_element_located(
                (By.CSS_SELECTOR, "input[type='email'], input[name='email'], #email")
            )
        )
        email_field.clear()
        email_field.send_keys(EMAIL)
        password_field = cls.driver.find_element(
            By.CSS_SELECTOR, "input[type='password'], input[name='password'], #password"
        )
        password_field.clear()
        password_field.send_keys(PASSWORD)
        cls.driver.find_element(By.CSS_SELECTOR, "button[type='submit']").click()
        time.sleep(2)

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
        DADO que el usuario inició sesión en JustToDoIt,
        CUANDO navega al Dashboard,
        ENTONCES las 4 tarjetas de métricas deben ser visibles:
        Total Tasks | In Progress | Hours | Active Sprints
        """
        print("\n▶ TC-KPI-01: Verificando tarjetas de métricas...")
        self._ir_al_dashboard()

        tarjetas_esperadas = ["Total Tasks", "In Progress", "Hours", "Active Sprints"]

        for label in tarjetas_esperadas:
            elemento = self.driver.find_elements(
                By.XPATH, f"//*[contains(text(),'{label}')]"
            )
            self.assertGreater(len(elemento), 0,
                f" No se encontró la tarjeta: '{label}'")
            self.assertTrue(elemento[0].is_displayed(),
                f" La tarjeta '{label}' no está visible.")
            print(f"     '{label}' visible")

    def test_02_valores_numericos_validos(self):
        """
        TC-KPI-02
        DADO que las tarjetas de métricas están visibles,
        CUANDO se leen sus valores numéricos,
        ENTONCES cada valor debe ser un número entero >= 0
        """
        print("\n▶ TC-KPI-02: Verificando valores numéricos...")
        self._ir_al_dashboard()

        todos = self.driver.find_elements(By.XPATH, "//*[text()]")
        valores = []
        for el in todos:
            texto = el.text.strip().replace("h", "").replace(",", "")
            if texto.isdigit():
                valores.append(int(texto))

        self.assertGreater(len(valores), 0,
            " No se encontró ningún valor numérico en el dashboard.")
        for v in valores:
            self.assertGreaterEqual(v, 0, f" Valor negativo: {v}")

        print(f"     Valores encontrados: {sorted(set(valores))}")

    def test_03_graficas_kpi_presentes(self):
        """
        TC-KPI-03
        DADO que el usuario está en el Dashboard,
        CUANDO carga la sección KPI Dashboard,
        ENTONCES deben estar presentes las 4 gráficas:
        Task Completion Velocity | Task Urgency Distribution |
        Worked Hours per Team Member | Task Distribution by Member
        """
        print("\n▶ TC-KPI-03: Verificando gráficas del KPI Dashboard...")
        self._ir_al_dashboard()

        seccion = self.driver.find_elements(
            By.XPATH, "//*[contains(text(),'KPI Dashboard')]")
        self.assertGreater(len(seccion), 0,
            " No se encontró la sección 'KPI Dashboard'.")

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
                f" No se encontró: '{titulo}'")
            print(f"     '{titulo}' presente")

        elementos_graficos = self.driver.find_elements(By.CSS_SELECTOR, "canvas, svg")
        self.assertGreaterEqual(len(elementos_graficos), 4,
            f" Se esperaban >= 4 gráficos, se encontraron: {len(elementos_graficos)}")
        print(f"     Elementos gráficos: {len(elementos_graficos)}")

    def test_04_filtro_rango_tiempo(self):
        """
        TC-KPI-04
        DADO que el usuario está en el KPI Dashboard,
        CUANDO interactúa con el filtro 'Last 8 weeks',
        ENTONCES la página debe permanecer en el dashboard
        y las gráficas deben seguir siendo visibles
        """
        print("\n▶ TC-KPI-04: Verificando filtro de rango de tiempo...")
        self._ir_al_dashboard()

        filtro = self.driver.find_elements(
            By.XPATH,
            "//*[contains(text(),'Last') and (contains(text(),'week') or contains(text(),'month'))]"
        )
        if not filtro:
            filtro = self.driver.find_elements(
                By.XPATH, "//*[contains(text(),'Time range')]")

        self.assertGreater(len(filtro), 0,
            " No se encontró el filtro de rango de tiempo.")

        self.driver.execute_script("arguments[0].click();", filtro[0])
        time.sleep(1.5)

        url = self.driver.current_url
        self.assertIn("dashboard", url.lower(),
            f" La URL cambió: {url}")

        graficos = self.driver.find_elements(By.CSS_SELECTOR, "canvas, svg")
        self.assertGreater(len(graficos), 0,
            " Las gráficas desaparecieron tras usar el filtro.")
        print(f"     Gráficas siguen presentes: {len(graficos)}")


if __name__ == "__main__":
    unittest.main(verbosity=2)