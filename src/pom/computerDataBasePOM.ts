import { expect, Locator, Page, FrameLocator, BrowserContext, Browser } from '@playwright/test';
import { Utilidades } from '../utilidades/playwright-utilidades';

export class computersPOM {
    readonly page: Page;
    readonly context: BrowserContext;
    readonly browser: Browser;
    readonly title: Locator;
    readonly totalConsulta: Locator;
    readonly textboxBusqueda: Locator;
    readonly botonBuscar: Locator;
    readonly botonAgregarCompu: Locator;
    readonly tablaDeResultados: Locator;
    readonly computerName: Locator;
    readonly introducedTextBox: Locator;
    readonly discontinuedTextBox: Locator;
    readonly companyDropBox: Locator;
    readonly deleteComputer: Locator;
    readonly botonCrearComput: Locator;
    readonly botonGuardarCompu: Locator;
    readonly botonCancelar: Locator;
    readonly botonNext: Locator;
    readonly alerta:Locator;
    resultadoTotal: string[];


    constructor(page: Page, browser: Browser) {
        this.page = page;
        this.browser = browser;
        this.context = page.context();
        this.title = page.getByRole('link', { name: 'Computer database' });
        this.totalConsulta = page.getByRole('heading', { name: 'computers found' });
        this.textboxBusqueda = page.getByPlaceholder('Filter by computer name...');
        this.botonBuscar = page.getByRole('button', { name: 'Filter by name' });
        this.botonAgregarCompu = page.getByRole('link', { name: 'Add a new computer' });
        this.tablaDeResultados = page.locator('table.computers tbody');
        this.botonNext = page.getByRole('link', { name: 'Next →' })
        this.computerName = page.getByLabel('Computer name');
        this.introducedTextBox = page.getByLabel('Introduced');
        this.discontinuedTextBox = page.getByLabel('Discontinued');
        this.companyDropBox = page.getByLabel('Company');
        this.deleteComputer = page.getByRole('button', { name: 'Delete this computer' });
        this.botonCrearComput = page.getByRole('button', { name: 'Create this computer' });
        this.botonGuardarCompu = page.getByRole('button', { name: 'Save this computer' });
        this.botonCancelar = page.getByRole('link', { name: 'Cancel' });
        this.alerta= page.getByText('has been created')
        this.resultadoTotal = [];

    }

    async goToPage(url: string) {
        await this.page.goto(`${url}`, { waitUntil: 'load' });
    }

    async aplicacionCargada() {
        let resultado;
        await this.page.waitForFunction(() => document.fonts.ready);
        const elementsVisible = await Promise.all([
            this.title.isVisible(),
            this.totalConsulta.isVisible(),
            this.textboxBusqueda.isVisible(),
            this.botonBuscar.isVisible(),
            this.botonAgregarCompu.isVisible(),
            this.tablaDeResultados.isVisible(),
        ]);

        resultado = await elementsVisible.every(isVisible => isVisible)
            ? "Todas las opciones han cargado"
            : "Error intentando validar que los elementos estan visibles";

        await Utilidades.agregarLineaAlLog(resultado);
        return resultado;

    }

    async buscar() {
        await this.botonBuscar.click();
        this.resultadoTotal = [];
    }

    async obtenerResultado() {

        if (this.resultadoTotal.length === 0) {

            while (true) {
                const nombreComputadoras = await this.tablaDeResultados.locator('td:nth-child(1)');
                const listaDeNombres: string[] = await nombreComputadoras.allTextContents();

                this.resultadoTotal.push(...listaDeNombres);
                const isLastPage = await this.page.locator('li.next.disabled').count();

                if (isLastPage > 0) {

                    break;
                } else {
                    await this.botonNext.click();
                    await this.title.waitFor({ state: 'visible' });
                }
            }
            await this.botonBuscar.click();
        }
        return this.resultadoTotal;
    }

    async validarNoValoresRepetidos(lista: string[]) {
        let result = true;
        const setDeValores = new Set<string>();
        for (const valor of lista) {
            if (setDeValores.has(valor)) {
                result = false;
                break;
            }
            setDeValores.add(valor);
        }
        return result ? "No hay nombre de computadoras repetidos" : "Hay nombre de computadoras repetidos";
    }

    async validarValoresConsultados(valor: string, lista: string[]): Promise<string> {
        const resultado = lista.every(item => item.includes(valor))
            ? `La tabla solo muestra computadoras con ${valor}`
            : "La tabla muestra nombres que NO estan relacionados con el criterio de busqueda";
        return resultado;
    }

    async obtenerCantidadTitulo() {
        const cantidad = (await this.totalConsulta.innerText()).replace(/\D/g, '');
        return parseInt(cantidad, 10);
    }

    async validarPaginacion(cantidad: number) {
        let resultMessage = "No se está realizando la paginación correctamente";

       
        while (true) {
            const nombreComputadoras = await this.tablaDeResultados.locator('td:nth-child(1)');
            const listaDeNombres = await nombreComputadoras.allTextContents();

            const isLastPage = await this.page.locator('li.next.disabled').count() > 0;

            if (isLastPage) {
                if (listaDeNombres.length <= cantidad) {
                    resultMessage = `Las paginas estan divididas en ${cantidad} computadoras por pagina`;
                }
                break;
            } else {
                if (listaDeNombres.length === cantidad) {
                    await this.botonNext.click();
                    await this.title.waitFor({ state: 'visible' });
                } else {
                    break;
                }
            }
        }

        await this.botonBuscar.click();
        return resultMessage;
    }

    async llenarCampos(nombre:string,introduccion:string,descontinuacion:string,compania:string){
        await this.computerName.fill(nombre);
        await this.introducedTextBox.fill(introduccion);
        await this.discontinuedTextBox.fill(descontinuacion);
        await this.companyDropBox.selectOption(compania);

    }

    async validarAlerta(){
        const text= await this.alerta.innerText();
        return text;
    }


}