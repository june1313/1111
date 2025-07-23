from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import base64
import os # 이 모듈은 더 이상 파일 저장에 필요하지 않으므로, 완전히 제거해도 무방하나, 다른 용도로 사용될 가능성 고려하여 일단 둠
from datetime import datetime # 이 모듈은 더 이상 파일 저장에 필요하지 않으므로, 완전히 제거해도 무방하나, 다른 용도로 사용될 가능성 고려하여 일단 둠
import json

# ==============================================================================
# ✨ 1. 설정 영역 (Configuration Area)
# ==============================================================================

# 네거티브 프롬프트
NEGATIVE_PROMPT = "worst quality, low quality, jpeg artifacts, blurry, distorted, ugly, tiling, poorly drawn, disfigured, out of frame, extra limbs, amateur photography, gloomy, bad anatomy, watermark, text, signature, clutter, messy, low-resolution, cars"

# ------------------------------------------------------------------------------
# ✨ 1-1. 인테리어 설정 (Canny 사용)
# ------------------------------------------------------------------------------
INTERIOR_STYLE_PROMPTS = {
    "Modern": "(Modern style:1.2) interior design, a bright and clean {room_type}, sleek furniture, (neutral color palette with a bold accent color:1.1), large windows with natural light, polished concrete floors, statement art piece on the wall",
    "Minimalist": "(Minimalist style:1.3) interior design, an uncluttered and serene {room_type}, essential furniture only, monochromatic color scheme, soft ambient lighting, clean lines, simplicity, organized, ample negative space",
    "Scandinavian": "(Scandinavian style:1.2) interior design, a cozy and functional {room_type}, (light wood elements:1.1), white walls, natural materials, minimalist decor, hygge atmosphere, clean and bright",
    "Bohemian": "(Bohemian style:1.2) interior design, an eclectic and vibrant {room_type}, (rich patterns and textures:1.1), macrame wall hangings, lots of indoor plants, vintage furniture, warm and earthy tones, layered rugs",
    "Industrial": "(Industrial style:1.2) interior design, a spacious {room_type}, (exposed brick wall:1.1), metal light fixtures, visible ductwork, leather sofa, concrete floor, a mix of wood and metal elements",
    "Coastal": "(Coastal style:1.1) interior design, an airy and relaxing {room_type}, light blue and sand color palette, natural materials like wicker and light wood, large open windows with sheer curtains, clean and fresh"
}

# ------------------------------------------------------------------------------
# ✨ 1-2. 익스테리어 설정 (Multi-ControlNet: MLSD + Depth)
# ------------------------------------------------------------------------------
EXTERIOR_STYLE_PROMPTS = {
    "Modern Minimalist": "masterpiece, best quality, ultra-realistic photo, architectural photography of a fully renovated {exterior_type}, modern minimalist architecture, clean lines, isolated building, single building, black steel window frames, located on a clean urban street, daytime, soft natural lighting, sharp focus, 8k",
    "Classic Grandeur": "masterpiece, best quality, ultra-realistic photo, architectural photography of a grand {exterior_type}, classic european architecture, stone facade, ornate details, symmetrical design, dramatic lighting, sharp focus, 8k",
    "Futuristic Concept": "masterpiece, best quality, ultra-realistic photo, architectural photography of a futuristic {exterior_type}, sleek metallic surfaces, glowing neon accents, unconventional geometric shapes, concept art, cinematic lighting, sharp focus, 8k"
}

# ==============================================================================
# ✨ 2. Flask 앱 및 API 로직
# ==============================================================================

app = Flask(__name__)
CORS(app)
SD_API_BASE_URL = "http://127.0.0.1:7860" # Stable Diffusion API 주소

def generate_sd_image(payload):
    """Stable Diffusion API를 호출하여 이미지 생성을 요청합니다."""
    url = f"{SD_API_BASE_URL}/sdapi/v1/img2img"
    try:
        print("Stable Diffusion 서버에 이미지 생성을 요청합니다...")
        print(json.dumps(payload, indent=2)) # 페이로드 로그 출력
        response = requests.post(url=url, json=payload, timeout=300)
        response.raise_for_status()
    except requests.exceptions.Timeout:
        return None, "Image generation server timed out."
    except requests.exceptions.RequestException as e:
        return None, f"Could not connect to the image generation server: {e}"
    r = response.json()
    return r['images'][0], None

@app.route('/api/generate', methods=['POST'])
def handle_generate_image():
    if 'imageFile' not in request.files:
        return jsonify({"error": "Image file is required."}), 400
    
    file = request.files['imageFile']
    form_data = request.form
    
    tool = form_data.get('tool', 'Interior')
    user_prompt = form_data.get('prompt', '')
    style = form_data.get('style', 'Modern')
    overrides = json.loads(form_data.get('overrides', '{}'))

    init_image_base64 = base64.b64encode(file.read()).decode('utf-8')
    
    if tool == 'Exterior':
        exterior_type = form_data.get('exterior_type', 'commercial building')
        base_style_prompt = EXTERIOR_STYLE_PROMPTS.get(style, EXTERIOR_STYLE_PROMPTS['Modern Minimalist'])
        positive_prompt = f"{user_prompt}, {base_style_prompt.format(exterior_type=exterior_type)}"
        
        controlnet_args = [
        {
            "enabled": True, "input_image": init_image_base64, "pixel_perfect": True,
            "module": "mlsd", "model": "control_v11p_sd15_mlsd [aca30ff0]",
            "weight": 1.3,
            "control_mode": "ControlNet is more important",
            "threshold_a": 0.1, "threshold_b": 0.1,
        },
        {
            "enabled": True, "input_image": init_image_base64, "pixel_perfect": True,
            "module": "depth_midas", "model": "control_v11f1p_sd15_depth [cfd03158]",
            "weight": 1.3,
            "control_mode": "ControlNet is more important",
        }
    ]
        
    else: # --- 인테리어 로직 (Canny) ---
        room_type = form_data.get('room_type', 'living room')
        base_style_prompt = INTERIOR_STYLE_PROMPTS.get(style, INTERIOR_STYLE_PROMPTS['Modern'])
        positive_prompt = f"{user_prompt}, {base_style_prompt.format(room_type=room_type)}"
        
        controlnet_args = [{
            "enabled": True, "input_image": init_image_base64, "pixel_perfect": True,
            "module": "canny", "model": "control_v11p_sd15_canny [d14c016b]",
            "weight": 1.2,
            "low_threshold": 100, "high_threshold": 200,
            "resize_mode": "Crop and Resize",
            "control_mode": "My prompt is more important",
        }]

    # --- 공통 페이로드 생성 ---
    generation_params = { "steps": 20, "cfg_scale": 7, "width": 512, "height": 512, "sampler_name": "DPM++ 2M Karras", "denoising_strength": 0.8 }
    
    payload = {
        "init_images": [init_image_base64],
        "prompt": positive_prompt,
        "negative_prompt": NEGATIVE_PROMPT,
        **generation_params,
        "alwayson_scripts": {
            "controlnet": {
                "args": controlnet_args
            }
        }
    }
    
    generated_image_data, error_message = generate_sd_image(payload)
    
    if error_message:
        return jsonify({"error": error_message}), 500
        
    # 여기에서 save_image 호출을 제거합니다.
    full_image_url = f"data:image/png;base64,{generated_image_data}"

    return jsonify({"imageUrl": full_image_url})

if __name__ == '__main__':
    # Flask 앱이 시작될 때 기본적으로 정적 파일을 처리하는 방식은 유지합니다.
    app.run(host='0.0.0.0', port=5000, debug=True)