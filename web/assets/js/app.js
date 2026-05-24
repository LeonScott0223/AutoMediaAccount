(function ($) {
  "use strict";

  var STORE_KEY = "auto-account-orders";
  var USER_KEY = "auto-account-user";
  var USERS_KEY = "auto-account-users";
  var PENDING_PAYMENT_KEY = "auto-account-pending-payment";
  var page = $("body").data("page");
  var state = {
    category: "全部",
    platform: "全部",
    keyword: "",
    sort: "default",
    certification: "all",
    minPrice: "",
    maxPrice: ""
  };

  function initAOS() {
    if (window.AOS) {
      AOS.init({
        duration: 650,
        easing: "ease-out-cubic",
        once: true,
        offset: 30
      });
    }
  }

  function formatPrice(price) {
    return "\u00a5" + Number(price).toFixed(0);
  }

  function formatCountdown(seconds) {
    var minutes = String(Math.floor(seconds / 60)).padStart(2, "0");
    var remainSeconds = String(seconds % 60).padStart(2, "0");
    return minutes + ":" + remainSeconds;
  }

  function isPhone(value) {
    return /^1\d{10}$/.test(value);
  }

  function isEmail(value) {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
  }

  function getQueryParam(name) {
    return new URLSearchParams(window.location.search).get(name);
  }

  function getProducts() {
    return window.AutoAccountData.products || [];
  }

  function getProductById(id) {
    return getProducts().find(function (item) {
      return item.id === id;
    });
  }

  function getDemoOrders() {
    return window.AutoAccountData.demoOrders || [];
  }

  function getPaymentMethods() {
    return window.AutoAccountData.paymentMethods || [];
  }

  function generateOrderId() {
    return "SG" + dayjs().format("YYYYMMDDHHmmss");
  }

  function getOrders() {
    try {
      var saved = localStorage.getItem(STORE_KEY);
      return saved ? JSON.parse(saved) : [];
    } catch (error) {
      return [];
    }
  }

  function saveOrders(orders) {
    localStorage.setItem(STORE_KEY, JSON.stringify(orders));
  }

  function pushOrder(order) {
    var orders = getOrders();
    orders.unshift(order);
    saveOrders(orders);
  }

  function getUsers() {
    try {
      var saved = localStorage.getItem(USERS_KEY);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (error) {
      return [];
    }
    return (window.AutoAccountData.users || []).slice();
  }

  function saveUsers(users) {
    localStorage.setItem(USERS_KEY, JSON.stringify(users));
  }

  function getCurrentUser() {
    try {
      var saved = localStorage.getItem(USER_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  }

  function saveCurrentUser(user) {
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  function clearCurrentUser() {
    localStorage.removeItem(USER_KEY);
  }

  function getPendingPayment() {
    try {
      var saved = localStorage.getItem(PENDING_PAYMENT_KEY);
      return saved ? JSON.parse(saved) : null;
    } catch (error) {
      return null;
    }
  }

  function savePendingPayment(payment) {
    localStorage.setItem(PENDING_PAYMENT_KEY, JSON.stringify(payment));
  }

  function clearPendingPayment() {
    localStorage.removeItem(PENDING_PAYMENT_KEY);
  }

  function renderHeaderAuth() {
    var currentUser = getCurrentUser();
    var html = "";

    if (currentUser) {
      html = '' +
        '<div class="header-user-chip">' +
          '<i class="bi bi-person-circle"></i>' +
          "<span>" + currentUser.nickname + "</span>" +
        "</div>";
    } else {
      html = '<a class="nav-chip nav-chip-outline" href="auth.html?mode=login">登录 / 注册</a>';
    }

    $("[data-auth-slot]").html(html);
  }

  function renderNoticeList() {
    var notices = window.AutoAccountData.notices || [];
    var html = notices.map(function (item) {
      return (
        '<article class="notice-item">' +
          "<div>" +
            "<strong>" + item.title + "</strong>" +
            "<p>" + item.content + "</p>" +
          "</div>" +
          "<span>" + item.time + "</span>" +
        "</article>"
      );
    }).join("");

    $("#noticeList").html(html);
  }

  function renderCategoryFilters() {
    var categories = window.AutoAccountData.categories || [];
    var html = categories.map(function (item) {
      var active = item === state.category ? "active" : "";
      return '<button class="filter-pill ' + active + '" type="button" data-category="' + item + '">' + item + "</button>";
    }).join("");

    $("#categoryFilters").html(html);
  }

  function renderPlatformFilters() {
    syncDrawerForm();
  }

  function getFilteredProducts() {
    var keyword = state.keyword.toLowerCase();
    var minPrice = Number(state.minPrice || 0);
    var maxPrice = Number(state.maxPrice || 0);
    var products = getProducts().filter(function (item) {
      var matchesCategory = state.category === "全部" || item.category === state.category;
      var matchesPlatform = state.platform === "全部" || item.platform === state.platform;
      var matchesKeyword = !keyword ||
        item.title.toLowerCase().indexOf(keyword) > -1 ||
        item.subtitle.toLowerCase().indexOf(keyword) > -1 ||
        item.platform.toLowerCase().indexOf(keyword) > -1;
      var matchesMinPrice = !minPrice || item.price >= minPrice;
      var matchesMaxPrice = !maxPrice || item.price <= maxPrice;
      var matchesCertification = true;

      if (state.certification === "certified") {
        matchesCertification = item.certified;
      } else if (state.certification === "uncertified") {
        matchesCertification = !item.certified;
      } else if (state.certification === "custom") {
        matchesCertification = item.certificationMode === "可自定义实名";
      }

      return matchesCategory && matchesPlatform && matchesKeyword && matchesMinPrice && matchesMaxPrice && matchesCertification;
    });

    if (state.sort === "price_desc") {
      products.sort(function (a, b) { return b.price - a.price; });
    } else if (state.sort === "price_asc") {
      products.sort(function (a, b) { return a.price - b.price; });
    } else if (state.sort === "fans_desc") {
      products.sort(function (a, b) { return b.fansValue - a.fansValue; });
    } else if (state.sort === "fans_asc") {
      products.sort(function (a, b) { return a.fansValue - b.fansValue; });
    } else if (state.sort === "likes_desc") {
      products.sort(function (a, b) { return b.likesValue - a.likesValue; });
    } else if (state.sort === "likes_asc") {
      products.sort(function (a, b) { return a.likesValue - b.likesValue; });
    }

    return products;
  }

  function buildProductCard(product) {
    var certClass = product.certified ? "status-chip" : "stock-chip";
    return (
      '<article class="product-card" data-aos="fade-up">' +
        '<a class="product-media" href="detail.html?id=' + product.id + '">' +
          '<span class="product-badge">' + product.genderTag + "</span>" +
          '<img src="' + product.image + '" alt="' + product.title + '">' +
          '<div class="product-overlay-meta">' +
            "<span>粉丝：" + product.fans + "</span>" +
            "<span>收藏：" + product.likes + "</span>" +
          "</div>" +
        "</a>" +
        '<div class="product-content">' +
          '<div class="product-platform-row">' +
            '<span class="product-platform-chip">' + product.platform + "</span>" +
            '<span class="product-platform-chip muted">' + product.certificationMode + "</span>" +
          "</div>" +
          '<h3 class="product-title">' + product.title + "</h3>" +
          '<p class="product-desc">' + product.subtitle + "</p>" +
          '<div class="product-meta-row">' +
            '<div class="product-price">' + formatPrice(product.price) + '<small>/ 单个</small></div>' +
            '<span class="' + certClass + '">' +
              (product.certified ? '<i class="bi bi-patch-check-fill"></i>' : '<i class="bi bi-person-badge"></i>') +
              product.certifiedText +
            "</span>" +
          "</div>" +
          '<div class="product-meta-row">' +
            '<span class="stock-chip"><i class="bi bi-box-seam"></i>库存 ' + product.stock + "</span>" +
            '<span class="stock-chip"><i class="bi bi-bar-chart-line"></i>' + product.category + "</span>" +
          "</div>" +
          '<div class="product-footer">' +
            '<a class="btn btn-card btn-card-secondary" href="detail.html?id=' + product.id + '">查看详情</a>' +
            '<a class="btn btn-card btn-card-primary" href="detail.html?id=' + product.id + '">立即下单</a>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderProducts() {
    var products = getFilteredProducts();
    $("#heroProductCount").text(getProducts().length);
    $("#productResultCount").text(products.length);
    renderActiveFilterSummary();

    if (!products.length) {
      $("#productGrid").html('<div class="empty-fallback">当前筛选条件下暂无匹配商品，请调整平台、价格或实名条件后再试。</div>');
      return;
    }

    $("#productGrid").html(products.map(buildProductCard).join(""));
    initAOS();
  }

  function syncDrawerForm() {
    $("#drawerSortSelect").val(state.sort);
    $("#drawerCertificationSelect").val(state.certification);
    $("#drawerMinPriceInput").val(state.minPrice);
    $("#drawerMaxPriceInput").val(state.maxPrice);
    $("#drawerPlatformSelect").val(state.platform);
    $("#drawerAudienceSelect").val(state.category);
  }

  function getActiveFilters() {
    var filters = [];

    if (state.platform !== "全部") {
      filters.push({ key: "platform", label: state.platform });
    }
    if (state.category !== "全部") {
      filters.push({ key: "category", label: state.category });
    }
    if (state.sort === "price_desc") {
      filters.push({ key: "sort", label: "价格降序" });
    } else if (state.sort === "price_asc") {
      filters.push({ key: "sort", label: "价格升序" });
    } else if (state.sort === "fans_desc") {
      filters.push({ key: "sort", label: "粉丝降序" });
    } else if (state.sort === "fans_asc") {
      filters.push({ key: "sort", label: "粉丝升序" });
    } else if (state.sort === "likes_desc") {
      filters.push({ key: "sort", label: "收藏降序" });
    } else if (state.sort === "likes_asc") {
      filters.push({ key: "sort", label: "收藏升序" });
    }
    if (state.certification === "certified") {
      filters.push({ key: "certification", label: "已实名" });
    } else if (state.certification === "uncertified") {
      filters.push({ key: "certification", label: "未实名" });
    } else if (state.certification === "custom") {
      filters.push({ key: "certification", label: "可自定义实名" });
    }
    if (state.minPrice || state.maxPrice) {
      filters.push({
        key: "price",
        label: "价格 " + (state.minPrice || "0") + " - " + (state.maxPrice || "不限")
      });
    }

    return filters;
  }

  function renderActiveFilterSummary() {
    var filters = getActiveFilters();
    var $summary = $("#activeFilterSummary");
    var $badge = $("#filterBadgeCount");

    if (!$summary.length) {
      return;
    }

    if (!filters.length) {
      $summary.html('<span class="active-filter-hint">当前展示全部商品，你可以直接浏览，也可以点右侧“筛选”再细分条件。</span>');
      $badge.addClass("hidden").text("0");
      return;
    }

    $badge.removeClass("hidden").text(filters.length);
    $summary.html(filters.map(function (item) {
      return '<span class="active-filter-chip">' + item.label + "</span>";
    }).join("") + '<button class="clear-filter-link" id="clearQuickFiltersBtn" type="button">清空筛选</button>');
  }

  function bindHomeEvents() {
    $("#categoryFilters").on("click", ".filter-pill", function () {
      state.category = $(this).data("category");
      renderCategoryFilters();
      syncDrawerForm();
      renderProducts();
    });

    $("#advancedFilterForm").on("submit", function (event) {
      event.preventDefault();
      state.sort = $("#drawerSortSelect").val();
      state.certification = $("#drawerCertificationSelect").val();
      state.minPrice = $.trim($("#drawerMinPriceInput").val());
      state.maxPrice = $.trim($("#drawerMaxPriceInput").val());
      state.platform = $("#drawerPlatformSelect").val();
      state.category = $("#drawerAudienceSelect").val();
      renderCategoryFilters();
      renderProducts();

      var drawerEl = document.getElementById("advancedFilterDrawer");
      var drawerInstance = bootstrap.Offcanvas.getOrCreateInstance(drawerEl);
      drawerInstance.hide();
    });

    $("#drawerResetFiltersBtn").on("click", function () {
      state.category = "全部";
      state.platform = "全部";
      state.sort = "default";
      state.certification = "all";
      state.minPrice = "";
      state.maxPrice = "";
      syncDrawerForm();
      renderCategoryFilters();
      renderProducts();
    });

    $(document).on("click", "#clearQuickFiltersBtn", function () {
      state.category = "全部";
      state.platform = "全部";
      state.sort = "default";
      state.certification = "all";
      state.minPrice = "";
      state.maxPrice = "";
      syncDrawerForm();
      renderCategoryFilters();
      renderProducts();
    });
  }

  function renderHomePage() {
    renderNoticeList();
    renderCategoryFilters();
    syncDrawerForm();
    renderProducts();
    bindHomeEvents();
  }

  function buildPaymentChoices() {
    return getPaymentMethods().map(function (item, index) {
      return (
        '<label class="payment-option">' +
          '<input class="payment-radio" type="radio" name="payMethod" value="' + item + '" ' + (index === 0 ? "checked" : "") + '>' +
          '<span class="payment-option-body">' +
            "<strong>" + item + "</strong>" +
            "<small>扫码后系统自动轮询支付状态</small>" +
          "</span>" +
        "</label>"
      );
    }).join("");
  }

  function buildDetailLayout(product) {
    var usageList = product.usage.map(function (item) {
      return "<li>" + item + "</li>";
    }).join("");

    return (
      '<section class="detail-grid detail-grid-unified">' +
        '<article class="detail-panel detail-panel-unified" data-aos="fade-up">' +
          '<div class="detail-hero-image">' +
            '<span class="gender-chip">' + product.genderTag + "</span>" +
            '<img src="' + product.image + '" alt="' + product.title + '">' +
          "</div>" +
          '<div class="detail-content">' +
            '<div class="detail-head">' +
              "<div>" +
                '<span class="section-kicker">' + product.platform + " · " + product.category + "</span>" +
                '<h2 class="detail-title">' + product.title + "</h2>" +
                '<p class="detail-subtitle">' + product.subtitle + "</p>" +
              "</div>" +
              '<div class="detail-price">' +
                "<strong>" + formatPrice(product.price) + "</strong>" +
                "<span>库存 " + product.stock + " 份</span>" +
              "</div>" +
            "</div>" +
            '<div class="detail-badges">' +
              '<span class="stock-chip"><i class="bi bi-grid"></i>' + product.platform + "</span>" +
              '<span class="cert-chip"><i class="bi bi-patch-check-fill"></i>' + product.certifiedText + "</span>" +
              '<span class="stock-chip"><i class="bi bi-person-vcard"></i>' + product.certificationMode + "</span>" +
            "</div>" +
            '<div class="detail-stats">' +
              '<div class="detail-stat-card"><span>粉丝量级</span><strong>' + product.fans + "</strong></div>" +
              '<div class="detail-stat-card"><span>收藏总量</span><strong>' + product.likes + "</strong></div>" +
              '<div class="detail-stat-card"><span>男女粉比例</span><strong>' + product.genderRatio + "</strong></div>" +
            "</div>" +
            '<div class="content-section">' +
              "<h3>商品介绍</h3>" +
              "<p>" + product.introduction + "</p>" +
            "</div>" +
            '<div class="content-section">' +
              "<h3>商品使用说明</h3>" +
              "<p>" + product.instructions + "</p>" +
            "</div>" +
            '<div class="content-section">' +
              "<h3>账号受众说明</h3>" +
              "<p>" + product.fansProfile + "</p>" +
            "</div>" +
            '<div class="content-section">' +
              "<h3>常见说明</h3>" +
              "<ul>" + usageList + "</ul>" +
            "</div>" +
          "</div>" +
        "</article>" +
        '<aside class="order-panel order-panel-unified" data-aos="fade-up" data-aos-delay="70">' +
          '<span class="section-kicker">Fast Checkout</span>' +
          '<h3 class="panel-title">下单并发起支付</h3>' +
          '<p class="panel-subtitle">先选择联系方式与支付方式，再生成支付二维码。二维码有效期 15 分钟，支付成功后会自动跳转订单列表。</p>' +
          '<form id="orderForm" novalidate>' +
            '<div class="mb-3">' +
              '<label class="form-label" for="buyerName">联系人</label>' +
              '<input class="form-control" id="buyerName" name="buyerName" type="text" placeholder="请输入联系人称呼">' +
            "</div>" +
            '<div class="mb-3">' +
              '<label class="form-label" for="contactValue">邮箱或手机号</label>' +
              '<input class="form-control" id="contactValue" name="contactValue" type="text" placeholder="请输入邮箱或手机号" required>' +
            "</div>" +
            '<div class="mb-3">' +
              '<label class="form-label" for="remarks">备注说明</label>' +
              '<textarea class="form-control" id="remarks" name="remarks" rows="3" placeholder="例如：偏好长期稳定账号、支付完成后自动跳转订单页"></textarea>' +
            "</div>" +
            '<div class="mb-3">' +
              '<label class="form-label">支付方式</label>' +
              '<div class="payment-options">' + buildPaymentChoices() + "</div>" +
            "</div>" +
            '<div class="helper-row">' +
              "<span>应付金额</span>" +
              "<strong>" + formatPrice(product.price) + "</strong>" +
            "</div>" +
            '<button class="btn btn-dark btn-pill w-100" type="submit">生成支付二维码</button>' +
          "</form>" +
          '<div class="payment-box hidden" id="paymentBox">' +
            '<div class="payment-box-head">' +
              "<div><strong>扫码完成支付</strong><p>订单号：<span id=\"pendingOrderId\">-</span></p></div>" +
              '<span class="countdown-chip" id="paymentCountdown">15:00</span>' +
            "</div>" +
            '<div class="payment-qr-wrap">' +
              '<img id="paymentQrImage" class="payment-qr-image" src="" alt="支付二维码">' +
            "</div>" +
            '<div class="payment-box-meta">' +
              '<span id="pendingPayMethod">微信支付</span>' +
              "<span>支付成功后自动跳转订单列表</span>" +
            "</div>" +
            '<div class="payment-box-actions">' +
              '<button class="btn btn-dark btn-pill w-100" id="simulatePaidBtn" type="button">我已完成支付</button>' +
            "</div>" +
          "</div>" +
        "</aside>" +
      "</section>"
    );
  }

  function buildPaymentQrUrl(product, method) {
    var label = encodeURIComponent(method + " · " + product.title);
    return "https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=" + label;
  }

  function startPaymentCountdown(deadline) {
    if (window.paymentCountdownTimer) {
      clearInterval(window.paymentCountdownTimer);
    }

    function tick() {
      var seconds = Math.max(0, dayjs(deadline).diff(dayjs(), "second"));
      $("#paymentCountdown").text(formatCountdown(seconds));

      if (seconds <= 0) {
        clearInterval(window.paymentCountdownTimer);
        window.paymentCountdownTimer = null;
        clearPendingPayment();
        $("#paymentBox").addClass("hidden");
        Swal.fire({
          icon: "warning",
          title: "支付二维码已过期",
          text: "请重新提交订单生成新的支付二维码。",
          confirmButtonColor: "#111111"
        });
      }
    }

    tick();
    window.paymentCountdownTimer = setInterval(tick, 1000);
  }

  function completePayment(order) {
    var product = getProductById(order.productId);
    order.status = "paid";
    order.deliveryStatus = "已发货";
    order.paidAt = dayjs().format("YYYY-MM-DD HH:mm:ss");
    order.credentials = order.credentials || (product ? product.credentials : { account: "-", password: "-" });
    order.timeline = [
      "提交订单",
      order.payMethod + "支付成功",
      "系统自动发号",
      "订单已同步至订单列表"
    ];
    order.aftersale = "卡密已自动交付，请及时保存并在 24 小时内完成资料核对。";
    pushOrder(order);
    clearPendingPayment();

    if (window.paymentCountdownTimer) {
      clearInterval(window.paymentCountdownTimer);
      window.paymentCountdownTimer = null;
    }

    window.location.href = "orders.html?highlight=" + order.orderId;
  }

  function renderPendingPayment(order, product) {
    $("#pendingOrderId").text(order.orderId);
    $("#pendingPayMethod").text(order.payMethod);
    $("#paymentQrImage").attr("src", buildPaymentQrUrl(product, order.payMethod));
    $("#paymentBox").removeClass("hidden");
    startPaymentCountdown(order.paymentExpireAt);

    $("#simulatePaidBtn").off("click").on("click", function () {
      completePayment(order);
    });
  }

  function renderDetailPage() {
    var id = getQueryParam("id") || "xhs-001";
    var product = getProductById(id);
    var pendingPayment = getPendingPayment();

    if (!product) {
      $("#productDetailMount").html('<div class="empty-fallback">未找到该商品，请返回首页重新选择。</div>');
      return;
    }

    $("#productDetailMount").html(buildDetailLayout(product));

    if (pendingPayment && pendingPayment.productId === product.id && pendingPayment.status === "pending") {
      renderPendingPayment(pendingPayment, product);
    }

    $("#orderForm").on("submit", function (event) {
      event.preventDefault();

      var buyerName = $.trim($("#buyerName").val());
      var contactValue = $.trim($("#contactValue").val());
      var remarks = $.trim($("#remarks").val());
      var payMethod = $('input[name="payMethod"]:checked').val();

      if (!contactValue || (!isPhone(contactValue) && !isEmail(contactValue))) {
        Swal.fire({
          icon: "warning",
          title: "联系方式格式不正确",
          text: "请输入有效的中国大陆手机号或邮箱地址。"
        });
        return;
      }

      var pendingOrder = {
        orderId: generateOrderId(),
        productId: product.id,
        productTitle: product.title,
        price: product.price,
        buyerName: buyerName || "匿名买家",
        contactValue: contactValue,
        remarks: remarks || "无",
        createdAt: dayjs().format("YYYY-MM-DD HH:mm:ss"),
        paymentExpireAt: dayjs().add(15, "minute").format("YYYY-MM-DD HH:mm:ss"),
        payMethod: payMethod,
        deliveryStatus: "待支付",
        status: "pending",
        credentials: product.credentials
      };

      savePendingPayment(pendingOrder);
      renderPendingPayment(pendingOrder, product);
    });
  }

  function buildOrderStats(orders) {
    var mergedOrders = orders.concat(getDemoOrders());
    var total = mergedOrders.length;
    var paidCount = mergedOrders.filter(function (item) {
      return item.status === "paid" || item.deliveryStatus === "已发货";
    }).length;
    var amount = mergedOrders.reduce(function (sum, item) {
      return sum + Number(item.price || 0);
    }, 0);

    return [
      { label: "总订单数", value: total },
      { label: "已支付订单", value: paidCount },
      { label: "累计金额", value: "\u00a5" + amount.toFixed(0) }
    ].map(function (item) {
      return (
        '<div class="stats-card">' +
          '<span class="stats-label">' + item.label + "</span>" +
          '<strong class="stats-value">' + item.value + "</strong>" +
        "</div>"
      );
    }).join("");
  }

  function buildOrderCard(order, highlight) {
    var product = getProductById(order.productId);
    return (
      '<article class="order-card ' + (highlight ? "highlighted" : "") + '" data-aos="fade-up">' +
        '<div class="order-card-head">' +
          "<div>" +
            "<h4>" + order.productTitle + "</h4>" +
            "<p>订单号：" + order.orderId + "</p>" +
          "</div>" +
          '<span class="status-chip"><i class="bi bi-lightning-charge-fill"></i>' + order.deliveryStatus + "</span>" +
        "</div>" +
        '<div class="order-card-body">' +
          '<div class="order-info">' +
            '<div class="order-info-grid">' +
              '<div class="info-block"><span>联系人</span><strong>' + order.buyerName + "</strong></div>" +
              '<div class="info-block"><span>联系方式</span><strong>' + order.contactValue + "</strong></div>" +
              '<div class="info-block"><span>下单时间</span><strong>' + order.createdAt + "</strong></div>" +
              '<div class="info-block"><span>支付方式</span><strong>' + (order.payMethod || "微信支付") + "</strong></div>" +
              '<div class="info-block"><span>成交金额</span><strong>' + formatPrice(order.price) + "</strong></div>" +
              '<div class="info-block"><span>账号平台</span><strong>' + (product ? product.platform : "某红薯") + "</strong></div>" +
            "</div>" +
          "</div>" +
          '<div class="order-credential">' +
            "<span>已交付账号</span>" +
            "<strong>" + order.credentials.account + "</strong>" +
            '<span class="mt-3">已交付密码</span>' +
            "<strong>" + order.credentials.password + "</strong>" +
            '<a class="btn btn-light btn-pill btn-outline-soft mt-3" href="order-detail.html?id=' + order.orderId + '">查看订单详情</a>' +
          "</div>" +
        "</div>" +
      "</article>"
    );
  }

  function renderOrdersPage() {
    var orders = getOrders();
    var highlightOrderId = getQueryParam("highlight");
    $("#orderStats").html(buildOrderStats(orders));
    $("#clearOrdersBtn").off("click");

    if (!orders.length) {
      $("#ordersList").html(
        '<div class="order-empty" data-aos="fade-up">' +
          '<h3 class="mb-3">还没有支付成功的本地订单</h3>' +
          '<p>前往商品详情页提交订单并完成支付后，这里会自动展示订单记录与卡密信息。</p>' +
          '<a class="btn btn-dark btn-pill mt-4" href="index.html">去首页选购</a>' +
        "</div>"
      );
    } else {
      $("#ordersList").html(orders.map(function (item) {
        return buildOrderCard(item, highlightOrderId === item.orderId);
      }).join(""));
    }

    $("#demoOrdersList").html(getDemoOrders().map(function (item) {
      return buildOrderCard(item, false);
    }).join(""));

    initAOS();

    $("#clearOrdersBtn").on("click", function () {
      Swal.fire({
        title: "确认清空本地订单？",
        text: "该操作只会清除当前浏览器中的支付演示数据，静态样单不会被删除。",
        icon: "question",
        showCancelButton: true,
        confirmButtonText: "确认清空",
        cancelButtonText: "取消",
        confirmButtonColor: "#111111"
      }).then(function (result) {
        if (result.isConfirmed) {
          saveOrders([]);
          renderOrdersPage();
          Swal.fire({
            icon: "success",
            title: "已清空",
            text: "本地订单记录已经移除。"
          });
        }
      });
    });
  }

  function getOrderById(orderId) {
    return getOrders().concat(getDemoOrders()).find(function (item) {
      return item.orderId === orderId;
    });
  }

  function buildOrderTimeline(order) {
    var items = order.timeline || ["提交订单", "支付成功", "自动发号", "完成交付"];
    return items.map(function (item, index) {
      return (
        '<div class="timeline-item">' +
          '<span class="timeline-index">' + (index + 1) + "</span>" +
          "<div><strong>" + item + "</strong></div>" +
        "</div>"
      );
    }).join("");
  }

  function renderOrderDetailPage() {
    var order = getOrderById(getQueryParam("id"));
    var product = order ? getProductById(order.productId) : null;

    if (!order) {
      $("#orderDetailMount").html('<div class="empty-fallback">未找到对应订单，请返回订单中心重新查看。</div>');
      return;
    }

    $("#orderDetailMount").html(
      '<section class="order-detail-layout">' +
        '<article class="order-detail-main" data-aos="fade-up">' +
          '<div class="order-detail-card">' +
            '<div class="order-detail-head">' +
              "<div>" +
                '<span class="section-kicker">Order Detail</span>' +
                "<h2>" + order.productTitle + "</h2>" +
                "<p>订单号：" + order.orderId + " · 支付方式：" + (order.payMethod || "微信支付") + "</p>" +
              "</div>" +
              '<span class="status-chip"><i class="bi bi-patch-check-fill"></i>' + order.deliveryStatus + "</span>" +
            "</div>" +
            '<div class="order-detail-grid">' +
              '<div class="detail-stat-card"><span>下单时间</span><strong>' + order.createdAt + "</strong></div>" +
              '<div class="detail-stat-card"><span>支付时间</span><strong>' + (order.paidAt || "待支付") + "</strong></div>" +
              '<div class="detail-stat-card"><span>成交金额</span><strong>' + formatPrice(order.price) + "</strong></div>" +
            "</div>" +
            '<div class="content-section">' +
              "<h3>支付与交付信息</h3>" +
              '<div class="order-detail-info-list">' +
                '<div><span>联系人</span><strong>' + order.buyerName + "</strong></div>" +
                '<div><span>联系方式</span><strong>' + order.contactValue + "</strong></div>" +
                '<div><span>支付方式</span><strong>' + (order.payMethod || "微信支付") + "</strong></div>" +
                '<div><span>售后说明</span><strong>' + (order.aftersale || "卡密已交付，请及时保存。") + "</strong></div>" +
              "</div>" +
            "</div>" +
            '<div class="content-section">' +
              "<h3>订单流程</h3>" +
              '<div class="timeline-list">' + buildOrderTimeline(order) + "</div>" +
            "</div>" +
          "</div>" +
        "</article>" +
        '<aside class="order-detail-side" data-aos="fade-up" data-aos-delay="60">' +
          '<div class="order-detail-card compact">' +
            '<div class="delivery-box visible-box">' +
              '<div class="delivery-head">' +
                "<strong>自动发号结果</strong>" +
                '<button class="btn btn-light btn-sm btn-pill" id="copyOrderCredentialBtn" type="button">复制卡密</button>' +
              "</div>" +
              '<div class="credential-card">' +
                '<div class="credential-row"><span>账号</span><strong id="orderDetailAccount">' + order.credentials.account + "</strong></div>" +
                '<div class="credential-row"><span>密码</span><strong id="orderDetailPassword">' + order.credentials.password + "</strong></div>" +
              "</div>" +
            "</div>" +
            '<div class="content-section">' +
              "<h3>商品补充信息</h3>" +
              '<div class="order-product-meta">' +
                '<div><span>平台</span><strong>' + (product ? product.platform : "某红薯") + "</strong></div>" +
                '<div><span>实名状态</span><strong>' + (product ? product.certifiedText : "已实名") + "</strong></div>" +
                '<div><span>男女粉比例</span><strong>' + (product ? product.genderRatio : "-") + "</strong></div>" +
                '<div><span>收藏总量</span><strong>' + (product ? product.likes : "-") + "</strong></div>" +
              "</div>" +
            "</div>" +
          "</div>" +
        "</aside>" +
      "</section>"
    );

    $("#copyOrderCredentialBtn").on("click", function () {
      var text = "账号：" + $("#orderDetailAccount").text() + " 密码：" + $("#orderDetailPassword").text();
      navigator.clipboard.writeText(text).then(function () {
        Swal.fire({
          icon: "success",
          title: "复制成功",
          text: "卡密信息已复制到剪贴板。",
          confirmButtonColor: "#111111"
        });
      });
    });
  }

  function ensureProfileAccess() {
    if (!getCurrentUser()) {
      window.location.href = "auth.html?mode=login&redirect=profile.html";
      return false;
    }
    return true;
  }

  function buildProfileStats() {
    var orders = getOrders();
    var currentUser = getCurrentUser();
    var totalPrice = orders.reduce(function (sum, item) {
      return sum + Number(item.price || 0);
    }, 0);
    var joinedAt = currentUser ? currentUser.joinedAt : dayjs().format("YYYY-MM-DD");

    return [
      { label: "总订单数", value: orders.length },
      { label: "累计支付", value: "\u00a5" + totalPrice.toFixed(0) },
      { label: "注册时间", value: dayjs(joinedAt).format("YYYY-MM-DD") }
    ].map(function (item) {
      return (
        '<div class="stats-card">' +
          '<span class="stats-label">' + item.label + "</span>" +
          '<strong class="stats-value">' + item.value + "</strong>" +
        "</div>"
      );
    }).join("");
  }

  function renderProfileInfo() {
    var currentUser = getCurrentUser();
    var orders = getOrders();
    var latestOrder = orders[0];

    $("#profileAvatarText").text((currentUser.nickname || currentUser.username).slice(0, 2).toUpperCase());
    $("#profileWelcomeName").text(currentUser.nickname || currentUser.username);
    $("#profileWelcomeText").text("欢迎进入个人中心，这里展示登录后的订单概览、账户信息和最近下单记录。");
    $("#profileStats").html(buildProfileStats());
    $("#profileInfoList").html(
      '<div class="profile-info-item"><span>用户名</span><strong>' + currentUser.username + "</strong></div>" +
      '<div class="profile-info-item"><span>昵称</span><strong>' + currentUser.nickname + "</strong></div>" +
      '<div class="profile-info-item"><span>注册时间</span><strong>' + dayjs(currentUser.joinedAt).format("YYYY-MM-DD HH:mm") + "</strong></div>" +
      '<div class="profile-info-item"><span>最近下单</span><strong>' + (latestOrder ? latestOrder.createdAt : "暂无订单") + "</strong></div>"
    );

    if (!orders.length) {
      $("#profileRecentOrders").html('<div class="empty-mini-card">你还没有支付成功的订单，先去首页挑选一个账号吧。</div>');
    } else {
      $("#profileRecentOrders").html(orders.slice(0, 3).map(function (item) {
        return (
          '<a class="mini-order-card" href="order-detail.html?id=' + item.orderId + '">' +
            "<strong>" + item.productTitle + "</strong>" +
            "<span>" + formatPrice(item.price) + " · " + item.payMethod + "</span>" +
            "<small>" + item.createdAt + "</small>" +
          "</a>"
        );
      }).join(""));
    }

    $("#logoutBtn").off("click").on("click", function () {
      clearCurrentUser();
      window.location.href = "auth.html?mode=login";
    });
  }

  function renderProfilePage() {
    if (!ensureProfileAccess()) {
      return;
    }
    renderProfileInfo();
    initAOS();
  }

  function getAuthMode() {
    return getQueryParam("mode") === "register" ? "register" : "login";
  }

  function setAuthMode(mode) {
    var isRegister = mode === "register";
    $(".auth-switch-btn").removeClass("active");
    $('.auth-switch-btn[data-mode="' + mode + '"]').addClass("active");
    $("#confirmPasswordGroup").toggleClass("hidden", !isRegister);
    $("#authTitle").text(isRegister ? "注册新账号" : "登录账号");
    $("#authDescription").text(
      isRegister
        ? "使用用户名和密码快速注册，不需要手机验证码或邮箱验证码。"
        : "输入用户名和密码即可进入个人中心，未登录访问“我的”页面时会自动跳转到这里。"
    );
    $("#authSubmitBtn").text(isRegister ? "立即注册" : "立即登录");
    $("#authForm").data("mode", mode);
  }

  function handleAuthSubmit() {
    $("#authForm").on("submit", function (event) {
      event.preventDefault();

      var mode = $("#authForm").data("mode");
      var username = $.trim($("#authUsername").val());
      var password = $.trim($("#authPassword").val());
      var confirmPassword = $.trim($("#authConfirmPassword").val());
      var redirect = getQueryParam("redirect") || "profile.html";
      var users = getUsers();

      if (!username || !password) {
        Swal.fire({
          icon: "warning",
          title: "请填写完整信息",
          text: "用户名和密码不能为空。"
        });
        return;
      }

      if (mode === "register") {
        if (password.length < 6) {
          Swal.fire({
            icon: "warning",
            title: "密码长度不足",
            text: "注册密码至少需要 6 位。"
          });
          return;
        }

        if (password !== confirmPassword) {
          Swal.fire({
            icon: "warning",
            title: "两次密码不一致",
            text: "请重新确认你的注册密码。"
          });
          return;
        }

        if (users.some(function (user) { return user.username === username; })) {
          Swal.fire({
            icon: "warning",
            title: "用户名已存在",
            text: "请换一个用户名后再注册。"
          });
          return;
        }

        var newUser = {
          username: username,
          password: password,
          nickname: username,
          joinedAt: dayjs().format("YYYY-MM-DD HH:mm:ss")
        };

        users.push(newUser);
        saveUsers(users);
        saveCurrentUser(newUser);
        Swal.fire({
          icon: "success",
          title: "注册成功",
          text: "账号已创建，正在进入个人中心。",
          timer: 1200,
          showConfirmButton: false
        }).then(function () {
          window.location.href = redirect;
        });
        return;
      }

      var matchedUser = users.find(function (user) {
        return user.username === username && user.password === password;
      });

      if (!matchedUser) {
        Swal.fire({
          icon: "error",
          title: "登录失败",
          text: "用户名或密码不正确。"
        });
        return;
      }

      saveCurrentUser(matchedUser);
      Swal.fire({
        icon: "success",
        title: "登录成功",
        text: "正在跳转到个人中心。",
        timer: 1000,
        showConfirmButton: false
      }).then(function () {
        window.location.href = redirect;
      });
    });
  }

  function renderAuthPage() {
    setAuthMode(getAuthMode());

    $("#authSwitcher").on("click", ".auth-switch-btn", function () {
      var mode = $(this).data("mode");
      var redirect = getQueryParam("redirect");
      setAuthMode(mode);
      var targetUrl = "auth.html?mode=" + mode + (redirect ? "&redirect=" + encodeURIComponent(redirect) : "");
      window.history.replaceState({}, "", targetUrl);
    });

    handleAuthSubmit();
  }

  function boot() {
    renderHeaderAuth();
    initAOS();

    if (page === "home") {
      renderHomePage();
      return;
    }

    if (page === "detail") {
      renderDetailPage();
      return;
    }

    if (page === "orders") {
      renderOrdersPage();
      return;
    }

    if (page === "profile") {
      renderProfilePage();
      return;
    }

    if (page === "auth") {
      renderAuthPage();
      return;
    }

    if (page === "order-detail") {
      renderOrderDetailPage();
    }
  }

  $(boot);
})(jQuery);
