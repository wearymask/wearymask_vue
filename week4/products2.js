import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

let addProductModal = null; // 用於存儲添加產品模態框的實例
let delProductModal = null; // 用於存儲刪除產品模態框的實例
let shoProductModal = null;
let UPProduct = null;

let apiU = "https://vue3-course-api.hexschool.io/v2";
let apiP = "wearymask";
let locationView = "index.html";

const app = createApp({
  data() {
    return {
      apiUrl: apiU, // API 基礎 URL
      apiPath: apiP, // API 路徑
      products: [], // 存儲產品資料
      pagination: {},
      suid: "", // 存儲使用者ID
      isNew: false, // 判斷是新建還是編輯產品
      currentYear: new Date().getFullYear(), // 當前年份，用於版權聲明
      updateimagesUrl: [],
      tempProduct: {
        imagesUrl: [],
      }, // 臨時存儲選中的產品資訊
    };
  },
  mounted() {
    // 從 Cookie 中提取 Token 並設置 Axios 的默認請求頭，包含 Token
    const token = document.cookie.replace(
      /(?:(?:^|.*;\s*)hexToken\s*=\s*([^;]*).*$)|^.*$/,
      "$1"
    );
    axios.defaults.headers.common.Authorization = token;
    this.checkAdmin(); // 元件掛載時，檢查管理員許可權
  },
  methods: {
    // 檢查管理員許可權
    checkAdmin() {
      const url = `${this.apiUrl}/api/user/check`;
      axios
        .post(url)
        .then((response) => {
          if (response.data.success) {
            this.suid = response.data.uid;
          }
          this.getData(); // 如果許可權驗證成功，獲取產品資料
        })
        .catch((err) => {
          alert(err.response.data.message); // 顯示錯誤資訊
          window.location = locationView; // 許可權驗證失敗，跳轉到登錄頁面
        });
    },

    // 獲取產品資料
    getData(page = 1) {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/products?page=${page}`;
      axios
        .get(url)
        .then((response) => {
          const { products, pagination } = response.data;
          this.products = products;
          this.pagination = pagination;
        })
        .catch((err) => {
          alert(err.response.data.message); // 顯示錯誤資訊
          window.location = locationView; // 許可權驗證失敗，跳轉到登錄頁面
        });
    },

    // 打開模態框（新增、編輯、刪除）
    openModal(isNew, item) {
      if (isNew === "new") {
        this.tempProduct = { imagesUrl: [] };
        this.isNew = true;
        addProductModal.show(); // 顯示添加產品模態框
      } else if (isNew === "edit") {
        this.tempProduct = { ...item };
        this.isNew = false;
        addProductModal.show(); // 顯示編輯產品模態框
      } else if (isNew === "delete") {
        this.tempProduct = { ...item };
        delProductModal.show(); // 顯示刪除產品模態框
      } else if (isNew === "show") {
        this.tempProduct = { ...item };
        shoProductModal.show();
      } else if (isNew === "UpdateImage") {
        UPProduct.show();    
      }

      
    },

    // 登出
    logout() {
      const url = `${this.apiUrl}/logout`;
      axios
        .post(url)
        .then(() => {
          window.location = locationView; // 跳轉到登錄頁面
        })
        .catch((err) => {
          alert(err.response.data.message); // 顯示錯誤資訊
          window.location = locationView; // 登出失敗也跳轉到登錄頁面
        });
    },
  },
});

app.component("pagination", {
  template: "#pagination",
  props: ["pages"],
  methods: {
    emitPages(item) {
      this.$emit("emit-pages", item);
    },
  },
});

app.component("addProductModal", {
  template: "#addProductModal",
  props: ["product", "isNew"],
  data() {
    return {
      apiUrl: apiU,
      apiPath: apiP,
    };
  },
  mounted() {
    // 初始化Bootstrap的模態框實例
    addProductModal = new bootstrap.Modal(
      document.getElementById("addProductModal"),
      {
        keyboard: false,
        backdrop: "static",
      }
    );
  },
  methods: {
    // 更新產品資訊
    updateProduct() {
      let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
      let http = "post";
      if (!this.isNew) {
        url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.product.id}`;
        http = "put";
      }
      axios[http](url, { data: this.product })
        .then((response) => {
          alert(response.data.message);
          this.hideModal();
          this.$emit("update");
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    UpdateImage(){
      this.$root.openModal('UpdateImage');
    },
    // 創建圖片連結陣列
    createImages() {
      this.product.imagesUrl = [];
      this.product.imagesUrl.push(""); // 添加一個空字串以便於前端處理
    },
    openModal() {
      addProductModal.show();
    },
    hideModal() {
      addProductModal.hide();
    },
  },
});

app.component("delProductModal", {
  template: "#delProductModal",
  props: ["item"],
  data() {
    return {
      apiUrl: apiU,
      apiPath: apiP,
    };
  },
  mounted() {
    // 初始化Bootstrap的模態框實例
    delProductModal = new bootstrap.Modal(
      document.getElementById("delProductModal"),
      {
        keyboard: false,
        backdrop: "static",
      }
    );
  },
  methods: {
    // 刪除產品
    delProduct() {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.item.id}`;
      axios
        .delete(url)
        .then((response) => {
          alert(response.data.message);
          this.hideModal();
          this.$emit("update");
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },
    openModal() {
      delProductModal.show();
    },
    hideModal() {
      delProductModal.hide();
    },
  },
});

app.component("shoProductModal", {
  template: "#shoProductModal",
  props: ["item"],
  data() {
    return {
      apiUrl: apiU,
      apiPath: apiP,
    };
  },
  mounted() {
    // 初始化Bootstrap的模態框實例
    shoProductModal = new bootstrap.Modal(
      document.getElementById("shoProductModal"),
      {
        keyboard: false,
        backdrop: "static",
      }
    );
  },
  methods: {
    openModal() {
      shoProductModal.show();
    },
    hideModal() {
      shoProductModal.hide();
    },
  },
});

app.component("update-image-modal", {
  template: "#updateImageModalTemplate",
  data() {
    return {
      apiUrl: apiU,
      apiPath: apiP,
      updateimagesUrl: [], // 用于存储上传图片的URL
    };
  },
  mounted() {
    // 初始化Bootstrap的模態框實例
    UPProduct = new bootstrap.Modal(document.getElementById("UPProduct"), {
      keyboard: false,
      backdrop: "static",
    });
  },
  methods: {

    copyImageUrl() {
      this.$root.tempProduct.imagesUrl = [...this.updateimagesUrl]; // 複製 updateimagesUrl 到 tempProduct.imagesUrl
      this.updateimagesUrl = []; // 清空 updateimagesUrl
      this.reset(); // 重置
      this.hideModal();
    },
    reset() {
      const fileInput = document.getElementById("unp-product-files");
      if (fileInput) {
        fileInput.value = ""; // 重置檔輸入欄位
      }
    },
    uploadImage(file) {
      // 这里应实现图片上传的逻辑，返回Promise
      console.log("HIHI");
      console.log(file);
      // 獲取文件
      const selectedFile = file.target.files[0];
      // 檢查檔是否存在
      if (selectedFile) {
        // 檢查檔大小是否超過3MB
        if (selectedFile.size > 3145728) {
          alert("檔大小不能超過3MB");
          return;
        }
        // 檢查檔案類型是否正確
        if (!["image/jpeg", "image/png"].includes(selectedFile.type)) {
          alert("檔案類型必須是 JPG 或 PNG");
          return;
        }
        // 創建 FormData 對象
        const formData = new FormData();
        formData.append("file", selectedFile);

        // 設置上傳的 URL
        const url = `${this.apiUrl}/api/${this.apiPath}/admin/upload`;
        console.log(url);

        // 使用 Axios 發起上傳請求
        axios
          .post(url, formData, {
            headers: { "Content-Type": "multipart/form-data" },
          })
          .then((response) => {
            console.log(response);
            // 上傳成功
            if (response.data.success) {
              this.updateimagesUrl.push(response.data.imageUrl); // 保存連結到 updateimagesUrl
              this.reset(); // 重置
              alert("上傳成功");
            } else {
              this.reset(); // 重置
              alert("上傳失敗");
            }
          })
          .catch((error) => {
            // 上傳失敗
            console.log(error);
            this.reset(); // 重置
            alert(error.response.data.message);
          });
      } else {
        alert("請選擇一個檔");
        this.reset(); // 重置
      }
    },
    openModal() {
      UPProduct.show();
    },
    hideModal() {
      UPProduct.hide();
    },
  },
});

app.mount("#app");
