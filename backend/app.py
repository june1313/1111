from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import base64
import os
from datetime import datetime
import json

# ==============================================================================
# ✨ 1. 설정 영역 (Configuration Area)
# ==============================================================================

# 기본 부정 프롬프트 (네거티브 프롬프트)
NEGATIVE_PROMPT = "worst quality, low quality, jpeg artifacts, blurry, distorted, ugly, tiling, poorly drawn, disfigured, out of frame, extra limbs, bad anatomy, watermark, text, signature, clutter, messy, low-resolution"

# 스타일 및 방 구조별 긍정 프롬프트 템플릿
STYLE_PROMPTS = {
    "Modern": "(Modern style:1.2) interior design, a bright and clean {room_type}, sleek furniture, (neutral color palette with a bold accent color:1.1), large windows with natural light, polished concrete floors, statement art piece on the wall",
    "Minimalist": "(Minimalist style:1.3) interior design, an uncluttered and serene {room_type}, essential furniture only, monochromatic color scheme, soft ambient lighting, clean lines, simplicity, organized, ample negative space",
    "Scandinavian": "(Scandinavian style:1.2) interior design, a cozy and functional {room_type}, (light wood elements:1.1), white walls, natural materials, minimalist decor, hygge atmosphere, clean and bright",
    "Bohemian": "(Bohemian style:1.2) interior design, an eclectic and vibrant {room_type}, (rich patterns and textures:1.1), macrame wall hangings, lots of indoor plants, vintage furniture, warm and earthy tones, layered rugs",
    "Industrial": "(Industrial style:1.2) interior design, a spacious {room_type}, (exposed brick wall:1.1), metal light fixtures, visible ductwork, leather sofa, concrete floor, a mix of wood and metal elements",
    "Coastal": "(Coastal style:1.1) interior design, an airy and relaxing {room_type}, light blue and sand color palette, natural materials like wicker and light wood, large open windows with sheer curtains, clean and fresh"
}

# 기본 이미지 생성 파라미터
DEFAULT_GENERATION_PARAMS = {
    "steps": 30,
    "cfg_scale": 7,
    "width": 512,
    "height": 512,
    "sampler_name": "DPM++ 2M Karras",
    "denoising_strength": 0.85
}

# 기본 컨트롤넷 파라미터
DEFAULT_CONTROLNET_SETTINGS = {
    "module": "canny",
    "model": "control_v11p_sd15_canny [d14c016b]",
    "weight": 1.0,
    "low_threshold": 100,
    "high_threshold": 200,
    "pixel_perfect": True,
    "resize_mode": "Crop and Resize",
    "control_mode": "Balanced",
    "guidance_start": 0.0,
    "guidance_end": 1.0,
    "processor_res": 512
}

# ==============================================================================
# ✨ 2. Flask 앱 및 API 로직
# ==============================================================================

app = Flask(__name__)
CORS(app)
SD_API_BASE_URL = "http://127.0.0.1:7860"

def generate_sd_image(payload):
    """Stable Diffusion API를 호출하여 이미지 생성을 요청합니다."""
    url = f"{SD_API_BASE_URL}/sdapi/v1/img2img"
    
    try:
        print("Stable Diffusion 서버에 이미지 생성을 요청합니다...")
        response = requests.post(url=url, json=payload, timeout=300)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        print("API 오류: Stable Diffusion 서버가 응답하지 않습니다 (Timeout).")
        return None, "Image generation server timed out."
    except requests.exceptions.RequestException as e:
        print(f"API 오류: Stable Diffusion 서버에 연결할 수 없습니다. 에러: {e}")
        return None, "Could not connect to the image generation server."

    r = response.json()
    return r['images'][0], None

def save_image(image_data_base64):
    """Base64 인코딩된 이미지 데이터를 파일로 저장합니다."""
    output_dir = os.path.join(app.static_folder, 'images')
    os.makedirs(output_dir, exist_ok=True)
    
    timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
    filename = f"output_{timestamp}.png"
    filepath = os.path.join(output_dir, filename)
    
    with open(filepath, 'wb') as f:
        f.write(base64.b64decode(image_data_base64))
        
    print(f"이미지 저장 완료: {filepath}")
    return f"/static/images/{filename}"

@app.route('/api/generate', methods=['POST'])
def handle_generate_image():
    # --- 1. 프론트엔드로부터 데이터 받기 ---
    if 'imageFile' not in request.files:
        return jsonify({"error": "Image file is required."}), 400
    
    file = request.files['imageFile']
    form_data = request.form
    
    user_prompt = form_data.get('prompt', '')
    style = form_data.get('style', 'Modern')
    room_type = form_data.get('room_type', 'living room')
    overrides = json.loads(form_data.get('overrides', '{}'))

    # --- 2. 프롬프트 및 설정 조합 ---
    base_style_prompt = STYLE_PROMPTS.get(style, STYLE_PROMPTS['Modern'])
    formatted_style_prompt = base_style_prompt.format(room_type=room_type)
    positive_prompt = f"{user_prompt}, {formatted_style_prompt}, photorealistic, interior design magazine, 8k, high detail"
    
    generation_params = {**DEFAULT_GENERATION_PARAMS, **overrides.get('generation', {})}
    controlnet_params = {**DEFAULT_CONTROLNET_SETTINGS, **overrides.get('controlnet', {})}

    # --- 3. API Payload 생성 ---
    init_image_base64 = base64.b64encode(file.read()).decode('utf-8')

    payload = {
        "init_images": [init_image_base64],
        "prompt": positive_prompt,
        "negative_prompt": NEGATIVE_PROMPT,
        **generation_params,
        "alwayson_scripts": {
            "controlnet": {
                "args": [{
                    "enabled": True,
                    "input_image": init_image_base64,
                    **controlnet_params
                }]
            }
        }
    }
    
    # --- 4. 이미지 생성 및 결과 반환 ---
    generated_image_data, error_message = generate_sd_image(payload)
    
    if error_message:
        return jsonify({"error": error_message}), 500
        
    image_url = save_image(generated_image_data)
    
    full_image_url = f"http://localhost:5000{image_url}"
    return jsonify({"imageUrl": full_image_url})

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)