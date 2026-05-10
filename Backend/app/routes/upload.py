# Upload Endpoints.
# Nimmt Dateien vom Frontend entgegen und delegiert die gesamte Verarbeitungslogik
# an den Upload-Service. Die Route selbst enthaelt keine Business-Logik.
# Die Security-Pruefung fuer Dateitypen erfolgt ueber die Middleware bzw. Detection-Logik.

from fastapi import APIRouter, Depends, File, Request, UploadFile, status

from sqlmodel import Session

from app.database import get_session
from app.schemas.upload import UploadResponse
from app.services.upload_service import process_upload

router = APIRouter(prefix="/upload", tags=["upload"])

@router.post("", response_model=UploadResponse, status_code=status.HTTP_201_CREATED)
async def upload_file(request: Request, file: UploadFile = File(...), session: Session = Depends(get_session)):
    # Request wird benoetigt um die Client-IP auszulesen
    client_ip = request.client.host if request.client else None

    # process_upload aus dem service fuehrt alle Schritte des Uploads durch und gibt ein UploadResponse-Objekt zurueck
    result = await process_upload(
        file=file,
        session=session,
        client_ip=client_ip,
    )

    return result