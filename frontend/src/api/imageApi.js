const API_URL = 'http://localhost:5000/api/generate';

export async function generateImage(formData) {
  const response = await fetch(API_URL, {
    method: 'POST',
    body: formData,
  });

  if (!response.ok) {
    const errData = await response.json();
    throw new Error(errData.error || '이미지 생성에 실패했습니다.');
  }

  return response.json();
}