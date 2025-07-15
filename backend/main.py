# main.py (수정 후)

import base64
import io
import uvicorn
import httpx  # 'requests' 대신 'httpx'를 import 합니다.
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image

# --- AI 이미지 생성 함수를 비동기(async) 함수로 변경 ---
# 함수 이름 앞에 'async'를 붙여줍니다.
async def generate_remodeled_image(input_image_bytes, mode='Interior'):
    try:
        url = "http://127.0.0.1:7860"
        encoded_image = base64.b64encode(input_image_bytes).decode('utf-8')
        
        if mode == 'Interior':
            prompt = "A photorealistic, modern interior redesign of this space, minimalist architecture, expansive glass walls, clean lines, recessed LED lighting. 8k, ultra-realistic."
        else: # Exterior
            prompt = "A photorealistic, futuristic exterior redesign of this building with parametric and organic curves, dynamic, flowing lines and innovative materials. 8k, architectural digest style."

        negative_prompt = "ugly, disfigured, low quality, blurry, cartoon, drawing, sketch"
        
        payload = {
            "init_images": [encoded_image], "prompt": prompt, "negative_prompt": negative_prompt,
            "steps": 30, "cfg_scale": 7, "denoising_strength": 0.75
        }
        
        # 'requests.post' 대신 'httpx.AsyncClient'를 사용합니다.
        async with httpx.AsyncClient() as client:
            # 타임아웃을 넉넉하게 5분(300초)으로 설정합니다. (이미지 생성이 오래 걸리므로)
            response = await client.post(url=f'{url}/sdapi/v1/img2img', json=payload, timeout=300.0)
        
        response.raise_for_status()

        r = response.json()
        image_data = base64.b64decode(r['images'][0])
        return image_data
    except Exception as e:
        print(f"이미지 생성 중 오류 발생: {e}")
        return None
# ----------------------------------------------------


app = FastAPI()

app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/generate")
async def generate_image_endpoint(mode: str = Form(...), file: UploadFile = File(...)):
    input_image_bytes = await file.read()
    
    # 'async' 함수를 호출할 때는 앞에 'await'를 붙여줍니다.
    generated_image_bytes = await generate_remodeled_image(input_image_bytes, mode)

    if generated_image_bytes:
        img_base64 = base64.b64encode(generated_image_bytes).decode('utf-8')
        return {"image_base64": img_base64}
    else:
        return {"error": "Failed to generate image"}, 500

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)