import base64
import io
import uvicorn
from fastapi import FastAPI, File, UploadFile, Form
from fastapi.middleware.cors import CORSMiddleware
from PIL import Image
import requests # AI 생성 로직 파일 (이전에 작성한 코드)

# --- 아래는 이전에 작성했던 AI 이미지 생성 함수 ---
def generate_remodeled_image(input_image_bytes, mode='Interior'):
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
        
        response = requests.post(url=f'{url}/sdapi/v1/img2img', json=payload)
        response.raise_for_status()

        r = response.json()
        image_data = base64.b64decode(r['images'][0])
        return image_data
    except Exception as e:
        print(f"이미지 생성 중 오류 발생: {e}")
        return None
# ----------------------------------------------------


app = FastAPI()

# CORS 미들웨어 추가 (React 앱과 통신하기 위해 필수)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # React 개발 서버 주소
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.post("/api/generate")
async def generate_image_endpoint(mode: str = Form(...), file: UploadFile = File(...)):
    """
    React로부터 이미지와 모드를 받아 AI 이미지를 생성하고 반환하는 API
    """
    input_image_bytes = await file.read()
    
    # AI 이미지 생성 함수 호출
    generated_image_bytes = generate_remodeled_image(input_image_bytes, mode)

    if generated_image_bytes:
        # 생성된 이미지를 다시 base64 문자열로 인코딩하여 JSON으로 반환
        img_base64 = base64.b64encode(generated_image_bytes).decode('utf-8')
        return {"image_base64": img_base64}
    else:
        return {"error": "Failed to generate image"}, 500

if __name__ == "__main__":
    uvicorn.run(app, host="0.0.0.0", port=8000)