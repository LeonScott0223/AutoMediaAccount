(function ($) {
  "use strict";

  var data = window.AdminMockData;
  var ui = window.AdminComponents;
  var state = {
    activeKey: window.location.hash ? window.location.hash.replace("#", "") : "productList",
    rows: {},
    editingId: null
  };

  function cloneRows() {
    Object.keys(data.pages).forEach(function (key) {
      state.rows[key] = data.pages[key].rows.map(function (row) {
        return Object.assign({}, row);
      });
    });
  }

  function getPage() {
    return data.pages[state.activeKey];
  }

  function getRows() {
    return state.rows[state.activeKey] || [];
  }

  function findRow(id) {
    return getRows().find(function (row) {
      return String(row.id) === String(id);
    });
  }

  function getFormValues($form) {
    var values = {};
    $form.serializeArray().forEach(function (item) {
      values[item.name] = item.value;
    });
    return values;
  }

  function isRangeFieldValue(name) {
    return /Min$|Max$|Start$|End$/.test(name);
  }

  function filterRows(rows, filters) {
    var keys = Object.keys(filters).filter(function (key) {
      return filters[key] && !isRangeFieldValue(key);
    });

    if (!keys.length) {
      return rows;
    }

    return rows.filter(function (row) {
      return keys.every(function (key) {
        var value = filters[key];
        if (value === "全部") {
          return true;
        }

        return String(row[key] == null ? "" : row[key]).toLowerCase().indexOf(String(value).toLowerCase()) > -1;
      });
    });
  }

  function renderShell() {
    $("#adminMenu").html(ui.renderMenus(data.menus, state.activeKey));
  }

  function renderPage() {
    var page = getPage();
    var filters = getFormValues($("#adminSearchForm"));
    var rows = filterRows(getRows(), filters);

    $("#adminBreadcrumb").text("后台管理 / " + page.parent);
    $("#adminPageTitle").text(page.title);
    $("#adminOverview").html(ui.renderOverview(page.summary));
    $("#adminSearchForm").html(ui.renderSearchForm(page.searches));
    $("#adminToolbar").html(ui.renderToolbar(page));
    $("#adminTableWrap").html(ui.renderTable(page, rows));
    renderShell();
  }

  function rerenderTable() {
    var page = getPage();
    var filters = getFormValues($("#adminSearchForm"));
    $("#adminTableWrap").html(ui.renderTable(page, filterRows(getRows(), filters)));
  }

  function showToast(icon, title, text) {
    if (window.Swal) {
      Swal.fire({
        icon: icon,
        title: title,
        text: text || "",
        timer: 1100,
        showConfirmButton: false
      });
      return;
    }
    window.alert(title + (text ? "\n" + text : ""));
  }

  function openDetail(row) {
    var page = getPage();
    $("#adminDetailTitle").text(page.entityName + "详情");
    $("#adminDetailBody").html(ui.renderDetail(page, row));
    bootstrap.Modal.getOrCreateInstance(document.getElementById("adminDetailModal")).show();
  }

  function openForm(mode, row) {
    var page = getPage();
    var titlePrefix = mode === "edit" ? "编辑" : (page.title.indexOf("导入") > -1 ? "导入" : "新增");
    state.editingId = row ? row.id : null;

    $("#adminFormKicker").text(mode === "edit" ? "Edit" : "Create");
    $("#adminFormTitle").text(titlePrefix + page.entityName);
    $("#adminFormBody").html(ui.renderFields(page.formFields, row || {}));
    bootstrap.Modal.getOrCreateInstance(document.getElementById("adminFormModal")).show();
  }

  function createDefaultRow(values) {
    var rows = getRows();
    var now = window.dayjs ? dayjs().format("YYYY-MM-DD HH:mm:ss") : new Date().toLocaleString();
    return Object.assign({
      id: rows.length ? Math.max.apply(null, rows.map(function (item) { return Number(item.id) || 0; })) + 1 : 1,
      createdAt: now,
      updatedAt: now,
      statusText: values.statusText || values.orderStatusText || values.cardStatusText || "启用"
    }, values);
  }

  function saveForm(values) {
    var rows = getRows();
    var page = getPage();

    if (state.editingId) {
      var row = findRow(state.editingId);
      Object.assign(row, values, {
        updatedAt: window.dayjs ? dayjs().format("YYYY-MM-DD HH:mm:ss") : new Date().toLocaleString()
      });
      showToast("success", "保存成功", page.entityName + "已更新。");
      return;
    }

    rows.unshift(createDefaultRow(values));
    showToast("success", "新增成功", page.entityName + "已加入静态列表。");
  }

  function toggleStatus(row) {
    var statusKeys = ["statusText", "orderStatusText", "deliveryStatusText", "cardStatusText", "payStatusText", "autoPopupText"];
    var key = statusKeys.find(function (item) {
      return row[item] != null;
    });

    if (!key) {
      showToast("info", "暂无可切换状态");
      return;
    }

    var value = String(row[key]);
    if (value === "上架") row[key] = "下架";
    else if (value === "下架") row[key] = "上架";
    else if (value === "启用") row[key] = "禁用";
    else if (value === "禁用") row[key] = "启用";
    else if (value === "正常") row[key] = "禁用";
    else if (value === "显示") row[key] = "隐藏";
    else if (value === "隐藏") row[key] = "显示";
    else if (value === "开启") row[key] = "关闭";
    else if (value === "关闭") row[key] = "开启";
    else if (value === "待支付") row[key] = "已支付";
    else if (value === "已支付") row[key] = "待支付";
    else if (value === "未售出") row[key] = "已禁用";
    else if (value === "已禁用") row[key] = "未售出";
    else if (value === "支付成功") row[key] = "待支付";
    else row[key] = "启用";

    rerenderTable();
    showToast("success", "状态已切换", "当前状态：" + row[key]);
  }

  function deleteRow(row) {
    var page = getPage();
    var doDelete = function () {
      state.rows[state.activeKey] = getRows().filter(function (item) {
        return item.id !== row.id;
      });
      rerenderTable();
      showToast("success", "删除成功", page.entityName + "已从静态列表移除。");
    };

    if (window.Swal) {
      Swal.fire({
        icon: "question",
        title: "确认删除？",
        text: "这是静态演示删除，只影响当前页面数据。",
        showCancelButton: true,
        confirmButtonText: "确认删除",
        cancelButtonText: "取消",
        confirmButtonColor: "#111111"
      }).then(function (result) {
        if (result.isConfirmed) {
          doDelete();
        }
      });
      return;
    }

    if (window.confirm("确认删除？")) {
      doDelete();
    }
  }

  function handleSpecialAction(type, row) {
    var messages = {
      copy: "复制成功",
      card: "已切换到卡密列表",
      order: "已切换到订单列表",
      cancel: "订单已取消",
      confirm: "订单已确认支付",
      redeliver: "已重新发货",
      release: "锁定已释放",
      bind: "已打开绑定商品表单",
      download: "失败记录下载已生成",
      reimport: "已重新导入",
      resetPassword: "密码已重置为演示密码",
      config: "二维码配置已保存",
      markSuccess: "已标记支付成功",
      markFail: "已标记支付失败",
      regenQr: "二维码已重新生成",
      audit: "审核已通过"
    };

    if (type === "card") {
      state.activeKey = "cardList";
      renderPage();
      return;
    }

    if (type === "order") {
      state.activeKey = "orderList";
      renderPage();
      return;
    }

    if (type === "confirm") {
      row.orderStatusText = "已支付";
      row.deliveryStatusText = row.deliveryStatusText === "待支付" ? "待发货" : row.deliveryStatusText;
      row.paidAt = window.dayjs ? dayjs().format("YYYY-MM-DD HH:mm:ss") : new Date().toLocaleString();
      rerenderTable();
    }

    if (type === "cancel") {
      row.orderStatusText = "已取消";
      rerenderTable();
    }

    if (type === "redeliver") {
      row.deliveryStatusText = "已发货";
      row.deliveredAt = window.dayjs ? dayjs().format("YYYY-MM-DD HH:mm:ss") : new Date().toLocaleString();
      rerenderTable();
    }

    if (type === "markSuccess") {
      row.payStatusText = "支付成功";
      row.paidAt = window.dayjs ? dayjs().format("YYYY-MM-DD HH:mm:ss") : new Date().toLocaleString();
      rerenderTable();
    }

    if (type === "markFail") {
      row.payStatusText = "支付失败";
      rerenderTable();
    }

    showToast("success", messages[type] || "操作成功");
  }

  function bindEvents() {
    document.addEventListener("click", function (event) {
      var target = event.target;
      if (!target || !target.closest) {
        return;
      }

      var button = target.closest("[data-page-key]");
      if (!button) {
        return;
      }

      event.preventDefault();
      state.activeKey = button.getAttribute("data-page-key");
      window.location.hash = state.activeKey;
      $("body").removeClass("sidebar-open");
      renderPage();
    });

    window.addEventListener("hashchange", function () {
      var nextKey = window.location.hash.replace("#", "") || "productList";
      if (!data.pages[nextKey]) {
        return;
      }
      state.activeKey = nextKey;
      renderPage();
    });

    $("#sidebarToggleBtn").on("click", function () {
      $("body").toggleClass("sidebar-open");
    });

    $("#adminSearchForm").on("submit", function (event) {
      event.preventDefault();
      rerenderTable();
    });

    $("#adminSearchForm").on("input change", "input, select", function () {
      rerenderTable();
    });

    $("#resetSearchBtn").on("click", function () {
      $("#adminSearchForm").get(0).reset();
      rerenderTable();
    });

    $("#adminToolbar").on("click", "[data-toolbar-action]", function () {
      var action = $(this).data("toolbar-action");
      if (action === "add") {
        openForm("add");
        return;
      }
      showToast("success", "导出成功", "静态数据已准备导出。");
    });

    $("#adminTableWrap").on("click", "[data-action]", function () {
      var type = $(this).data("action");
      var row = findRow($(this).data("id"));
      if (!row) return;

      if (type === "view") {
        openDetail(row);
      } else if (type === "edit") {
        openForm("edit", row);
      } else if (type === "delete") {
        deleteRow(row);
      } else if (type === "status") {
        toggleStatus(row);
      } else {
        handleSpecialAction(type, row);
      }
    });

    $("#adminEntityForm").on("submit", function (event) {
      event.preventDefault();
      saveForm(getFormValues($(this)));
      bootstrap.Modal.getOrCreateInstance(document.getElementById("adminFormModal")).hide();
      rerenderTable();
    });
  }

  function boot() {
    cloneRows();
    state.activeKey = window.location.hash ? window.location.hash.replace("#", "") : state.activeKey;
    if (!data.pages[state.activeKey]) {
      state.activeKey = "productList";
      window.location.hash = state.activeKey;
    }
    renderShell();
    renderPage();
    bindEvents();
  }

  $(boot);
})(jQuery);
