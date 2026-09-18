# Peludos & Co — Premium Pet Care

Aplicación web boutique oficial de **Peludos & Co**, especializada en tecnología de vanguardia, salud preventiva, biotracking y productos de alta gama para perros y gatos. Incluye catálogo inteligente, reservas de citas y demostraciones tech a domicilio en Madrid Norte, y asistente virtual con la API de Google Gemini.

---

## 📋 Requisitos Previos (Prerequisites)

- **Node.js**: Versión **18.0.0 o superior** (se recomienda **Node.js 20+ LTS** o **Node.js 22+**).  
  Compruebe su versión con:
  ```bash
  node -v
  ```
  Si no lo tiene instalado, descárguelo desde [nodejs.org](https://nodejs.org/).
- **npm**: Incluido automáticamente con Node.js (versión 9+ o 10+).

---

## 🚀 Instalación y Puesta en Marcha (Quick Start)

### 1. Clonar o descargar el repositorio
```bash
git clone <URL_DE_TU_REPOSITORIO_GITHUB>
cd <CARPETA_DEL_PROYECTO>
```

### 2. Instalar dependencias
```bash
npm install
```

### 3. Configurar la clave de API de Gemini
Cree un archivo llamado `.env.local` (o `.env`) en la raíz del proyecto y añada su clave de API de Google Gemini:
```env
GEMINI_API_KEY=tu_clave_de_gemini_aqui
```
> Puede obtener una clave gratuita en [Google AI Studio](https://aistudio.google.com/app/apikey).

### 4. Iniciar la aplicación en modo desarrollo
```bash
npm run dev
```
La aplicación estará disponible en su navegador en:  
👉 **http://localhost:3000**

---

## 🛠️ Solución de Problemas Frecuentes (Troubleshooting)

### Error 1: `Port 3000 is already in use` (EADDRINUSE)
**Causa**: Otra aplicación está usando el puerto 3000.  
**Solución**:
- En Windows (PowerShell/CMD):
  ```powershell
  set PORT=3001 && npm run dev
  ```
- En macOS / Linux:
  ```bash
  PORT=3001 npm run dev
  ```
- O bien, libere el puerto 3000 cerrando el proceso previo.

---

### Error 2: `npm install` falla o errores con `@tailwindcss/vite`
**Causa**: Está usando una versión antigua de Node.js (por ejemplo Node 14 o 16).  
**Solución**:  
Actualice Node.js a la versión 20 LTS o superior desde [nodejs.org](https://nodejs.org/). Luego ejecute:
```bash
rm -rf node_modules package-lock.json
npm install
```
*(En Windows PowerShell si no funciona `rm`, borre la carpeta `node_modules` manualmente y vuelva a ejecutar `npm install`)*.

---

### Error 3: El Asistente Virtual dice "modo catálogo" o no responde
**Causa**: La variable `GEMINI_API_KEY` no se ha detectado o el archivo `.env.local` está mal nombrado.  
**Solución**:
1. Asegúrese de que el archivo se llame exactamente `.env.local` o `.env` (sin extensiones ocultas como `.txt`).
2. El contenido debe ser exactamente:
   ```env
   GEMINI_API_KEY=AIzaSy...
   ```
3. Reinicie el servidor de desarrollo (`Ctrl + C` y vuelva a ejecutar `npm run dev`).

---

### Error 4: Conflictos al actualizar desde GitHub (`git pull`)
**Causa**: Ha realizado cambios locales que entran en conflicto con la versión de GitHub.  
**Solución**:
Para guardar sus cambios en una rama temporal y traer la versión actualizada:
```bash
git stash
git pull origin main
git stash pop
```
O si desea descartar cambios locales y usar la versión exacta de GitHub:
```bash
git fetch origin
git reset --hard origin/main
npm install
```

---

## 🔄 Cómo Conectar con GitHub y Actualizar Automáticamente

### Opción A: Exportar directamente desde Google AI Studio
1. En la esquina superior derecha del editor de Google AI Studio, haga clic en **Settings (⚙️)** o en el menú de opciones.
2. Seleccione **Export to GitHub**.
3. Autorice su cuenta de GitHub y elija si desea crear un nuevo repositorio (público o privado).
4. Cada vez que realice cambios importantes, puede volver a exportar o usar Git localmente.

---

### Opción B: Subir su proyecto a un repositorio propio de GitHub desde su ordenador
Si ya ha descargado el proyecto como ZIP:
1. Abra su terminal o consola en la carpeta del proyecto.
2. Inicie Git (si no lo ha hecho):
   ```bash
   git init
   git add .
   git commit -m "Versión inicial Peludos & Co"
   ```
3. Cree un repositorio vacío en su cuenta de [GitHub](https://github.com/new).
4. Conecte y suba los cambios:
   ```bash
   git branch -M main
   git remote add origin https://github.com/TU_USUARIO/TU_REPOSITORIO.git
   git push -u origin main
   ```

---

### 🚀 Despliegue Continuo (Actualizaciones automáticas con cada `git push`)
Para que cada vez que suba un cambio a GitHub su página web se actualice automáticamente en Internet:
1. **En Render / Railway / Netlify / Vercel**:
   - Conecte su repositorio de GitHub.
   - **Build Command**: `npm run build`
   - **Start Command**: `npm start`
   - **Node Version**: `20` o `22`
   - **Environment Variables**: Añada `GEMINI_API_KEY` con su clave de Google AI Studio.
2. Cada vez que haga `git push origin main`, la plataforma detectará el cambio, compilará la nueva versión y la publicará automáticamente sin que tenga que hacer nada más.

---

## 📦 Construcción para Producción (Build)

Para generar la compilación de producción:
```bash
npm run build
npm start
```
El servidor arrancará sirviendo los archivos optimizados desde la carpeta `dist/`.
