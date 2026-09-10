# Integraciones de marketing y contenido

## Principio

Las integraciones deben ayudar a captar, medir y atender oportunidades B2B.
Los archivos de configuración son la autoridad para identificadores, destinos
y parámetros técnicos; este documento define su función estratégica.

## Captación

El sitio combina:

- formularios ligados a servicios;
- correo electrónico;
- teléfono;
- WhatsApp;
- fichas o estudios iniciales como llamada a la acción.

Los formularios deben indicar el motivo del contacto y recoger la información
mínima que permita asignar la oportunidad.

Los datos de destino no deben duplicarse aquí: se mantienen en las fuentes de
contenido y configuración correspondientes.

## Precio horario de la electricidad

La página de precio de la electricidad es una herramienta de apoyo a la
decisión para quien tiene una factura indexada, con el foco comercial puesto
en empresas e industrias. Cubre las tres tarifas de acceso —2.0TD, 3.0TD y
6.1TD—, así que su alcance ya no es solo industrial, pero no representa un
precio universal de la electricidad ni sustituye a un estudio de contrato.

El gráfico:

- consulta en el navegador un histórico horario servido por una automatización
  externa;
- desglosa mercado, peajes de la tarifa elegida y otros componentes, y muestra
  su total en €/MWh;
- permite elegir la tarifa de acceso —2.0TD, 3.0TD o 6.1TD— y repinta el mismo
  histórico sin volver a consultarlo, recordando la elección en el navegador;
- permite avanzar, retroceder o seleccionar únicamente días con datos
  completos;
- explica bajo la gráfica a qué suministro corresponde cada tarifa, resaltando
  la seleccionada, y dónde localizarla en la factura; esas tarjetas son
  también un control: al pulsarlas cambian la tarifa y acercan la gráfica si
  ha quedado fuera de vista;
- usa Chart.js para la visualización y Flatpickr para el calendario, cargados
  desde un CDN.

La integración se mantiene en:

- `content/single/precio-electricidad.es.md`, para la página y su promesa;
- `data/section/precio-electricidad-grafico.yml`, para insertar el shortcode;
- `layouts/shortcodes/precio-electricidad-grafico.html`, para interfaz,
  consulta, tratamiento de datos y gráfico.

Su continuidad depende del servicio de datos, de su esquema y permisos CORS,
de las librerías externas y de la publicación diaria. Cualquier cambio debe
comprobar, como mínimo:

- frescura, zona horaria peninsular y fecha de la última actualización;
- días de cambio horario con 23 o 25 registros;
- unidades y cálculo de mercado, peajes, componentes y total;
- coherencia, al cambiar de tarifa, entre la serie de peajes, los periodos
  horarios del tooltip, las etiquetas de la leyenda y la tarjeta resaltada;
- respuesta visible y comprensible cuando falten datos o falle la red;
- navegación por fecha y lectura del gráfico en móvil y escritorio.

La página debe explicar siempre a qué tarifa de acceso corresponden los
valores mostrados y que tienen finalidad orientativa. No se presentarán como importe
final de factura ni como resultado aplicable a cualquier contrato. La fuente,
el alcance y cualquier cambio regulatorio o metodológico deben poder
verificarse antes de usar el gráfico como argumento comercial o editorial. Las
descripciones de las tarifas se apoyan en la Circular 3/2020 de la CNMC, que
la propia página enlaza; si cambian los límites de potencia o tensión, hay que
revisarlas ahí.

Además de las conversiones de contacto, interesa medir el uso de esta
herramienta —cambio de tarifa, cambio de fecha, consulta recurrente y paso
posterior a un servicio o contacto— sin convertir una interacción exploratoria
en un lead. La tarifa elegida indica el tipo de suministro de quien consulta y
es el dato más útil para segmentar.

## Medición

La analítica debe distinguir, como mínimo:

- envío válido de formulario;
- clic en teléfono, WhatsApp y correo;
- solicitud de estudio fotovoltaico;
- solicitud de valoración CAE;
- contacto desde una página de servicio;
- visita a proyectos o casos antes de convertir.

No asumir que estos eventos ya están implementados. Antes de cambiar la
medición, revisar consentimiento, configuración vigente y definición de
conversiones.

## Canales externos

- LinkedIn es el canal corporativo más alineado con decisores B2B, proyectos,
  empleo y autoridad técnica.
- Google Business y reseñas aportan confianza local.
- Instagram y Facebook pueden apoyar notoriedad y prueba visual, pero no deben
  llevar el tono hacia consumo residencial.
- Las fuentes regulatorias del MITECO son autoridad para CAE.

El sitio debe ser la fuente estable de la oferta; las redes distribuyen y
adaptan, no sustituyen el contenido canónico.

## Auditoría de marketing y SEO

La auditoría extensa puede ser útil aunque sea pesada. La mejor incorporación
no es copiarla entera al repositorio, sino:

1. compartir el documento para su análisis;
2. resumir decisiones duraderas en `dna/`;
3. convertir recomendaciones ejecutables en un plan priorizado independiente;
4. conservar el original como documento de consulta, sin copiarlo al contenido
   del sitio.

Las conclusiones de la auditoría deben distinguir evidencia, recomendación y
decisión aprobada.
