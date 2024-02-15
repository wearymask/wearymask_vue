// 從unpkg.com導入Vue 3
import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

// 創建Vue應用
createApp({
  // 資料函數返回一個物件，其中包含使用者的用戶名和密碼
  data() {
    return {
      apiUrl: 'https://vue3-course-api.hexschool.io/v2',
      user: {
        username: '',
        password: '',
      },
    }
  },
  // methods物件包含所有的方法
  methods: {
    // 登錄函數
    login() {
      if (!this.user.username || !this.user.password) {
        alert('用戶名和密碼不能為空');
        return; // 如果任何一個字段為空，則不進行後續操作
      }
      // API的網址
      //const api = 'https://vue3-course-api.hexschool.io/v2/admin/signin';
      const api = `${this.apiUrl}/admin/signin`;
      // 使用axios發送POST請求到API，帶上使用者的用戶名和密碼
      axios.post(api, this.user).then((response) => {
        // 從回應中解構出token和過期時間
        const { token, expired } = response.data;
        // 將token寫入cookie，並設置過期時間
        document.cookie = `hexToken=${token};expires=${new Date(expired)}; path=/`;
        // 登錄成功後跳轉到產品頁面
        //window.location = 'products.html';
        window.location = 'account-Products.html';
        
      }).catch((err) => {
        // 如果有錯誤，將錯誤列印到控制台並彈出錯誤消息
        console.log(err)
        alert(err.response.data.message);
      });
    },
  },
  // 將Vue應用掛載到id為app的元素上
}).mount('#app');