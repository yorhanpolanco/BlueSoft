const fs = require('fs');

class Logs {

    /**
   * 
   * @returns - Retorna fecha y hora actual.
   */
    static #obtenerFechaYHoraActual() {
        return new Date().toLocaleString();
    }

    /**
     * Funcion para crear el archivo logs
     * @param ruta - Ruta donde se crearan los archivos logs
     */
    static async crearArchivoLogs(ruta) {
        if (!fs.existsSync(ruta)) {
            // Si no existe, crea el archivo
            fs.writeFileSync(ruta, '', { flag: 'w' });
            console.log(`Se creo el archivo: ${ruta}`);
        }
    }

    /**
     * Función que muestra el log en consola y agrega esa misma línea al archivo logs.
     * 
     * @param linea - Texto que se mostrará en el log.
     * @param color - Variable booleana que si se envía true activa el color del texto en la consola.
     */
    static async agregarLineaAlLog(linea, color) {
        const Reset = "\x1b[0m";
        const FgGreen = "\x1b[32m";
        const FgRed = "\x1b[31m";
        const rutaLogs =  process.env.RUTA_LOGS;

        if (color === true) {
             console.log(`${ FgGreen}${ linea} ${ Reset}`);
        } else if (color === false) {
             console.log(`${ FgRed}${ Logs.#obtenerFechaYHoraActual()} ${ linea}${ Reset}`);
        } else {
            linea = `${ Logs.#obtenerFechaYHoraActual()} ${ linea}`;
            await console.log(`${ linea}`);
        }

        if (rutaLogs) {
            try {
                await Logs.#agregarLineaArchivo( rutaLogs,  linea);
            } catch (error) {
                console.error('Error al escribir en el archivo:', error);
            }
        }
    }

    /**
     * Función que escribe una línea en el archivo de logs.
     * 
     * @param ruta - Ruta del archivo de logs.
     * @param linea - Línea a escribir en el archivo.
     */
    static async #agregarLineaArchivo(ruta, linea) {
        await fs.appendFile(ruta, linea + '\n', 'utf8', (err) => {
            if (err) {
                console.error('Error al escribir en el archivo:', err);
            }
        });
    }

    /**
     * Formatear cabecera para agregar 
     * @returns * 
     * */
    static formantCabecera(cabecera) {
        const caracter = '*';
        const maxCaracters = 74;
        let formateado;
        if (cabecera) {
            const relleno = maxCaracters > cabecera.length ? (maxCaracters - cabecera.length) : 0;
            const inicio = Math.floor(relleno / 2);
            const fin = relleno - inicio;
            const rellenoI = caracter.repeat(inicio);
            const rellenoF = caracter.repeat(fin);
            if (relleno > 0) {
                formateado = `${rellenoI} ${cabecera} ${rellenoF}`;
            } else {
                formateado = `${cabecera}`;
            }
        } else {
            formateado = caracter.repeat(maxCaracters + 2);
        }
        return formateado;
    }

    /**
   * 
   * @returns - Parametros que fueron agregados en el comando de ejecucion
   */
    static #obtenerParametros() {
        const variables = [];
        const featureName = process.env.FEATURE;
        const browserName = process.env.BROWSER;
        const tags = process.env.TAGS;
        const paralelo = process.env.PARALELO;


        if (browserName) variables.push(`Browser => ${browserName}`);
        if (featureName) variables.push(`Feature => ${featureName}`);
        if (tags) variables.push(`Tags => ${tags}`);
        if (paralelo) variables.push(`paralelo => ${paralelo}`);

        return variables;
    }

    /**
    * Imprimera por consola la cabecera de ejecucion
    */
    static async imprimirCabecera() {
        for (const param of Logs.#obtenerParametros()) {
            await Logs.agregarLineaAlLog(await Logs.formantCabecera(await param), true);
        }
    }



}

module.exports = Logs;