<template>
  <div class="selectContent" id="purchase">
    <!-- 有訂單時 -->
    <div class="list-group mb-4" v-if="orders.length">
      <div class="list-group-item mb-2" v-for="order in orders" :key="order.id">
        <div class="d-flex justify-content-between align-items-center">
          <div>
            <strong>訂單編號：</strong>#{{ order.id }}<br />
            <small class="text-muted">下單日期：{{ formatDate(order.created_at) }}</small>
          </div>
          <div class="text-end">
            <span :class="['badge', 'bg-' + statusColor(order.status)]">
              {{ order.status }}
            </span>
            <button class="btn btn-sm btn-outline-primary ms-2" data-bs-toggle="collapse"
              :data-bs-target="'#collapse' + order.id" aria-expanded="false" :aria-controls="'collapse' + order.id"
              @click="toggleCollapse(order.id)">
              {{ collapsedOrders.includes(order.id) ? '收起明細' : '查看明細' }}
            </button>
          </div>
        </div>

        <!-- 摺疊明細 -->
        <div :id="'collapse' + order.id" class="collapse mt-4">
          <div class="row" v-for="(item, index) in order.details" :key="index">
            <div class="col-5 book-link">
              <router-link :to="`/book/${item.ISBN_id}`">{{ item.name }}</router-link>
            </div>
            <div class="col-3 text-center">售價：{{ item.price }}</div>
            <div class="col-2 text-center">{{ item.qty }}本</div>
            <div class="col-2 text-end">小計：{{ item.subtotal }}</div>
          </div>
          <hr />
          <div class="text-end">
            <div>
              運費：
              <span class="fixed-width-number">{{ Math.floor(order.shipping_fee) }}</span>
            </div>
            <div>
              總計：
              <span class="fixed-width-number">{{ Math.floor(order.total) }}</span>
            </div>
          </div>

        </div>
      </div>
    </div>

    <!-- 沒有訂單時 -->
    <div v-else class="alert alert-secondary text-center">
      目前沒有任何訂單紀錄。
    </div>
  </div>
</template>

<script>
export default {
  name: 'PurchaseArea',
  data() {
    return {
      orders: [],
      collapsedOrders: []
    };
  },
  created() {
    this.fetchOrders();
  },
  methods: {
    fetchOrders() {
      const userId = localStorage.getItem('user_id');
      if (!userId) {
        console.error('使用者 ID 不存在');
        return;
      }

      this.$axios.get(`/api/memberPurchase/user/${userId}`)
        .then(res => {
          // console.log('前端接收到 data:', res.data);
          this.orders = res.data.data || [];
        })
        .catch((err) => {
          console.error('取得訂單失敗', err);
        });
    },
    formatDate(dateStr) {
      const date = new Date(dateStr);
      date.setHours(date.getHours() + 8); // 調整為台灣時間
      return date.toISOString().slice(0, 10); // 格式：YYYY-MM-DD
    },
    toggleCollapse(orderId) {
      if (this.collapsedOrders.includes(orderId)) {
        this.collapsedOrders = this.collapsedOrders.filter((id) => id !== orderId);
      } else {
        this.collapsedOrders.push(orderId);
      }
    },
    statusColor(status) {
      switch (status) {
        case 'pending':
          return 'warning';
        case 'shipped':
          return 'info';
        case 'settled':
          return 'success';
        case 'cancelled':
          return 'secondary';
        default:
          return 'light';
      }
    }
  }
};
</script>

<style scoped>
#purchase {
  padding: 20px;

  .collapse,
  .collapsing {
    hr {
      margin: 10px 0;
    }

  }


  /* 訂單書本連結 */
  .book-link {
    a {
      color: var(--main-color);
      text-decoration: none;
      cursor: pointer;
      transition: color 0.3s ease;

      &:hover {
        font-weight: bold;
        color: var(--main-colorlight);
        text-decoration: underline;
      }
    }
  }

  /* 訂單總結排版 */
  .fixed-width-number {
    display: inline-block;
    /* 預留5個字元的寬度 */
    width: 5ch;
    text-align: right;
  }



}
</style>