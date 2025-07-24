// vite.config.js
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    host: '0.0.0.0', // 모든 네트워크 인터페이스에서 접근 허용 (선택 사항, ngrok 사용 시 필수)
    port: 5173,      // 당신의 프론트엔드 개발 서버 포트
    strictPort: true, // 포트가 사용 중이면 자동 종료
    // ✨ 이 부분을 추가하거나 수정합니다.
    allowedHosts: [
      'localhost', // 기본적으로 localhost는 허용됩니다.
      '127.0.0.1', // 127.0.0.1도 기본적으로 허용됩니다.
      '85a2f704f7b2.ngrok-free.app', // ✨ ngrok이 할당한 현재 주소를 여기에 추가합니다.
      // ngrok 주소는 터널을 다시 열 때마다 바뀔 수 있으므로,
      // 매번 새로운 ngrok 주소를 여기에 추가하거나,
      // '*.ngrok-free.app' 같이 와일드카드를 사용할 수 있습니다.
      '*.ngrok-free.app', // ✨ 와일드카드 사용을 권장합니다. (단, 보안상 주의)
    ],
  },
    build: {
    rollupOptions: {
      external: ['lucide-react'], // ✨ 이 줄을 추가합니다.
    },
  },
})