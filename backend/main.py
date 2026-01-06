from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
try:
    from .database import engine, Base
    from .routers import resume, gitlab, chat, neil
except ImportError:
    from database import engine, Base
    from routers import resume, gitlab, chat, neil
from fastapi.exceptions import RequestValidationError
from fastapi.responses import JSONResponse
from fastapi import Request

# Create database tables
Base.metadata.create_all(bind=engine)

app = FastAPI(title="e42 Foundry API")

# CORS setup
# Allow all origins for development to prevent 400 Bad Request
app.add_middleware(
    CORSMiddleware,
    allow_origin_regex="https?://.*",  # Allows http and https from any domain
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    print(f"Validation Error: {exc.errors()}")
    print(f"Body: {await request.body()}")
    return JSONResponse(
        status_code=422,
        content={"detail": exc.errors(), "body": str(exc.body)},
    )

@app.get("/")
def read_root():
    return {"message": "e42 Foundry API is running"}

# Include Routers
app.include_router(resume.router, prefix="", tags=["resume"])
app.include_router(gitlab.router, prefix="/gitlab", tags=["gitlab"])
app.include_router(chat.router)
app.include_router(neil.router, prefix="/neil", tags=["neil"])
