import { Page, BrowserContext, Browser } from '@playwright/test';
import Logs from '../config/logConfig'

export class Utilidades {

  /**
   * Funcion para esperar por un tiempo especifico de segundos
   * 
   * @param segundos - Numero entero para especificar la cantidad de segundos a esperar
  */
  static async esperar(segundos: number) {
    await new Promise(resolve => setTimeout(resolve, segundos * 1000));
  }

  /**
   * Cierra la ventana actual.
   * 
   * @param page - Instancia de la página de Playwright.
   */
  static async cerrarVentana(page: Page) {
    const context = await page.context();
    await context.close();
    await page.close();
    await Utilidades.esperar(3);
  }

  /**
   * Cierra el navegador completo.
   * 
   * @param page - Instancia de la página de Playwright.
   * @param browser - Instancia del navegador de Playwright.
   */
  static async cerrarNavegador(browser: Browser) {
    await browser.close();
    await Utilidades.esperar(3);
  }

  static async agregarLineaAlLog(linea: string, color?: boolean) {
    if (typeof color==='boolean') {
      await Logs.agregarLineaAlLog(linea, color);
    } else {
      await Logs.agregarLineaAlLog(linea, '');
    }
  }

}
