# Ai interior Remodeling 

AI Interior Remodeling
🏠 프로젝트 소개
Stable Diffusion AI로 당신의 공간을 쉽고 현실적으로 리모델링합니다.

✨ 주요 특징
AI 리모델링: 이미지와 프롬프트로 새로운 인테리어 디자인 생성.
정교한 제어: Denoising Strength, CFG Scale, ControlNet Weight 조절로 원하는 변화 구현.

💡 작동 원리 (핵심)
Stable Diffusion (img2img): 원본 이미지 변환.
ControlNet (Canny): 원본 구조 유지.
Control Mode: 프롬프트 또는 ControlNet 중 어떤 것을 더 중요하게 따를지 결정.

🚀 빠른 시작 가이드
준비: Stable Diffusion Web UI 및 ControlNet 설치.
사용:
img2img 탭에서 원본 이미지 업로드.
ControlNet 설정: Enable, Preprocessor (canny 등), Pixel Perfect 활성화.
파라미터 조절:
AI가 얼마나 원본을 바꿀지 (Denoising Strength).
프롬프트 지시를 얼마나 따를지 (CFG Scale).
원본 구조를 얼마나 유지할지 (ControlNet Weight, Control Mode).
프롬프트로 원하는 스타일과 요소 입력 (예: '모던 화이트 주방').
Generate 클릭
