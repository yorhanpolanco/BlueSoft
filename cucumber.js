require('dotenv').config();
const formatoHora = require('dayjs');
const logs = require('./src/config/logConfig')

let featureName;
let browserName;
let tags;
let paralelo;

/**
 * Funcion para extraer los argumentos de ejecucion.
 */
async function extraerArgumentos() {
  const args = process.argv.slice(2);

  await args.forEach(arg => {
    if (arg.startsWith('feature=')) {
      featureName = arg.split('=')[1];
      process.env.FEATURE = featureName;
    } else if (arg.startsWith('browser=')) {
      browserName = arg.split('=')[1];
      process.env.BROWSER = browserName;
    } else if (arg.startsWith('tags=')) {
      tags = arg.split('=')[1];
      process.env.TAGS = tags;
    } else if (arg.startsWith('paralelo=')) {
      paralelo = arg.split('=')[1];
      process.env.PARALELO = paralelo;
    }
  });
}

/** Variable de la ruta de del archivo de las variables de ambiente */

function obtenerRutaLogs(){
  fecha = formatoHora().format('DD-MM-YYYY_HHmmss');
  const rutaLogs = `logs/${browserName}-logs-${fecha}.txt` || `logs/logs-${fecha}.txt`;
  process.env.RUTA_LOGS = rutaLogs;
  return rutaLogs;
  }

extraerArgumentos();
logs.crearArchivoLogs(`${obtenerRutaLogs()}`);
logs.imprimirCabecera();



const featureFileName = featureName || '**';
const nombreReporte = featureName ? `${featureName}_${browserName}_${fecha}` :tags ? `${tags}_${browserName}_${fecha}` : `cucumber-report_${browserName}_${fecha}`;
const tagsCucumber = tags ? `--tags ${tags}` : '';
const isParalelo=paralelo?  `--parallel ${paralelo}` : '';

const common = [
  `src/test/features/${featureFileName}.feature`,     // Ruta de los archivos .feature
  '--require-module ts-node/register',    // Soporte para TypeScript
  `--require src/test/steps/**.steps.ts`,    // Ruta de los archivos de implementación de pasos
  '--require src/config/world.ts',
  '--format progress',
  '--format summary',
  `--format html:src/test-result/reports/${nombreReporte}.html`,    // Formato de salida
  isParalelo,                 //Cantidad de navegadores que se abriran en paralelo
  tagsCucumber,                           //Implementacion de tags
].join(' ');


module.exports = {
  default: common

};
