import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from '@playwright/test';
import { computersPOM } from '../../pom/computerDataBasePOM';
import { CustomWorldImpl } from '../../config/world';

let computersPage: computersPOM;
let world: CustomWorldImpl;

Given('Usuario accede a la aplicacion', { timeout: 30 * 1000 }, async function (this: CustomWorldImpl) {
  computersPage = new computersPOM(this.page, this.browser);
  world = await this;
  await computersPage.goToPage(`${process.env.PAGE}`);
});

When('La aplicación está abierta en la página principal y todas las opciones han cargado', async function () {
  await expect(await computersPage.aplicacionCargada()).toEqual("Todas las opciones han cargado");
});

When('Usuario insertar un nombre de computadora valido en el campo de búsqueda {string}', async function (nombre: string) {
  await computersPage.textboxBusqueda.clear();
  await computersPage.textboxBusqueda.fill(world.obtenerDataJson(nombre));
});

When('Hace clic en el botón Filter by name', async function () {
  await computersPage.buscar();
});

Then('La tabla debe mostrar solo computadoras cuyo nombre contenga el texto insertado {string}', async function (nombre: string) {
  const valorNombre = world.obtenerDataJson(nombre);
  await expect(await computersPage.validarValoresConsultados(valorNombre
    , await computersPage.obtenerResultado()))
    .toEqual(`La tabla solo muestra computadoras con ${valorNombre}`);

});

Then('El título en la cabecera debe mostrar el número correcto de computadoras encontradas', async function () {
  const totalComputadoras = (await computersPage.obtenerResultado()).length;
  await expect(await computersPage.obtenerCantidadTitulo()).toEqual(totalComputadoras);
});

Then('No se deben repetir nombres de computadoras', async function () {
  const resultadoEsperado = "No hay nombre de computadoras repetidos";
  await expect(await computersPage.validarNoValoresRepetidos(await computersPage.obtenerResultado()))
    .toEqual(resultadoEsperado);
});

Then('Se debe dividir el resultado en {int} computadoras por pagina', async function (cantidad: number) {
  const resultadoEsperado = `Las paginas estan divididas en ${cantidad} computadoras por pagina`;
  await expect(await computersPage.validarPaginacion(cantidad)).toEqual(resultadoEsperado);
});

When('Usuario hace clic en el botón Add a new computer', async function () {
  await computersPage.botonAgregarCompu.click();
});

When('Completa los campos de {string}, {string}, {string}, y selecciona una {string} del dropdown', async function (nombre: string, introduccion: string, descontinuacion: string, compania: string) {
  const nombreConsulta = world.obtenerDataJson(nombre);
  const introduccionConsulta = world.obtenerDataJson(introduccion);
  const descontinuacionConsulta = world.obtenerDataJson(descontinuacion);
  const companiaConsulta = world.obtenerDataJson(compania);
  await computersPage.llenarCampos(nombreConsulta, introduccionConsulta, descontinuacionConsulta, companiaConsulta);
});
When('Hace clic en el botón Create this computer', async function () {
  await computersPage.botonCrearComput.click();
});

Then('Se debe mostrar una alerta indicando que la computadora fue creada con el {string} insertado', async function (nombre:string) {
  expect(await computersPage.alerta).toBeVisible();
  expect(await computersPage.validarAlerta()).toContain(world.obtenerDataJson(nombre));
});