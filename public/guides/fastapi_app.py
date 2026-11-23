import asyncio
from fastapi import FastAPI, HTTPException
from loglogic_client import send_log
app = FastAPI()

@app.post('/demo')
async def demo():
    try:
        await asyncio.to_thread(send_log, 'fastapi-demo', 'info', 'Demo route completed', {'route': '/demo'})
        return {'ok': True}
    except Exception:
        raise HTTPException(status_code=503, detail='Logging service unavailable') from None
