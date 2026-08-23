from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from app.core.database import engine, Base
from app.models import models
from app.routers import users, tasks

Base.metadata.create_all(bind=engine)

app = FastAPI(title="TaskMaster API", version="1.0")

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(users.router)
app.include_router(tasks.router)

@app.get("/")
def root():
    return {"message": "¡TaskMaster API funcionando!"}