import { createApp } from 'https://unpkg.com/vue@3/dist/vue.esm-browser.js';

createApp({
  data() {
    return {
      apiUrl: 'https://vue3-course-api.hexschool.io/v2',  // API 基礎 URL
      apiPath: 'wearymask',  // API 路徑
      products: [],  // 存儲產品資料
      tempProduct: {},  // 臨時存儲選中的產品資訊
    }
  },
  methods: {
    // 檢查管理員許可權
    checkAdmin() {
      const url = `${this.apiUrl}/api/user/check`;
      axios.post(url)
        .then(() => {
          this.getData();  // 如果許可權驗證成功，獲取產品資料
        })
        .catch((err) => {
          alert(err.response.data.message);  // 顯示錯誤資訊
          window.location = 'index.html';  // 許可權驗證失敗，跳轉到登錄頁面
        })
    },
    // 獲取產品資料
    getData() {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/products`;
      axios.get(url)
        .then((response) => {
          this.products = response.data.products;  // 存儲獲取的產品資料
        })
        .catch((err) => {
          alert(err.response.data.message);  // 顯示錯誤資訊
        })
    },
    // 打開產品詳細資訊
    openProduct(item) {
      this.tempProduct = item;  // 存儲選中的產品資訊
    },
    // logout
    logout() {
      const url = `${this.apiUrl}/logout`;
      axios.post(url)
        .then(() => {
          window.location = 'index.html';  // 跳轉到登錄頁面
        })
        .catch((err) => {
          alert(err.response.data.message);  // 顯示錯誤資訊
          window.location = 'index.html';  // 跳轉到登錄頁面
        })
    }
  },
  mounted() {
    // 從 Cookie 中提取 Token
    const token = document.cookie.replace(/(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/, '$1');
    axios.defaults.headers.common.Authorization = token;  // 設置 Axios 的默認請求頭，包含 Token

    this.checkAdmin();  // 元件掛載時，檢查管理員許可權
  }
}).mount('#app');