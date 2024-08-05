import { BeforeAll, AfterAll, BeforeStep, Before, After, setWorldConstructor, World, IWorldOptions, setDefaultTimeout, Status } from '@cucumber/cucumber';
import { ConsoleMessage, Browser, LaunchOptions, Page, chromium, firefox, webkit } from '@playwright/test';
import { rm } from 'fs/promises';
import fs from 'fs';
import path from 'path';
import { Context } from 'vm';
import { Utilidades } from '../utilidades/playwright-utilidades';
import Logs from './logConfig'

/**
 * Configuracion del timeout por defecto de todos los steps
 * */
setDefaultTimeout(15 * 1000);

/** 
 * Implementacion de un interfaz llamado CustomWorld 
 * 
 * Este interfaz extiende de la clase World y permita gestionar el navegador, la pagina y el contexto.
*/
interface CustomWorld extends World {
  browser?: Browser;
  page?: Page;
  context?: Context;
}

/**
 * Implementacion de un intertaz llamado TestContext. 
 * 
 * Este interfaz permite compartir el dataJson que contine los datos de prueba con los steps.
*/
interface TestContext {
  dataJson: { [key: string]: any };
  [key: string]: any;
}

/**
 * Clase personalizada de Cucumber.
 * 
 * Esta clase permite para compartir el context del navegador con todos los steps y gestionar el navegador y las paginas.
 * 
 * La clase es llamada CustomWorldImpl que extiende de world e implementa los interfaces CustomWorld y TestContext.
 * 
 * */
class CustomWorldImpl extends World implements CustomWorld, TestContext {
  browser!: Browser;
  page!: Page;
  context!: Context;
  dataJson: { [key: string]: any } = {};

  /**
   * Creacion del constructor de la clase CustomWorldImpl
   * 
   * @param options - Optiones para la incializacion de la clase CustomWoel.
  */
  constructor(options: IWorldOptions) {
    super(options);
  }

  obtenerDataJson(key: string): any {
    if (this.dataJson[key]) {
      return this.dataJson[key];
    } else {
      Utilidades.agregarLineaAlLog(`${key.toUpperCase()} no existe en el archivo de data`, false);
    }
  }

}

/**
 * Configurar la clase constructor para que sea utilizada por cucumber
 * */
setWorldConstructor(CustomWorldImpl);

let BrowserGlobal: Browser;
/**
 * Configuracion del navegador que se iniciaria
 */
const options: LaunchOptions = {
  headless: process.env.HEADLESS === 'true',
  logger: {
    isEnabled: (severity: "verbose" | "info" | "warning" | "error") => true,
    log: async (name, severity, message, args, hints) => {
      let valor: string[] = typeof message === 'string' ? message.split(' ') : [];
      if (valor[2] != 'started') {
        const log = `${severity} message: ${message}`
        await Utilidades.agregarLineaAlLog(log);
      }
    }
  }
}

/**
 * Hook que se ejecutara 1 vez antes de todos los escenarios
 */
BeforeAll(async function () {
  BrowserGlobal = await getBrowser();
});

/**
 * Hook que se ejecutara antes de cada escenario
 * 
 * @param scenario - Es el escenario actual que se esta ejecutando
 */
Before(async function (scenario) {

  await mostrarFeatureScenario(scenario);
  /** Lee el feature completo que se esta ejecutando y selecciona el escenario actual durante esta ejecucion */
  const scenarios = await scenario.gherkinDocument.feature?.children.find(item => item.scenario?.id === scenario.pickle.astNodeIds[0])?.scenario;

  if (scenarios) {
    /** Busca los examples que contienen la data de prueba del escenario actual que se esta ejecutando */
    const example = await scenarios.examples.flatMap(example => example.tableBody).find(tb => tb.id === scenario.pickle.astNodeIds[1])?.cells

    if (example) {
      /** Crea una lista con los valores dentro del example para esta ejecucion */
      const listaJson = await example.map(item => item.value);

      /** Obtiene el nombre del archivo donde esta la data */
      const jsonFile = await listaJson[0];
      const filePath = await path.resolve(__dirname, '../data/', jsonFile);

      /** Si el archivo existe cargara la data del archivo en el dataJson que se compartira con los steps */
      if (fs.existsSync(filePath)) {
        const log = await Logs.formantCabecera('Se encontró archivo Json con los datos para las pruebas');
        await Utilidades.agregarLineaAlLog(log, true);
        const fileContent = await fs.readFileSync(filePath, 'utf-8');
        const objetoJson = await listaJson[1];
        this.dataJson = await JSON.parse(fileContent)[objetoJson];

        if (this.dataJson && Object.keys(this.dataJson).length > 0) {
          const log = await Logs.formantCabecera('Se cargó archivo Json con los datos para las pruebas');
          await Utilidades.agregarLineaAlLog(log, true);
        } else {
          const log = await Logs.formantCabecera('No se cargó data del Json a pesar de que el archivo existe, verifique el segundo key en el feature y en su archivo de data.');
          throw new Error(log);
        }
      }else{
        const log = '==>No se encontró archivo Json con los datos para las pruebas, la prueba se ejecutará con los datos en la tabla de example<==';
        await Logs.formantCabecera('_');
        await Utilidades.agregarLineaAlLog(await log.toUpperCase());
        await Logs.formantCabecera('_');
      }
    }

    /** Configura el navegador, el contexto y la pagina */
    this.browser = await BrowserGlobal;
    this.context = await this.browser.newContext();
    this.page = await this.browser.newPage();

    /** Activar los logs del navegador */
    await this.page.on('console', (msg: ConsoleMessage) => {
      if (msg.type() === 'error') {
        const log = `${msg.type().toUpperCase()}: ${msg.text()} =>${msg.args()}`;
        Utilidades.agregarLineaAlLog(log);
      }
    });
  };
});

/** 
 * Hook que se ejecuta antes de cada escenario 
 * 
 * @param step - el paso actual que se esta ejecutando
 * */
BeforeStep(async function (step) {

  const log = `Se esta ejecutando el step: ${await step.pickleStep.text}`;
  await Utilidades.agregarLineaAlLog(log, true);
});


/**
 * Hook que se ejecuta despues de cada escenario
 * 
 * @param scenario - Escenario actual que se esta ejecutando
 */
After(async function (scenario) {
  await Utilidades.esperar(2);
  const nombreScreenShot = await scenario.pickle.name.replace(/ /g, "_");
  const rutaImagen = `src/test-result/screenshots/${await nombreScreenShot}-${await Date.now()}.png`;

  /** Agrega exception del error que se genero al intentar ejecutar escenario de prueba */
  if (await scenario.result?.status === Status.FAILED) {
    const exception = await scenario.result?.exception
    if (exception?.type === 'Error') {
      const errorMessage = `Error: ${await exception.message}`;
      Utilidades.agregarLineaAlLog(await errorMessage, false);
    }
  }

  /** Toma captura de pantalla */
  const img = await this.page.screenshot({ path: rutaImagen, type: "png" });

  /** Adjunta captura de pantalla al reporte */
  await this.attach(img, 'image/png');

  /** Borra capturas de pantalla */
  await rm(rutaImagen, { recursive: true });
  await this.page.close();
  await this.context.close();
  await Utilidades.esperar(2);
});

/**
 * Hook que se ejecuta despues de todos los escenarios
 */
AfterAll(async function () {
  if (await BrowserGlobal) {
    await BrowserGlobal.close();
  }
});

/**
 * Funcion que retorna el tipo de navegador que se ejecutará desde la variable de ambiente
 * 
 * @returns - Una promesa que resuelve la instancia del navegador que se iniciará
 */
async function getBrowser() {
  const browser = await process.env.BROWSER;
  if (await browser == 'edge') {
    options.channel = 'msedge';
  }

  switch (await browser) {
    case 'firefox':
      return await firefox.launch(await options);
    case 'webkit':
      return await webkit.launch(await options);
    case 'edge':
      return await chromium.launch(await options);
    default:
      return await chromium.launch(await options);
  }
};

/**
 * Funcion para mostrar el nombre del feature y del escenario
 * @param scenario - Escenario actual que se esta ejecutando
 */
async function mostrarFeatureScenario(scenario: any) {

  const log = `FEATURE: ${await scenario.gherkinDocument.feature?.name}`;
  const nombreEscenario = `SCENARIO: ${await scenario.pickle.name}`;
  await Utilidades.agregarLineaAlLog(await Logs.formantCabecera(await log.toUpperCase()), true);
  await Utilidades.agregarLineaAlLog(await nombreEscenario.toUpperCase(), true);

}



export { CustomWorldImpl }; 
