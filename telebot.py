import subprocess
import os
import base64
import json
import httpx
from google import genai
from google.genai import types
from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, filters, ContextTypes
from dotenv import load_dotenv

import os

# Cargar variables locales
load_dotenv(".env.local")

# --- SISTEMA DE ACTIVACIÓN (PARA EVITAR CONFLICTOS EN RAILWAY) ---
SERVICE_NAME = os.getenv("RAILWAY_SERVICE_NAME", "Local/Desconocido")
ACTIVATE_BOT = os.getenv("ACTIVATE_BOT", "false").lower() == "true"

if not ACTIVATE_BOT:
    print(f"⚠️  Servicio detectado: {SERVICE_NAME}")
    print("▶️  El bot está DESACTIVADO (ACTIVATE_BOT != 'true').")
    print("💡 Para activarlo en este servicio, añade ACTIVATE_BOT=true en Railway.")
    import time
    while True:
        time.sleep(3600)
# ----------------------------------------------------------------

# Chat ID del dueño (Respaldo)
TU_CHAT_ID_DEFAULT = 5913494789

TOKEN = os.environ.get("TELEGRAM_TOKEN")
TU_CHAT_ID_ENV = os.environ.get("TELEGRAM_CHAT_ID")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
RAILWAY_TOKEN = os.environ.get("RAILWAY_TOKEN")
RAILWAY_PROJECT_ID = os.environ.get("RAILWAY_PROJECT_ID")

# Determinar el Chat ID efectivo
try:
    if TU_CHAT_ID_ENV:
        TU_CHAT_ID = int(TU_CHAT_ID_ENV)
    else:
        TU_CHAT_ID = TU_CHAT_ID_DEFAULT
except ValueError:
    print(f"❌ ERROR: TELEGRAM_CHAT_ID inválido en entorno, usando respaldo.")
    TU_CHAT_ID = TU_CHAT_ID_DEFAULT

# Safety check for environment variables
if not TOKEN:
    print("❌ ERROR: TELEGRAM_TOKEN no configurado en entorno.")
if TU_CHAT_ID == 0:
    print("❌ ERROR: TELEGRAM_CHAT_ID no configurado.")
if not GEMINI_API_KEY:
    print("❌ ERROR: GEMINI_API_KEY no configurado en entorno.")

# Initialize clients only if keys are present
client = None

if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    print("⚠️ WARNING: Gemini Client no inicializado debido a falta de API KEY")

PROJECT_DIR = "."

def obtener_url_railway():
    query = """
    query {
      project(id: "%s") {
        services {
          edges {
            node {
              name
              serviceInstances {
                edges {
                  node {
                    domains {
                      serviceDomains {
                        domain
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    """ % RAILWAY_PROJECT_ID

    try:
        response = httpx.post(
            "https://backboard.railway.com/graphql/v2",
            json={"query": query},
            headers={
                "Authorization": f"Bearer {RAILWAY_TOKEN}",
                "Content-Type": "application/json"
            },
            timeout=10
        )
        data = response.json()
        servicios = data["data"]["project"]["services"]["edges"]
        urls = []
        for servicio in servicios:
            nombre = servicio["node"]["name"]
            instancias = servicio["node"]["serviceInstances"]["edges"]
            for instancia in instancias:
                dominios = instancia["node"]["domains"]["serviceDomains"]
                for d in dominios:
                    urls.append(f"{nombre}: https://{d['domain']}")
        return "\n".join(urls) if urls else "No se encontraron URLs activas"
    except Exception as e:
        return f"Error consultando Railway: {e}"

def leer_archivos_proyecto():
    archivos = []
    extensiones = (".tsx", ".ts", ".js", ".jsx", ".css", ".json")
    ignorar = ("node_modules", ".next", ".git", "dist")

    for root, dirs, files in os.walk(PROJECT_DIR):
        dirs[:] = [d for d in dirs if d not in ignorar]
        for file in files:
            if file.endswith(extensiones):
                path = os.path.join(root, file)
                try:
                    with open(path, "r", encoding="utf-8", errors="ignore") as f:
                        contenido = f.read(3000)
                    archivos.append(f"--- {path} ---\n{contenido}")
                except:
                    pass
    return "\n\n".join(archivos[:15])

async def handle_texto(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_chat.id != TU_CHAT_ID:
        await update.message.reply_text("⛔ No autorizado")
        return

    instruccion = update.message.text
    await update.message.reply_text("⏳ Analizando y procesando...")

    url_railway = obtener_url_railway()
    contexto_proyecto = leer_archivos_proyecto()

    prompt = f"""
Eres un agente de desarrollo experto. Tienes acceso al código fuente de un proyecto.

URL DEL PROYECTO EN PRODUCCIÓN (Railway):
{url_railway}

PROYECTO ACTUAL:
{contexto_proyecto}

INSTRUCCIÓN DEL DESARROLLADOR:
{instruccion}

Responde en este formato JSON exacto, sin markdown, sin explicaciones extra:
{{
  "accion": "comando" | "modificar_archivo" | "respuesta",
  "comando": "el comando de Windows CMD si accion es comando",
  "archivo": "ruta del archivo si accion es modificar_archivo",
  "contenido": "contenido completo nuevo del archivo si accion es modificar_archivo",
  "mensaje": "explicación breve de lo que hiciste o encontraste"
}}
"""

    respuesta = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents=prompt
    )

    try:
        texto = respuesta.text.strip().replace("```json", "").replace("```", "")
        data = json.loads(texto)

        if data["accion"] == "comando":
            cmd = data["comando"]
            resultado = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=PROJECT_DIR)
            salida = resultado.stdout or resultado.stderr or "✅ Sin salida"
            await update.message.reply_text(f"💻 `{cmd}`\n\n📤 {salida[:3000]}\n\n💬 {data.get('mensaje','')}", parse_mode="Markdown")

        elif data["accion"] == "modificar_archivo":
            ruta = data["archivo"]
            contenido = data["contenido"]
            os.makedirs(os.path.dirname(ruta) if os.path.dirname(ruta) else ".", exist_ok=True)
            with open(ruta, "w", encoding="utf-8") as f:
                f.write(contenido)
            await update.message.reply_text(f"✅ Archivo modificado: `{ruta}`\n\n💬 {data.get('mensaje','')}", parse_mode="Markdown")

        else:
            await update.message.reply_text(f"💬 {data.get('mensaje', respuesta.text)}")

    except Exception as e:
        await update.message.reply_text(f"💬 {respuesta.text[:3000]}")

async def handle_imagen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if update.effective_chat.id != TU_CHAT_ID:
        await update.message.reply_text("⛔ No autorizado")
        return

    await update.message.reply_text("📸 Analizando la imagen...")

    photo = update.message.photo[-1]
    file = await context.bot.get_file(photo.file_id)
    imagen_bytes = await file.download_as_bytearray()

    caption = update.message.caption or "Analiza este error y dime cómo corregirlo en el proyecto"
    url_railway = obtener_url_railway()
    contexto_proyecto = leer_archivos_proyecto()

    prompt = f"""
Eres un agente de desarrollo experto. Analiza la imagen (puede ser un error, UI, log, etc).

URL DEL PROYECTO EN PRODUCCIÓN (Railway):
{url_railway}

PROYECTO ACTUAL:
{contexto_proyecto}

INSTRUCCIÓN: {caption}

Responde en JSON exacto, sin markdown, sin explicaciones extra:
{{
  "accion": "comando" | "modificar_archivo" | "respuesta",
  "comando": "...",
  "archivo": "...",
  "contenido": "...",
  "mensaje": "explicación de lo que encontraste y qué harás"
}}
"""

    respuesta = client.models.generate_content(
        model="gemini-2.0-flash-lite",
        contents=[
            types.Part.from_bytes(data=bytes(imagen_bytes), mime_type="image/jpeg"),
            types.Part.from_text(text=prompt)
        ]
    )

    try:
        texto = respuesta.text.strip().replace("```json", "").replace("```", "")
        data = json.loads(texto)

        if data["accion"] == "modificar_archivo":
            ruta = data["archivo"]
            contenido = data["contenido"]
            os.makedirs(os.path.dirname(ruta) if os.path.dirname(ruta) else ".", exist_ok=True)
            with open(ruta, "w", encoding="utf-8") as f:
                f.write(contenido)
            await update.message.reply_text(f"✅ Archivo modificado: `{ruta}`\n\n💬 {data.get('mensaje','')}", parse_mode="Markdown")

        elif data["accion"] == "comando":
            cmd = data["comando"]
            resultado = subprocess.run(cmd, shell=True, capture_output=True, text=True, cwd=PROJECT_DIR)
            salida = resultado.stdout or resultado.stderr or "✅ Sin salida"
            await update.message.reply_text(f"💻 `{cmd}`\n\n📤 {salida[:3000]}\n\n💬 {data.get('mensaje','')}", parse_mode="Markdown")

        else:
            await update.message.reply_text(f"💬 {data.get('mensaje', respuesta.text)}")

    except Exception as e:
        await update.message.reply_text(f"💬 {respuesta.text[:3000]}")

if TOKEN and client:
    try:
        app = ApplicationBuilder().token(TOKEN).build()
        app.add_handler(MessageHandler(filters.PHOTO, handle_imagen))
        app.add_handler(MessageHandler(filters.TEXT, handle_texto))
        print("🤖 Agente IA corriendo con visión, edición de archivos y Railway...")
        app.run_polling()
    except Exception as e:
        print(f"❌ ERROR CRÍTICO al iniciar el bot: {e}")
        import time
        while True:
            print(f"El bot falló al iniciar. Error: {e}. Esperando corrección en Railway...")
            time.sleep(60)
else:
    print("❌ ERROR CRÍTICO: El bot NO puede iniciar sin TELEGRAM_TOKEN y GEMINI_API_KEY.")
    import time
    while True:
        print("Esperando configuración de variables de entorno en Railway...")
        time.sleep(60)