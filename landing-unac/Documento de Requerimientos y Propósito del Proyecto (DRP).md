# **DOCUMENTO DE REQUERIMIENTOS Y PROPÓSITO DEL PROYECTO (DRP)**

**Proyecto:** Sistema de Transporte Inteligente (ITS) de Priorización Multicriterio para la UNAC

**Ruta Inicial:** Ventanilla \- UNAC

**Plataforma:** Aplicación Web Responsiva (Mobile-First)

## **1\. PROPÓSITO DEL PROYECTO**

El propósito principal del sistema web es digitalizar y optimizar la gestión del transporte universitario ("burras") mediante la implementación de un algoritmo de Inteligencia Artificial que garantice la equidad y la meritocracia.

El sistema eliminará las "colas ciegas" (físicas) y las reemplazará por "colas informadas" (digitales), asignando los recursos limitados (42 asientos) a los estudiantes con mayor vulnerabilidad, distancia geográfica, urgencia horaria y rendimiento académico, mejorando así la capacidad operativa logística y la satisfacción estudiantil.

## **2\. OBJETIVOS DE LA PLATAFORMA WEB**

* **Para el Estudiante (Usuario Final):**  
  * Solicitar el servicio de transporte desde cualquier lugar (ej. a las 5:00 AM para la ida, o 17:00 PM para el retorno).  
  * Conocer con anticipación (cuenta regresiva) si tiene asiento garantizado, si viaja parado o si no alcanza cupo, eliminando el tiempo de espera innecesario en el paradero.  
  * Visualizar su *Score de Prioridad* y entender de manera transparente por qué obtuvo (o no) el asiento.  
* **Para la Universidad (Administrador/Logística):**  
  * Validar el abordaje mediante escaneo de código QR (Microservicios) para asegurar que solo suban los estudiantes autorizados.  
  * Obtener reportes en tiempo real sobre la demanda, tiempos de espera y satisfacción del usuario (datos que alimentarán el análisis en Minitab).

## **3\. PUNTOS CLAVE A CONSIDERAR EN EL DISEÑO (UX/UI)**

* **Mobile-First:** El 95% de los estudiantes usarán el sistema desde sus celulares mientras caminan o están en clase. El diseño debe estar optimizado para pantallas pequeñas.  
* **Transparencia (Trust Design):** La aplicación debe explicar claramente (sin ser técnica) cómo se calcula el *Score*. Si un estudiante no consigue asiento, debe entender que fue porque otro compañero lo necesitaba más (ej. discapacidad o mayor distancia), no por un "error del sistema".  
* **Fricción Cero en el Abordaje:** La pantalla del Código QR debe cargar instantáneamente, tener el brillo al máximo automáticamente y ser escaneable incluso con mala conexión a internet (modo offline/caché).  
* **Accesibilidad:** Contraste alto y botones grandes, considerando que algunos usuarios prioritarios tendrán discapacidades visuales o motrices.

## **4\. ARQUITECTURA DE LA APLICACIÓN (Secciones Necesarias)**

### **A. Módulo del Estudiante (Frontend)**

1. **Pantalla de Login / SSO:**  
   * Integración con el correo institucional (ej. @unac.edu.pe).  
   * Sincronización inicial silenciosa con el SIGA (para extraer notas, horarios y dirección).  
2. **Dashboard Principal (Inicio):**  
   * Estado actual: "Próxima salida: 18:00 hrs \- Ruta Ventanilla".  
   * Botón principal (Call to Action): "Solicitar Cupo".  
   * Visualización rápida del *Score de Prioridad* actual del alumno.  
3. **Pantalla de Solicitud (La "Cola Digital"):**  
   * Muestra el estado de la solicitud: "Procesando prioridad..."  
   * Cuenta regresiva (ej. "El resultado de asignación se publicará en 45:00 min").  
4. **Pantalla de Resultados y Boarding Pass (QR):**  
   * **Estado 1 (Score Alto):** "¡Asiento Garantizado\!" \+ Código QR Verde \+ Asiento Asignado (ej. A-12).  
   * **Estado 2 (Score Medio):** "Viaje Parado Autorizado" \+ Código QR Amarillo.  
   * **Estado 3 (Score Bajo):** "Filtro de Capacidad: No Aborda" \+ Sugerencia de rutas alternativas.  
   * *Nota: El QR es el instrumento para medir la latencia del microservicio.*  
5. **Pantalla de Feedback (Encuesta):**  
   * Se activa automáticamente después de que el alumno aborda.  
   * Escala de 1 a 10 (alimenta tu Variable Dependiente: Satisfacción).

### **B. Módulo del Chofer / Validador (Mobile App)**

1. **Escáner QR:**  
   * Cámara activa a pantalla completa.  
   * Feedback visual y sonoro inmediato (Verde \= Pasa, Rojo \= Bloqueado/QR duplicado).  
   * *Este módulo genera la métrica de tiempo de abordaje para tu Excel.*  
2. **Dashboard de Aforo:**  
   * Contador en tiempo real: "Sentados: 40/42", "Parados: 15/20".

### **C. Módulo Administrativo (Dashboard Web Desktop)**

1. **Monitor de Operaciones:**  
   * Mapa o estado en vivo de la unidad.  
   * Tasa de ocupación actual.  
2. **Reportes y Analítica (Exportación):**  
   * Sección para descargar la matriz de datos en formato Excel/CSV con las columnas estructuradas para el software estadístico (Tiempos de espera, satisfacción, Accuracy del modelo).

## **5\. FLUJO DE USUARIO (User Journey) \- Caso de Uso: Retorno 18:00 hrs**

1. **16:00 hrs:** Se abre la ventana de solicitud en la app. El estudiante "A" presiona "Solicitar Cupo".  
2. **16:00 a 17:00 hrs:** La aplicación muestra "Solicitud en espera". El estudiante sigue en clase o en la biblioteca, sin necesidad de hacer cola física (Aquí empieza a correr el reloj para tu métrica de Tiempo de Espera).  
3. **17:00 hrs (Cierre):** El algoritmo de Machine Learning procesa todas las solicitudes. Calcula el *Score* basado en Notas, Lejanía, Horario y Discapacidad.  
4. **17:01 hrs:** El estudiante recibe una notificación push: *"Tienes asiento garantizado. Tu código QR está listo"*.  
5. **17:50 hrs:** El estudiante llega al paradero y escanea su QR con el supervisor. (Aquí se detiene el reloj de Tiempo de Espera. El sistema calcula la latencia total).  
6. **18:10 hrs:** El estudiante recibe una notificación: *"Del 1 al 10, ¿qué tan satisfecho estás con la asignación de hoy?"*.