// 從unpkg.com導入Vue 3
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

const app = createApp({});

// 定義一個名為 'login-form' 的Vue組件
app.component('login-form', {
  template: '#loginFormTemplate', // 指定組件的模板ID
  data() {
    return {
      apiUrl: 'https://vue3-course-api.hexschool.io/v2', // API的基礎URL
      user: {
        username: '', // 使用者名稱
        password: '', // 密碼
      },
    };
  },
  methods: {
    login() {
      // 登錄方法
      if (!this.user.username || !this.user.password) {
        alert('用戶名和密碼不能為空'); // 校驗用戶名和密碼是否為空
        return;
      }
      const api = `${this.apiUrl}/admin/signin`;
      axios.post(api, this.user).then((response) => {
        // 發送POST請求到登錄API
        const { token, expired } = response.data; // 從響應中解構出token和過期時間
        document.cookie = `hexToken=${token};expires=${new Date(expired)}; path=/`; // 將token存儲到cookie中
        window.location = 'account-Products.html'; // 登錄成功後重定向到產品頁面
      }).catch((err) => {
        console.error(err); // 打印錯誤信息
        alert(err.response.data.message); // 顯示錯誤提示
      });
    },
  },
});

app.mount('#app'); // 將Vue應用掛載到id為'app'的元素上
