# Upload Endpoint.
# Nimmt Dateien vom Frontend an und speichert sie erstmal lokal.
# Die Security-Pruefung fuer Dateitypen passiert dann ueber die Middleware bzw. Detection-Logik.

from fastapi import APIRouter, UploadFile, File, HTTPException
from pathlib import Path
import shutil
import uuid

router = APIRouter(prefix="/upload", tags=["upload"])

UPLOAD_DIR = Path("uploads") # Das Verzeichnis, in dem die hochgeladenen Dateien gespeichert werden

UPLOAD_DIR.mkdir(parents=True, exist_ok=True) # parents=True erstellt alle notwendigen übergeordneten Verzeichnisse, falls sie nicht existieren, und exist_ok=True verhindert, dass eine Fehlermeldung ausgegeben wird, wenn das Verzeichnis bereits existiert.

# Der Endpoint zum Hochladen von Dateien
@router.post("/upload")
async def upload_file(file: UploadFile = File(...)): # file: UploadFile = File(...) definiert einen Parameter, der eine Datei erwartet. UploadFile ist eine spezielle Klasse von FastAPI, die Informationen über die hochgeladene Datei enthält, wie z.B. den Dateinamen, den Inhaltstyp und die Datei selbst. File(...) gibt an, dass dieser Parameter erforderlich ist und von FastAPI als Datei-Upload behandelt werden soll.

    if not file.filename: # Wenn kein Dateiname angegeben wird, wird eine Fehlermeldung zurueckgegeben
        raise HTTPException(
            status_code=400,
            detail="Keine Datei angegeben"
        )

    unique_filename = f"{uuid.uuid4()}_{file.filename}" # Ein eindeutiger Dateiname wird generiert, um Kollisionen zu vermeiden. Hier wird die uuid4-Funktion verwendet, um eine zufaellige UUID zu generieren, die dann mit dem Originaldateinamen kombiniert wird.

    file_path = UPLOAD_DIR / unique_filename # Der vollständige Pfad zur gespeicherten Datei wird erstellt, indem das Upload-Verzeichnis mit dem eindeutigen Dateinamen kombiniert wird. Das "/"-Operator wird hier verwendet, um Pfade zu kombinieren.

    try: 
        with file_path.open("wb") as buffer: # Die Datei wird im Schreibmodus ("wb" steht für "write binary") geoeffnet, um die hochgeladene Datei zu speichern. Das "with"-Statement stellt sicher, dass die Datei ordnungsgemäß geschlossen wird, auch wenn während des Schreibvorgangs ein Fehler auftritt.
            shutil.copyfileobj(file.file, buffer) # shutil.copyfileobj() wird verwendet, um den Inhalt der hochgeladenen Datei (file.file) in die geoeffnete Datei (buffer) zu kopieren.

    except Exception as e:
        raise HTTPException(
            status_code=500,
            detail="Datei konnte nicht gespeichert werden: "
        )

    return { 
        "filename": unique_filename,
        "path": str(file_path),
        "message": "Datei erfolgreich hochgeladen"
    }