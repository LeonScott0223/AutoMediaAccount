(function ($) {
  "use strict";

  function escapeHtml(value) {
    return String(value == null ? "" : value)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#039;");
  }

  function formatMoney(value) {
    var number = Number(value || 0);
    return "\u00a5" + number.toFixed(0);
  }

  function statusClass(value) {
    var text = String(value || "");
    if (/上架|启用|正常|显示|开启|成功|已支付|已发货|未售出/.test(text)) {
      return "success";
    }
    if (/待支付|待发货|已锁定|部分成功/.test(text)) {
      return "warning";
    }
    if (/下架|禁用|隐藏|关闭|失败|取消|过期/.test(text)) {
      return "danger";
    }
    return "neutral";
  }

  function renderIcon(icon) {
    return '<i class="bi ' + escapeHtml(icon) + '"></i>';
  }

  function renderMenus(menus, activeKey) {
    return menus.map(function (menu) {
      var children = menu.children.map(function (child) {
        var active = child.key === activeKey ? " active" : "";
        return '<a class="admin-submenu-btn' + active + '" href="#' + child.key + '" data-page-key="' + child.key + '">' + escapeHtml(child.title) + "</a>";
      }).join("");

      return (
        '<div class="admin-menu-group">' +
          '<button class="admin-menu-parent" type="button">' +
            renderIcon(menu.icon) +
            '<span>' + escapeHtml(menu.title) + "</span>" +
          "</button>" +
          '<div class="admin-submenu">' + children + "</div>" +
        "</div>"
      );
    }).join("");
  }

  function renderOverview(items) {
    return (items || []).map(function (text) {
      var parts = String(text).split(" ");
      var value = parts.pop();
      var label = parts.join(" ") || text;
      return (
        '<article class="admin-stat-card">' +
          '<span>' + escapeHtml(label) + "</span>" +
          '<strong>' + escapeHtml(value) + "</strong>" +
        "</article>"
      );
    }).join("");
  }

  function renderControl(field, value) {
    var safeValue = value == null ? "" : String(value);
    var name = escapeHtml(field.name);
    var label = escapeHtml(field.label);
    var required = field.required ? " required" : "";
    var placeholder = escapeHtml(field.placeholder || ("请输入" + field.label));

    if (field.type === "select") {
      return (
        '<select class="form-select" name="' + name + '"' + required + '>' +
          (field.options || []).map(function (option) {
            var selected = String(option) === safeValue ? " selected" : "";
            return '<option value="' + escapeHtml(option) + '"' + selected + ">" + escapeHtml(option) + "</option>";
          }).join("") +
        "</select>"
      );
    }

    if (field.type === "textarea") {
      return '<textarea class="form-control" name="' + name + '" placeholder="' + placeholder + '"' + required + ">" + escapeHtml(safeValue) + "</textarea>";
    }

    if (field.type === "range") {
      return (
        '<div class="range-field">' +
          '<input class="form-control" name="' + name + 'Min" type="number" placeholder="最低">' +
          '<input class="form-control" name="' + name + 'Max" type="number" placeholder="最高">' +
        "</div>"
      );
    }

    if (field.type === "dateRange") {
      return (
        '<div class="range-field">' +
          '<input class="form-control" name="' + name + 'Start" type="date">' +
          '<input class="form-control" name="' + name + 'End" type="date">' +
        "</div>"
      );
    }

    if (field.type === "file") {
      return '<input class="form-control" name="' + name + '" type="file"' + required + ">";
    }

    if (field.type === "datetime") {
      return '<input class="form-control" name="' + name + '" type="datetime-local" value="' + escapeHtml(safeValue.replace(" ", "T")) + '"' + required + ">";
    }

    return '<input class="form-control" name="' + name + '" type="' + escapeHtml(field.type || "text") + '" value="' + escapeHtml(safeValue) + '" placeholder="' + placeholder + '"' + required + ">";
  }

  function renderFields(fields, row) {
    return (fields || []).map(function (field) {
      var className = field.className ? " " + field.className : "";
      return (
        '<div class="admin-field' + className + '">' +
          '<label>' + escapeHtml(field.label) + (field.required ? "（必填）" : "（选填）") + "</label>" +
          renderControl(field, row ? row[field.name] : "") +
        "</div>"
      );
    }).join("");
  }

  function renderSearchForm(fields) {
    return renderFields((fields || []).map(function (item) {
      return Object.assign({}, item, { required: false });
    }));
  }

  function renderCell(row, column) {
    var value = row[column.key];
    if (column.type === "money") {
      return formatMoney(value);
    }
    if (column.type === "status") {
      return '<span class="status-pill ' + statusClass(value) + '">' + escapeHtml(value || "-") + "</span>";
    }
    if (column.type === "long") {
      return '<span class="title-cell" title="' + escapeHtml(value || "-") + '">' + escapeHtml(value || "-") + "</span>";
    }
    return escapeHtml(value || "-");
  }

  function renderActions(actions, row) {
    return (
      '<div class="admin-actions">' +
        (actions || []).map(function (action) {
          return '<button class="admin-link-btn ' + escapeHtml(action.className || "") + '" type="button" data-action="' + escapeHtml(action.type) + '" data-id="' + row.id + '">' + escapeHtml(action.label) + "</button>";
        }).join("") +
      "</div>"
    );
  }

  function renderTable(page, rows) {
    if (!rows.length) {
      return '<div class="admin-empty">暂无匹配数据，请调整搜索条件后再试。</div>';
    }

    var head = page.columns.map(function (column) {
      return '<th>' + escapeHtml(column.label) + "</th>";
    }).join("") + "<th>列表操作</th>";

    var body = rows.map(function (row) {
      var cells = page.columns.map(function (column) {
        return "<td>" + renderCell(row, column) + "</td>";
      }).join("");
      return "<tr>" + cells + "<td>" + renderActions(page.actions, row) + "</td></tr>";
    }).join("");

    return '<table class="admin-table"><thead><tr>' + head + "</tr></thead><tbody>" + body + "</tbody></table>";
  }

  function renderToolbar(page) {
    var importText = page.title.indexOf("导入") > -1 ? "开始导入" : "新增" + page.entityName;
    return (
      '<button class="btn btn-dark admin-btn" type="button" data-toolbar-action="add">' +
        '<i class="bi bi-plus-lg"></i>' +
        escapeHtml(importText) +
      "</button>" +
      '<button class="btn btn-light admin-btn" type="button" data-toolbar-action="export">' +
        '<i class="bi bi-download"></i>' +
        "导出数据" +
      "</button>"
    );
  }

  function renderDetail(page, row) {
    return (
      '<div class="admin-detail-grid">' +
        page.columns.map(function (column) {
          return (
            '<div class="detail-item">' +
              '<span>' + escapeHtml(column.label) + "</span>" +
              '<strong>' + renderCell(row, column) + "</strong>" +
            "</div>"
          );
        }).join("") +
      "</div>"
    );
  }

  window.AdminComponents = {
    escapeHtml: escapeHtml,
    formatMoney: formatMoney,
    renderMenus: renderMenus,
    renderOverview: renderOverview,
    renderSearchForm: renderSearchForm,
    renderFields: renderFields,
    renderTable: renderTable,
    renderToolbar: renderToolbar,
    renderDetail: renderDetail,
    statusClass: statusClass
  };
})(jQuery);
