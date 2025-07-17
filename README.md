# Ai interior Remodeling 

🏠 프로젝트 소개
AI Interior Remodeling 프로젝트는 Stable Diffusion 기술을 활용하여 사용자의 기존 공간 이미지를 다양한 스타일로 손쉽게 리모델링하는 혁신적인 솔루션을 제공합니다. 단순한 이미지 변환을 넘어, 사용자의 프롬프트와 정교하게 튜닝된 파라미터 설정을 통해 현실적이면서도 창의적인 인테리어 디자인 아이디어를 시각적으로 구현해 드립니다.

우리의 목표는 복잡한 디자인 지식 없이도 누구나 자신의 공간을 상상 속에서 새롭게 꾸며볼 수 있도록 돕는 것입니다.

✨ 주요 기능 및 특징
AI 기반 인테리어 리모델링: 사용자의 공간 이미지를 업로드하고 원하는 스타일(예: 모던, 미니멀리즘, 북유럽 등)을 프롬프트로 입력하면 AI가 새로운 인테리어 이미지를 생성합니다.
정교한 파라미터 제어: Stable Diffusion의 핵심 파라미터인 Denoising Strength, CFG Scale, ControlNet Weight를 '리모델링' 컨셉에 최적화된 값으로 설정하여, 원본 이미지의 구조를 유지하면서도 원하는 변화를 정확하게 반영합니다.
'변화 강도' 슬라이더 (예정): 사용자 편의성을 극대화하기 위해, 복잡한 파라미터 조작 대신 '변화 강도' 슬라이더 하나로 '구조 유지'부터 '자유로운 변형'까지 원하는 리모델링 강도를 선택할 수 있도록 구현할 예정입니다.
낮음 (구조 유지): 원본의 복잡한 구조를 손상시키지 않고 스타일만 변경 (내부적으로 Denoising Strength 낮춤, ControlNet Weight 높임)
높음 (자유로운 변형): 원본 구조에서 벗어나 가구 배치 등이 변경되는 과감하고 창의적인 디자인 시도 (내부적으로 Denoising Strength 높임, ControlNet Weight 낮춤)
고품질 이미지 생성: Hires. fix와 같은 업스케일링 기법을 활용하여 512x512와 같은 기본 해상도에서도 선명하고 디테일한 고품질 이미지를 생성합니다.

💡 모델 소개 및 작동 원리
본 프로젝트의 핵심은 Stable Diffusion 모델과 ControlNet의 정교한 통합입니다. 
Stable Diffusion (img2img): 사용자가 업로드한 원본 이미지를 기반으로, 텍스트 프롬프트에 맞춰 새로운 이미지를 생성하는 img2img 기능을 활용합니다.
ControlNet (Canny): 원본 이미지의 외곽선(Canny Preprocessor)을 추출하여, 생성되는 이미지의 전체적인 구조와 형태가 원본에서 크게 벗어나지 않도록 강력한 제어력을 제공합니다.
파라미터 최적화 (리모델링 컨셉):
Denoising Strength (디노이징 강도): 0.75 - 원본의 구조를 유지하면서도 가구, 색감, 스타일 등이 자연스럽게 변경되는 최적의 균형점을 제공합니다. 0.75는 '내 공간 리모델링' 느낌을 가장 잘 살려주는 값으로 검증되었습니다.
CFG Scale (프롬프트 연관성): 7 - 사용자가 프롬프트로 지정한 '모던', '미니멀리즘', '화이트 톤' 등의 스타일 지시를 충실히 따르면서도 이미지의 자연스러움을 잃지 않는 최적값입니다.
Sampling Steps (샘플링 스텝): 30 - 속도와 이미지 품질 사이의 좋은 타협점을 제공하며, 충분히 높은 디테일과 완성도를 보장합니다.
Control Mode: "My prompt is more important" (기본) - 사용자의 프롬프트가 ControlNet의 구조 정보보다 우선시되어, 프롬프트에 따라 가구 및 스타일 변경이 적극적으로 이루어지도록 합니다. (단, 흐물거림 방지를 위해 Denoising Strength와 ControlNet Weight를 섬세하게 조절하여 보완합니다.)
ControlNet Weight:
My prompt is more important 모드에서는 0.7 ~ 1.0 (낮춰서 가구 변경 유도)
'구조 유지' 강도에서는 1.2 (높여서 구조 안정성 확보)
'자유로운 변형' 강도에서는 0.8 (낮춰서 AI 창의성 증대)
이러한 파라미터들의 시너지 효과를 통해, 사용자는 자신의 아이디어를 반영한 '리모델링' 이미지를 쉽고 효과적으로 얻을 수 있습니다.

🚀 시작하기
이 프로젝트를 로컬에서 실행하거나 사용하기 위한 기본 가이드라인입니다.
필수 조건:
Stable Diffusion Web UI (AUTOMATIC1111) 설치
ControlNet 확장 기능 설치
충분한 VRAM을 가진 GPU (최소 8GB 이상 권장)
설치:
Stable Diffusion Web UI를 실행합니다.
Extensions 탭에서 ControlNet을 설치하고 활성화합니다.
(선택 사항) 고해상도 이미지 생성을 위해 Tiled Diffusion 확장 기능을 설치합니다.
사용 방법:
img2img 탭으로 이동합니다.
리모델링하고 싶은 공간의 원본 이미지를 업로드합니다.
ControlNet 설정:
Enable 체크박스 활성화
Preprocessor: canny (또는 필요에 따라 depth, tile)
Model: control_v11p_sd15_canny [d14c016b] (사용 중인 ControlNet 모델 선택)
Pixel Perfect: 활성화
Control Mode: My prompt is more important (혹은 '변화 강도'에 따라 'Balanced', 'ControlNet is more important'로 조절)
Control Weight: 0.7 ~ 1.3 사이에서 Denoising Strength와 함께 조절하여 가구 변경 및 구조 유지 균형점 찾기
기본 생성 파라미터 설정:
Denoising strength: 0.75 (가구 변경을 원할 경우 0.8~0.85까지 시도)
CFG Scale: 7
Sampling steps: 30
Width, Height: 512x512 또는 768x768 (이후 Hires. fix로 업스케일링 권장)
프롬프트 작성: 원하는 인테리어 스타일과 가구, 색상 등을 구체적으로 명시합니다.
예시: A modern kitchen with white cabinetry, sleek design, wooden accents, abundant natural light, photorealistic, highly detailed
네거티브 프롬프트 작성: 원치 않는 요소(cluttered, messy, blurry, deformed, old-fashioned)를 추가합니다.
Generate 버튼을 클릭하여 이미지를 생성합니다.
