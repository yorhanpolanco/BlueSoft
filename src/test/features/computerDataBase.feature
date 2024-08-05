Feature: Escenarios para validar Computer DataBase

  Background:
    Given Usuario accede a la aplicacion
    And La aplicación está abierta en la página principal y todas las opciones han cargado

  @caso1
  Scenario Outline: Verificar la Búsqueda de Computadoras
    When Usuario insertar un nombre de computadora valido en el campo de búsqueda "<nombre>"
    And Hace clic en el botón Filter by name
    Then La tabla debe mostrar solo computadoras cuyo nombre contenga el texto insertado "<nombre>"
    And El título en la cabecera debe mostrar el número correcto de computadoras encontradas
    And No se deben repetir nombres de computadoras
    And Se debe dividir el resultado en 10 computadoras por pagina

    Examples:
      | jsonFile              | caso       | nombre   |
      | computerDataBase.json | escenario1 | computer |

  @caso2
  Scenario Outline: Agregar Nueva Computadora
    When Usuario hace clic en el botón Add a new computer
    And Completa los campos de "<nombre>", "<introduccion>", "<descontinuacion>", y selecciona una "<compania>" del dropdown
    And Hace clic en el botón Create this computer
    Then Se debe mostrar una alerta indicando que la computadora fue creada con el "<nombre>" insertado

    Examples:
      | jsonFile              | caso       | nombre   | introduccion | descontinuacion | compania   |
      | computerDataBase.json | escenario2 | computer | FechaInicio  | FechaFin        | Fabricante |

