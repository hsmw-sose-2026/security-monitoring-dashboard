# Upload Endpoints.
# Nimmt Dateien vom Frontend entgegen und delegiert die gesamte Verarbeitungslogik
# an den Upload-Service. Die Route selbst enthaelt keine Business-Logik.
# Die Security-Pruefung fuer Dateitypen erfolgt ueber die Middleware bzw. Detection-Logik.

<<<<<<< HEAD
from fastapi import APIRouter, Depends, File, Request, UploadFile, status
=======
from fastapi import APIRouter, Depends, File, Request, UploadFile, UploadFile, status, Query
>>>>>>> origin/integration-test

from sqlmodel import Session

from app.database import get_session
<<<<<<< HEAD
from app.schemas.upload import UploadResponse
from app.services.upload_service import process_upload
=======
from app.schemas.upload import UploadResponse, UploadMetadataResponse
from app.services.upload_service import process_upload
from app.repositories.upload_repository import list_uploads
>>>>>>> origin/integration-test

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

<<<<<<< HEAD
    return result
=======
    return result


@router.get("", response_model=list[UploadMetadataResponse])
def list_upload_metadata(
    session: Session = Depends(get_session),
    limit: int = Query(default=20, ge=1, le=100),
    offset: int = Query(default=0, ge=0),
):
    return list_uploads(session, limit, offset)
>>>>>>> origin/integration-test
