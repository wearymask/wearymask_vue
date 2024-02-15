import { createApp } from "https://unpkg.com/vue@3/dist/vue.esm-browser.js";

let addPM = null; // 用於存儲添加產品模態框的實例
let delPM = null; // 用於存儲刪除產品模態框的實例
let upPC = null; // 用於存儲刪除產品模態框的實例

createApp({
  data() {
    return {
      apiUrl: "https://vue3-course-api.hexschool.io/v2", // API 基礎 URL
      apiPath: "wearymask", // API 路徑
      products: [], // 存儲產品資料
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
    // 初始化Bootstrap的模態框實例
    addPM = new bootstrap.Modal(document.getElementById("addPM"), {
      keyboard: false,
    });
    delPM = new bootstrap.Modal(document.getElementById("delPM"), {
      keyboard: false,
    });
    upPC = new bootstrap.Modal(document.getElementById("UPPC"), {
      keyboard: false,
    });

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
          window.location = "index.html"; // 許可權驗證失敗，跳轉到登錄頁面
        });
    },

    // 獲取產品資料
    getData() {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/products`;
      axios
        .get(url)
        .then((response) => {
          this.products = response.data.products; // 存儲獲取的產品資料
        })
        .catch((err) => {
          alert(err.response.data.message); // 顯示錯誤資訊
        });
    },

    // 打開產品詳細資訊
    openProduct(item) {
      this.tempProduct = item; // 存儲選中的產品資訊
    },

    // 更新產品資訊
    updateProduct() {
      let url = `${this.apiUrl}/api/${this.apiPath}/admin/product`;
      let http = "post";
      if (!this.isNew) {
        url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;
        http = "put";
      }
      axios[http](url, { data: this.tempProduct })
        .then((response) => {
          alert(response.data.message);
          addPM.hide();
          this.getData(); // 更新資料後重新獲取產品資料
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },

    // 打開模態框（新增、編輯、刪除）
    openModal(isNew, item) {
      if (isNew === "new") {
        this.tempProduct = { imagesUrl: [] };
        this.isNew = true;
        addPM.show(); // 顯示添加產品模態框
      } else if (isNew === "edit") {
        this.tempProduct = { ...item };
        this.isNew = false;
        addPM.show(); // 顯示編輯產品模態框
      } else if (isNew === "delete") {
        this.tempProduct = { ...item };
        delPM.show(); // 顯示刪除產品模態框
      }
    },

    // 刪除產品
    delProduct() {
      const url = `${this.apiUrl}/api/${this.apiPath}/admin/product/${this.tempProduct.id}`;
      axios
        .delete(url)
        .then((response) => {
          alert(response.data.message);
          delPM.hide();
          this.getData(); // 刪除產品後重新獲取產品資料
        })
        .catch((err) => {
          alert(err.response.data.message);
        });
    },

    // 創建圖片連結陣列
    createImages() {
      this.tempProduct.imagesUrl = [];
      this.tempProduct.imagesUrl.push(""); // 添加一個空字串以便於前端處理
    },
    // 創建圖片連結陣列
    showUpdateImage() {
      upPC.show(); // 顯示刪除產品模態框
    },
    UpdateImage(event) {
      console.log("HIHI");
      console.log(event);
      // 獲取文件
      const selectedFile = event.target.files[0];

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
            headers: {
              "Content-Type": "multipart/form-data",
            },
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
      //https://storage.googleapis.com/vue-course-api.appspot.com/wearymask/1707116568558.png?GoogleAccessId=firebase-adminsdk-zzty7%40vue-course-api.iam.gserviceaccount.com&Expires=1742169600&Signature=Y3KTRenOodef0mFcSXr2NJzNj19A16%2BtqKA0ZA05k6D20lwqSno%2BncstofTIEMhS7lXM2fWRqDV9MfzK%2BMKJ568dZhMjk%2B2UOV4i8nrx02HyxxLPpHJDEsSJsGQXac5%2FkoSP7a2vt9rBrx4urFNd9wrEf86cgqGn7pYXNe2HmanU6ZyuNucUR%2Fw%2Fu%2BRvaw5aJWUZR21m2NN7eXzZe7d1GVV9OioboecKavEVwJAtZ%2F1XYNCXhwstKwcbJxAmzE%2FO2TFWUVudNw7zRVaQie3VHkk4%2FNwWTcItRcKZueN1Ob1ZNF6%2FDQGqPHXB3d9tlmcRqi3fc8owahGzppOb6JqQMg%3D%3D
      //https://storage.googleapis.com/vue-course-api.appspot.com/wearymask/1707116598322.png?GoogleAccessId=firebase-adminsdk-zzty7%40vue-course-api.iam.gserviceaccount.com&Expires=1742169600&Signature=l83DVpklyehFYWt8EMhZBKczEuMIOKFSPLO5yESY%2BRyBSUqYP7ecZrm%2F38upV%2BAjfQ6I7Ale64%2FHsQbdl8ypwI2h0OBRKOkKOYz9rHK7%2BeIv%2FfIrp7v6BVRqDVhh08lEqH%2BgAGeHeLTpPBpbUlywd%2BbQVKIsi4GavmNXdKYClnxQwcxPRZl1PWKMV3MlYWCsBJ9QTTP3ri%2BsTaJnuS6SbpJ3LZpMxGZENrF4M0dw2lcuuhjA%2BfLzxT%2FLZBYMQ6eymUG1kctkxBkrwZFnzOqFH1sA0O3J1a2jKdiYOWaiO4VU%2FqmYuXt%2FS4jdB1keLCwAYIEhqLrq7PBpe%2FiwICv4gw%3D%3D
      //https://storage.googleapis.com/vue-course-api.appspot.com/wearymask/1707114196496.png?GoogleAccessId=firebase-adminsdk-zzty7%40vue-course-api.iam.gserviceaccount.com&Expires=1742169600&Signature=AZAa55vZNAVVV4odxvO2xDy0FxLDCd9on1gxmyK1%2F8PSMz1MnBtQf6qas9rXJ4FeEiyr5Ujht71m8ySjdDoIYZMpYj34MzBwITIH6AkIMwQ8zuxaAtdnjjB0RymHWY0RlGRNw7lOOCUOCELSvckb9onWzaYrpN5bmHtbCA03h5w1Xxyc%2BrkSFuwnmBE67BBnxXoUq5EmJoMwmNgW%2BgPAPOJrgZeZ9SIsfaV10voGSFdU6AfyGSe9ioBJDsLJyqWoLoThYe9Qg6%2BAGTvGBK51r44VmCXI42lT8%2FjpQApBuS5SusdG5BsGqVmy9gq4J4pUo6JznssNyc%2FMOnSi2TW%2ByA%3D%3D
      //https://storage.googleapis.com/vue-course-api.appspot.com/wearymask/1707113736918.png?GoogleAccessId=firebase-adminsdk-zzty7%40vue-course-api.iam.gserviceaccount.com&Expires=1742169600&Signature=hnwAb%2BKzVIZQlVtwyr%2BwB%2FCwfb0sykCoCCQVvbjjhLpNEpu8xzv%2Bh8NrEQeceFZzZ%2BvgKT%2FD%2FHXGoV5Yr9V2gX1pOUNQrmw%2FNnLoN7L24sX%2FolBsU7SESADo4Yi52nYE5ymtLifNJfKPVie3VDqBQ5LKOe277obzCHn%2Fcio9yjd3aeclkfF%2BigKvEle3RcdH0ZS1rmQnsFZcMcTmWTWkH6f9GA3i7zHMj0Znlsjt6FG4bYoBKpGN%2B9JwxTPbwMkqASe%2FKGoeWhvk2jSb3HpNwOnfSI2OXTSSO5cx6vKBuGzNPcjdNbCe7wbTtV4QdKlIRbZSDjg56l1f7q%2B5uf4R0Q%3D%3D
    },
    copyImageUrl() {
      this.tempProduct.imagesUrl = [...this.updateimagesUrl]; // 複製 updateimagesUrl 到 tempProduct.imagesUrl
      this.updateimagesUrl = []; // 清空 updateimagesUrl
      this.reset(); // 重置
      upPC.hide(); // 關閉模態框
    },
    reset() {
      const fileInput = document.getElementById("unp-product-files");
      if (fileInput) {
        fileInput.value = ""; // 重置檔輸入欄位
      }
    },

    // 登出
    logout() {
      const url = `${this.apiUrl}/logout`;
      axios
        .post(url)
        .then(() => {
          window.location = "index.html"; // 跳轉到登錄頁面
        })
        .catch((err) => {
          alert(err.response.data.message); // 顯示錯誤資訊
          window.location = "index.html"; // 登出失敗也跳轉到登錄頁面
        });
    },
  },
}).mount("#app");
