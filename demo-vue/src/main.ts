import { createApp } from 'vue'

// 从 @aspect/creator-ui-kit 导入 UI Kit
// 这会自动注册所有 Web Components 并加载全局样式
import '@aspect/creator-ui-kit'

// 导入本地样式（可选的额外样式）
import './styles/index.css'

// 导入主应用
import App from './App.vue'

// 创建应用
const app = createApp(App)

// 挂载应用
app.mount('#app')
