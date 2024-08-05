# README
## Framework de Playwright con Cucumber y typescript

----
### Descripción
Este es un framework para la automatizacion de casos de pruebas que implementa Playwright, cucumber y typescript. Se han agregado varias funcionalidades adicionales, tales como:
- Generación de logs.
- Uso de datos de prueba desde un archivo JSON.
- Implementación del patrón de diseño POM (Page Object Model).
- Una clase World para administrar, gestionar e integrar todas las funcionalidades adicionales del framework.
- Un archivo para gestionar las variables de entorno.

----
### Contenido
- [Prerequisitos](#prerequisitos)
- [Instalacion](#instalacion)
- [Estructura del Proyecto](#estructura-del-proyecto)
- [Ejecución](#ejecución)
- [Contribución](#contribución)

----
### Prerequisitos
1. Instalar **[Node.js](https://nodejs.org/en)** (v20.14.0 o superior)
2. Instalar **[Visual studio Code](https://code.visualstudio.com/download)** (Ultima versión recomendada)
3. Instalar la extensión de Playwright para Visual Studio Code:  **[Playwright Test for VSCode](https://marketplace.visualstudio.com/items?itemName=ms-playwright.playwright)**

----
### Instalación
1. Clonar el repositorio desde la consola en la ruta donde desea trabajar el proyecto:
```bash
git clone <Link_del_repositorio>
```
2. Instalar las dependencias:
```bash
npm install
```
3. Instalar navegadors de playwright:
```bash
npx playwright install --with-deps
```

----
### Estructura del Proyecto

```plaintext
├── github/                     # Archivo de pipeline
├── logs/                       # Archivo de logs
├── node_modules/               # Dependencias de npm
├── src/                        # Código fuente de las pruebas
│   ├── config/                 # Directorio de archivos de configuracion
│   ├── data/                   # Directorio de la data de pruebas
│   ├── pom/                    # Directorio de los POMs (Page Object Model)  
│   ├── test/                   # Directorio de los scenarios de pruebas y los steps
│   │    ├── features/          # Archivos .feature de Cucumber
│   │    ├── step/              # Definiciones de pasos de Cucumber
│   ├── test-result/            # Directorio de data de los reportes
│   │    ├── reports/           # Directorio de reportes de cucumber
│   │    ├── screenshots/       # Directorio de capturas de pantalla temporales
│   └── utilidades              # Configuraciones y utilidades
├── .env                        # Archivo de variables de ambientes
├── .gitignore                  # Archivos y directorios a ignorar por git
├── cucumber.js                 # Configuración de Cucumber
├── package-lock.json           # Archivo automatico de dependencias
├── package.json                # Archivo de configuracion de dependencias y scripts de npm
├── playwright.config.ts        # Configuración de Playwright
├── README.md                   # Este archivo
└── tsconfig.json               # Configuración de TypeScript
```

----
### Ejecución
#### Ejecución por navegador

Se puede ejecutar las pruebas en navegadores específicos o en todos a la vez con los siguientes comandos:
1. **Ejecución en Microsoft Edge:**
```bash
npm run edge feature=<nombre-feature> tags=@<nombre-tag> paralelo=<numero>
```
2. **Ejecución en Chrome:**
```bash
npm run chrome feature=<nombre-feature> tags=@<nombre-tag> paralelo=<numero>
```
3. **Ejecución en Safari:**
```bash
npm run safari feature=<nombre-feature> tags=@<nombre-tag> paralelo=<numero>
```

#### Ejecución con Cucumber

Se puede ejecutar directamente con Cucumber especificando el navegador como parametro:
```bash
npx cucumber-js feature=<nombre-feature> browser=<nombre-browser> tags=@<nombre-tag> paralelo=<numero>
```

> **!NOTA:**
> Los parámetros como feature y tags no son obligatorios. Sin embargo, si deseas ejecutar algún elemento específico, puedes especificarlo directamente.

----
### Contribución
Para subir los cambios al repositorio favor tomar en cuenta:

1. Realizar los cambios y pruebas en una nueva rama.
2. Asegurar que el código cumple con la estructura establecida.
5. Enviar un pull request detallando los cambios.