from flask import Flask, jsonify, request
from flask_cors import CORS
import requests
import base64
import os
from datetime import datetime

app = Flask(__name__)
CORS(app)

SD_API_BASE_URL = "http://127.0.0.1:7860"

def generate_sd_image(prompt, init_image_base64, controlnet_settings):
    url = f"{SD_API_BASE_URL}/sdapi/v1/img2img"
    
    payload = {
        "init_images": [init_image_base64],
        "prompt": prompt,
        "steps": 30,
        "cfg_scale": 7,
        "width": 512,
        "height": 512,
        "sampler_name": "Euler a",
        "denoising_strength": 0.9,
        "alwayson_scripts": {
            "controlnet": {
                "args": [
                    {
                        "enabled": True,
                        "input_image": init_image_base64,
                        "module": controlnet_settings.get("module"),
                        "model": controlnet_settings.get("model"),
                        "weight": controlnet_settings.get("weight", 1.0),
                        "pixel_perfect": True,
                        "resize_mode": "Crop and Resize",
                        "control_mode": "Balanced",
                        "guidance_start": 0.0,
                        "guidance_end": 1.0,
                        # Canny 전용 파라미터 추가
                        "processor_res": 512,
                        "threshold_a": controlnet_settings.get("low_threshold"),
                        "threshold_b": controlnet_settings.get("high_threshold"),
                    }
                ]
            }
        }
    }
    
    print(f"'{prompt}' 프롬프트와 Canny ControlNet으로 img2img 요청...")
    response = requests.post(url=url, json=payload)
    
    if response.status_code == 200:
        r = response.json()
        image_data = r['images'][0]
        
        output_dir = os.path.join(app.static_folder, 'images')
        os.makedirs(output_dir, exist_ok=True)
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        filename = f"output_{timestamp}.png"
        filepath = os.path.join(output_dir, filename)
        
        with open(filepath, 'wb') as f:
            f.write(base64.b64decode(image_data))
            
        print(f"이미지 저장 완료: {filepath}")
        return f"/static/images/{filename}"
    else:
        print(f"API 오류 발생: {response.status_code}")
        print(response.text)
        return None

@app.route('/api/generate-image-from-file', methods=['POST'])
def handle_generate_from_file():
    if 'imageFile' not in request.files:
        return jsonify({"error": "이미지 파일이 없습니다."}), 400
    
    file = request.files['imageFile']
    prompt = request.form.get('prompt', 'a photorealistic, modern redesign')
    
    # --- 스크린샷의 Canny 설정을 여기에 반영 ---
    controlnet_settings = {
        "module": "canny",
        "model": "control_v11p_sd15_canny [d14c016b]",
        "weight": 1.0,
        "low_threshold": 100,  # Low Threshold 값
        "high_threshold": 200, # High Threshold 값
    }

    init_image_base64 = base64.b64encode(file.read()).decode('utf-8')
    
    image_url = generate_sd_image(prompt, init_image_base64, controlnet_settings)

    if image_url:
        full_image_url = f"http://localhost:5000{image_url}"
        return jsonify({"imageUrl": full_image_url})
    else:
        return jsonify({"error": "이미지 생성에 실패했습니다."}), 500

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5000, debug=True)