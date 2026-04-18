import subprocess
import shlex
import os
import base64
import json
import time
import threading
import httpx
from collections import defaultdict
from http.server import HTTPServer, BaseHTTPRequestHandler
from google import genai
from google.genai import types
from telegram import Update
from telegram.ext import ApplicationBuilder, MessageHandler, CommandHandler, filters, ContextTypes
from dotenv import load_dotenv

# Cargar variables locales
load_dotenv(".env.local")

# --- SISTEMA DE ACTIVACION (PARA EVITAR CONFLICTOS EN RAILWAY) ---
SERVICE_NAME = os.getenv("RAILWAY_SERVICE_NAME", "Local/Desconocido")
ACTIVATE_BOT = os.getenv("ACTIVATE_BOT", "false").lower() == "true"

if not ACTIVATE_BOT:
    print(f"  Servicio detectado: {SERVICE_NAME}")
    print("  El bot esta DESACTIVADO (ACTIVATE_BOT != 'true').")
    print("  Para activarlo en este servicio, agrega ACTIVATE_BOT=true en Railway.")
    while True:
        time.sleep(3600)
# ----------------------------------------------------------------

# --- CONFIGURACION ---
TOKEN = os.environ.get("TELEGRAM_TOKEN")
TU_CHAT_ID_ENV = os.environ.get("TELEGRAM_CHAT_ID")
GEMINI_API_KEY = os.environ.get("GEMINI_API_KEY")
RAILWAY_TOKEN = os.environ.get("RAILWAY_TOKEN")
RAILWAY_PROJECT_ID = os.environ.get("RAILWAY_PROJECT_ID")

# Chat ID SOLO desde variable de entorno (sin hardcoding)
TU_CHAT_ID = None
try:
    if TU_CHAT_ID_ENV:
        TU_CHAT_ID = int(TU_CHAT_ID_ENV)
    else:
        print("ERROR: TELEGRAM_CHAT_ID no configurado. El bot no aceptara mensajes.")
except ValueError:
    print("ERROR: TELEGRAM_CHAT_ID invalido en entorno.")

if not TOKEN:
    print("ERROR: TELEGRAM_TOKEN no configurado en entorno.")
if not GEMINI_API_KEY:
    print("ERROR: GEMINI_API_KEY no configurado en entorno.")

# Initialize Gemini client
client = None
if GEMINI_API_KEY:
    client = genai.Client(api_key=GEMINI_API_KEY)
else:
    print("WARNING: Gemini Client no inicializado debido a falta de API KEY")

PROJECT_DIR = os.path.abspath(".")

# --- SEGURIDAD: WHITELIST DE COMANDOS ---
ALLOWED_COMMAND_PREFIXES = [
    "git status", "git log", "git diff", "git branch", "git show",
    "npm run build", "npm run dev", "npm run lint", "npm test",
    "npx prisma generate", "npx prisma migrate",
    "ls", "dir", "cat", "type", "head", "tail",
    "echo", "pwd",
]

BLOCKED_PATTERNS = [
    "rm ", "rm\t", "rmdir", "del ", "del\t",
    "curl ", "wget ", "powershell", "cmd /c", "cmd.exe",
    "eval(", "exec(", "import ", "python ",
    "> /dev", ">/dev", ">> ", "> ",
    "${", "$(", "`",
    "chmod", "chown", "sudo", "su ",
    "kill", "pkill", "taskkill",
    "mkfs", "fdisk", "format",
    "env", "export ", "set ",
    "nc ", "ncat", "netcat",
    ".env", "passwd", "shadow", "id_rsa", "credentials",
]

DANGEROUS_SHELL_CHARS = ["|", ";", "&&", "||", ">>", "<<"]

# Rate limiting
rate_limit_tracker = defaultdict(list)
RATE_LIMIT_MAX = 10
RATE_LIMIT_WINDOW = 60  # seconds

# Pending file modifications awaiting confirmation
pending_modifications = {}


def check_rate_limit(chat_id: int) -> bool:
    now = time.time()
    timestamps = rate_limit_tracker[chat_id]
    rate_limit_tracker[chat_id] = [t for t in timestamps if now - t < RATE_LIMIT_WINDOW]
    if len(rate_limit_tracker[chat_id]) >= RATE_LIMIT_MAX:
        return False
    rate_limit_tracker[chat_id].append(now)
    return True


def is_command_safe(cmd: str) -> tuple[bool, str]:
    cmd_lower = cmd.lower().strip()

    # Check for dangerous shell characters
    for char in DANGEROUS_SHELL_CHARS:
        if char in cmd:
            return False, f"Caracter de shell bloqueado: '{char}'"

    # Check blocked patterns
    for pattern in BLOCKED_PATTERNS:
        if pattern in cmd_lower:
            return False, f"Patron bloqueado detectado: '{pattern}'"

    # Check whitelist
    allowed = False
    for prefix in ALLOWED_COMMAND_PREFIXES:
        if cmd_lower.startswith(prefix):
            allowed = True
            break

    if not allowed:
        return False, f"Comando no esta en la whitelist. Permitidos: {', '.join(ALLOWED_COMMAND_PREFIXES[:5])}..."

    return True, "OK"


def is_path_safe(file_path: str) -> tuple[bool, str]:
    try:
        abs_path = os.path.abspath(os.path.join(PROJECT_DIR, file_path))
        if not abs_path.startswith(PROJECT_DIR):
            return False, "Path traversal detectado: la ruta sale del directorio del proyecto"

        # Block sensitive files
        sensitive = [".env", ".git/", "node_modules/", ".next/", "id_rsa", "credentials"]
        for s in sensitive:
            if s in file_path.lower():
                return False, f"Archivo sensible bloqueado: '{s}'"

        # Only allow known safe extensions
        safe_extensions = (".tsx", ".ts", ".js", ".jsx", ".css", ".json", ".md", ".txt", ".html", ".py", ".sql")
        if not any(file_path.endswith(ext) for ext in safe_extensions):
            return False, f"Extension de archivo no permitida"

        return True, abs_path
    except Exception as e:
        return False, f"Error validando path: {e}"


def execute_safe_command(cmd: str) -> str:
    try:
        args = shlex.split(cmd)
        result = subprocess.run(
            args,
            shell=False,
            capture_output=True,
            text=True,
            cwd=PROJECT_DIR,
            timeout=30,
        )
        output = result.stdout or result.stderr or "Sin salida"
        return output[:3000]
    except subprocess.TimeoutExpired:
        return "ERROR: Comando excedio el tiempo limite (30s)"
    except Exception as e:
        return f"ERROR ejecutando comando: {e}"


def obtener_url_railway():
    if not RAILWAY_TOKEN or not RAILWAY_PROJECT_ID:
        return "Railway no configurado"

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
                except Exception:
                    pass
    return "\n\n".join(archivos[:15])


async def handle_texto(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if TU_CHAT_ID is None or update.effective_chat.id != TU_CHAT_ID:
        await update.message.reply_text("No autorizado")
        return

    if not check_rate_limit(update.effective_chat.id):
        await update.message.reply_text("Rate limit: espera 1 minuto antes de enviar mas comandos.")
        return

    instruccion = update.message.text

    # Check for confirmation of pending modifications
    if instruccion.lower() in ("si", "yes", "confirmar", "ok") and update.effective_chat.id in pending_modifications:
        pending = pending_modifications.pop(update.effective_chat.id)
        ruta = pending["ruta"]
        contenido = pending["contenido"]
        try:
            os.makedirs(os.path.dirname(ruta) if os.path.dirname(ruta) else ".", exist_ok=True)
            with open(ruta, "w", encoding="utf-8") as f:
                f.write(contenido)
            await update.message.reply_text(f"Archivo modificado: {ruta}")
        except Exception as e:
            await update.message.reply_text(f"Error escribiendo archivo: {e}")
        return

    if instruccion.lower() in ("no", "cancelar", "cancel") and update.effective_chat.id in pending_modifications:
        pending_modifications.pop(update.effective_chat.id)
        await update.message.reply_text("Modificacion cancelada.")
        return

    await update.message.reply_text("Analizando y procesando...")

    url_railway = obtener_url_railway()
    contexto_proyecto = leer_archivos_proyecto()

    prompt = f"""
Eres un agente de desarrollo experto. Tienes acceso al codigo fuente de un proyecto.

URL DEL PROYECTO EN PRODUCCION (Railway):
{url_railway}

PROYECTO ACTUAL:
{contexto_proyecto}

INSTRUCCION DEL DESARROLLADOR:
{instruccion}

IMPORTANTE - RESTRICCIONES DE SEGURIDAD:
- Solo puedes sugerir comandos de esta whitelist: git status, git log, git diff, git branch, git show, npm run build, npm run dev, npm run lint, npm test, npx prisma generate, npx prisma migrate, ls, cat, echo, pwd
- NO uses pipes (|), punto y coma (;), ni encadenar comandos (&&, ||)
- NO sugieras rm, del, curl, wget, sudo, ni comandos destructivos
- Para modificar archivos, solo usa rutas dentro del proyecto (no .env, .git, node_modules)

Responde en este formato JSON exacto, sin markdown, sin explicaciones extra:
{{
  "accion": "comando" | "modificar_archivo" | "respuesta",
  "comando": "el comando si accion es comando",
  "archivo": "ruta del archivo si accion es modificar_archivo",
  "contenido": "contenido completo nuevo del archivo si accion es modificar_archivo",
  "mensaje": "explicacion breve de lo que hiciste o encontraste"
}}
"""

    try:
        respuesta = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=prompt
        )
    except Exception as e:
        await update.message.reply_text(f"Error con Gemini API: {str(e)[:500]}")
        return

    try:
        texto = respuesta.text.strip().replace("```json", "").replace("```", "")
        data = json.loads(texto)

        if data["accion"] == "comando":
            cmd = data["comando"]
            is_safe, reason = is_command_safe(cmd)
            if not is_safe:
                await update.message.reply_text(f"BLOQUEADO: {reason}\n\nComando rechazado: {cmd}")
                return

            salida = execute_safe_command(cmd)
            await update.message.reply_text(
                f"CMD: {cmd}\n\nSalida:\n{salida}\n\n{data.get('mensaje', '')}",
            )

        elif data["accion"] == "modificar_archivo":
            ruta = data["archivo"]
            contenido = data["contenido"]

            is_safe, result = is_path_safe(ruta)
            if not is_safe:
                await update.message.reply_text(f"BLOQUEADO: {result}\n\nArchivo rechazado: {ruta}")
                return

            # Require confirmation before writing
            pending_modifications[update.effective_chat.id] = {
                "ruta": result,  # Use absolute validated path
                "contenido": contenido,
            }

            preview = contenido[:500] + ("..." if len(contenido) > 500 else "")
            await update.message.reply_text(
                f"CONFIRMACION REQUERIDA\n\n"
                f"Archivo: {ruta}\n"
                f"Tamano: {len(contenido)} caracteres\n\n"
                f"Preview:\n{preview}\n\n"
                f"Responde 'si' para confirmar o 'no' para cancelar."
            )

        else:
            await update.message.reply_text(f"{data.get('mensaje', respuesta.text)}")

    except (json.JSONDecodeError, KeyError):
        await update.message.reply_text(f"{respuesta.text[:3000]}")
    except Exception as e:
        await update.message.reply_text(f"Error procesando respuesta: {str(e)[:500]}")


async def handle_imagen(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if TU_CHAT_ID is None or update.effective_chat.id != TU_CHAT_ID:
        await update.message.reply_text("No autorizado")
        return

    if not check_rate_limit(update.effective_chat.id):
        await update.message.reply_text("Rate limit: espera 1 minuto.")
        return

    await update.message.reply_text("Analizando la imagen...")

    photo = update.message.photo[-1]
    file = await context.bot.get_file(photo.file_id)
    imagen_bytes = await file.download_as_bytearray()

    caption = update.message.caption or "Analiza este error y dime como corregirlo en el proyecto"
    url_railway = obtener_url_railway()
    contexto_proyecto = leer_archivos_proyecto()

    prompt = f"""
Eres un agente de desarrollo experto. Analiza la imagen (puede ser un error, UI, log, etc).

URL DEL PROYECTO EN PRODUCCION (Railway):
{url_railway}

PROYECTO ACTUAL:
{contexto_proyecto}

INSTRUCCION: {caption}

IMPORTANTE - RESTRICCIONES DE SEGURIDAD:
- Solo sugiere comandos seguros: git status, git log, git diff, npm run build, ls, cat
- NO uses pipes, punto y coma, ni comandos destructivos
- Para archivos, solo rutas dentro del proyecto

Responde en JSON exacto, sin markdown, sin explicaciones extra:
{{
  "accion": "comando" | "modificar_archivo" | "respuesta",
  "comando": "...",
  "archivo": "...",
  "contenido": "...",
  "mensaje": "explicacion de lo que encontraste y que haras"
}}
"""

    try:
        respuesta = client.models.generate_content(
            model="gemini-2.0-flash-lite",
            contents=[
                types.Part.from_bytes(data=bytes(imagen_bytes), mime_type="image/jpeg"),
                types.Part.from_text(text=prompt)
            ]
        )
    except Exception as e:
        await update.message.reply_text(f"Error con Gemini API: {str(e)[:500]}")
        return

    try:
        texto = respuesta.text.strip().replace("```json", "").replace("```", "")
        data = json.loads(texto)

        if data["accion"] == "modificar_archivo":
            ruta = data["archivo"]
            contenido = data["contenido"]

            is_safe, result = is_path_safe(ruta)
            if not is_safe:
                await update.message.reply_text(f"BLOQUEADO: {result}")
                return

            pending_modifications[update.effective_chat.id] = {
                "ruta": result,
                "contenido": contenido,
            }
            preview = contenido[:500] + ("..." if len(contenido) > 500 else "")
            await update.message.reply_text(
                f"CONFIRMACION REQUERIDA\n\n"
                f"Archivo: {ruta}\n"
                f"Tamano: {len(contenido)} chars\n\n"
                f"Preview:\n{preview}\n\n"
                f"Responde 'si' para confirmar o 'no' para cancelar."
            )

        elif data["accion"] == "comando":
            cmd = data["comando"]
            is_safe, reason = is_command_safe(cmd)
            if not is_safe:
                await update.message.reply_text(f"BLOQUEADO: {reason}")
                return

            salida = execute_safe_command(cmd)
            await update.message.reply_text(f"CMD: {cmd}\n\nSalida:\n{salida}\n\n{data.get('mensaje', '')}")

        else:
            await update.message.reply_text(f"{data.get('mensaje', respuesta.text)}")

    except (json.JSONDecodeError, KeyError):
        await update.message.reply_text(f"{respuesta.text[:3000]}")
    except Exception as e:
        await update.message.reply_text(f"Error procesando respuesta: {str(e)[:500]}")


# --- HEALTH CHECK HTTP SERVER (para Railway) ---
BOT_START_TIME = time.time()
HEALTH_PORT = int(os.getenv("PORT", "8080"))


class HealthHandler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path == "/health" or self.path == "/":
            uptime = int(time.time() - BOT_START_TIME)
            body = json.dumps({
                "status": "ok",
                "service": "drive2go-telebot",
                "uptime_seconds": uptime,
                "gemini": bool(client),
                "telegram": bool(TOKEN),
                "chat_id_configured": TU_CHAT_ID is not None,
            })
            self.send_response(200)
            self.send_header("Content-Type", "application/json")
            self.end_headers()
            self.wfile.write(body.encode())
        else:
            self.send_response(404)
            self.end_headers()

    def log_message(self, format, *args):
        pass  # Silence request logs


def start_health_server():
    try:
        server = HTTPServer(("0.0.0.0", HEALTH_PORT), HealthHandler)
        print(f"  - Health check server en puerto {HEALTH_PORT}")
        server.serve_forever()
    except Exception as e:
        print(f"WARNING: Health server no pudo iniciar: {e}")


# --- COMANDOS DE TELEGRAM ---
async def cmd_status(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if TU_CHAT_ID is None or update.effective_chat.id != TU_CHAT_ID:
        await update.message.reply_text("No autorizado")
        return

    uptime = int(time.time() - BOT_START_TIME)
    hours, remainder = divmod(uptime, 3600)
    minutes, seconds = divmod(remainder, 60)

    status_lines = [
        "DRIVE2GO BOT STATUS",
        f"Uptime: {hours}h {minutes}m {seconds}s",
        f"Gemini: {'OK' if client else 'NO CONFIGURADO'}",
        f"Railway Token: {'OK' if RAILWAY_TOKEN else 'NO'}",
        f"Rate Limit: {RATE_LIMIT_MAX} cmds/{RATE_LIMIT_WINDOW}s",
        f"Pending Mods: {len(pending_modifications)}",
        f"Servicio: {SERVICE_NAME}",
    ]
    await update.message.reply_text("\n".join(status_lines))


async def cmd_help(update: Update, context: ContextTypes.DEFAULT_TYPE):
    if TU_CHAT_ID is None or update.effective_chat.id != TU_CHAT_ID:
        await update.message.reply_text("No autorizado")
        return

    help_text = """DRIVE2GO BOT - Comandos

/status - Estado del bot y servicios
/help - Este mensaje de ayuda

Tambien puedes enviar:
- Texto: Instrucciones para el agente IA
- Imagen: Analisis de errores/screenshots

Comandos permitidos para el agente:
git status, git log, git diff, git branch, git show
npm run build/dev/lint/test
npx prisma generate/migrate
ls, cat, echo, pwd"""
    await update.message.reply_text(help_text)


# --- INICIO DEL BOT ---
if TOKEN and client and TU_CHAT_ID is not None:
    try:
        # Start health check server in background
        health_thread = threading.Thread(target=start_health_server, daemon=True)
        health_thread.start()

        app = ApplicationBuilder().token(TOKEN).build()
        app.add_handler(CommandHandler("status", cmd_status))
        app.add_handler(CommandHandler("help", cmd_help))
        app.add_handler(MessageHandler(filters.PHOTO, handle_imagen))
        app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_texto))
        print("Bot de agente IA corriendo con seguridad habilitada...")
        print(f"  - Whitelist de comandos: {len(ALLOWED_COMMAND_PREFIXES)} prefijos")
        print(f"  - Rate limit: {RATE_LIMIT_MAX} comandos/{RATE_LIMIT_WINDOW}s")
        print(f"  - Confirmacion requerida para modificar archivos")
        app.run_polling()
    except Exception as e:
        print(f"ERROR CRITICO al iniciar el bot: {e}")
        while True:
            print(f"El bot fallo al iniciar. Error: {e}. Esperando correccion en Railway...")
            time.sleep(60)
else:
    missing = []
    if not TOKEN:
        missing.append("TELEGRAM_TOKEN")
    if not client:
        missing.append("GEMINI_API_KEY")
    if TU_CHAT_ID is None:
        missing.append("TELEGRAM_CHAT_ID")
    print(f"ERROR: El bot NO puede iniciar. Variables faltantes: {', '.join(missing)}")
    while True:
        print("Esperando configuracion de variables de entorno en Railway...")
        time.sleep(60)
