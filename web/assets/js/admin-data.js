(function () {
  "use strict";

  var statusOptions = ["全部", "启用", "禁用"];
  var productStatusOptions = ["全部", "上架", "下架"];
  var orderStatusOptions = ["全部", "待支付", "已支付", "已取消", "已过期"];
  var deliveryStatusOptions = ["全部", "待支付", "待发货", "已发货", "发货失败"];
  var paymentStatusOptions = ["全部", "待支付", "支付成功", "支付失败", "已过期"];
  var platformOptions = ["全部", "某音", "某手", "某视频号", "某红薯", "某百家号"];
  var audienceOptions = ["全部", "女粉优势", "男粉优势", "实名账号", "高收藏"];
  var certOptions = ["全部", "已实名", "未实名", "可自定义实名", "固定实名"];
  var payOptions = ["全部", "微信支付", "支付宝支付", "QQ支付"];

  function field(name, label, type, options, extra) {
    return Object.assign({
      name: name,
      label: label,
      type: type || "text",
      options: options || [],
      required: false
    }, extra || {});
  }

  function col(key, label, type, width) {
    return {
      key: key,
      label: label,
      type: type || "text",
      width: width || ""
    };
  }

  function actions(items) {
    return items.map(function (item) {
      var map = {
        view: "查看详情",
        edit: "编辑",
        delete: "删除",
        status: "状态切换",
        copy: "复制",
        card: "管理卡密",
        order: "查看订单",
        cancel: "取消订单",
        confirm: "确认支付",
        redeliver: "重新发货",
        release: "释放锁定",
        bind: "绑定商品",
        download: "下载失败记录",
        reimport: "重新导入",
        resetPassword: "重置密码",
        config: "配置二维码",
        markSuccess: "标记成功",
        markFail: "标记失败",
        regenQr: "重新生成二维码",
        audit: "审核"
      };
      return {
        type: item,
        label: map[item] || item,
        className: item === "delete" ? "danger" : (item === "view" || item === "edit" ? "primary" : "")
      };
    });
  }

  var productForm = [
    field("productCode", "商品编号", "text", [], { required: true, placeholder: "例如 xhs-001" }),
    field("title", "商品标题", "text", [], { required: true, className: "wide" }),
    field("subtitle", "商品副标题", "textarea", [], { required: true, className: "xwide" }),
    field("platformName", "账号分类", "select", platformOptions.slice(1), { required: true }),
    field("audienceCategoryName", "受众偏好", "select", audienceOptions.slice(1), { required: true }),
    field("price", "商品价格", "number", [], { required: true }),
    field("imageUrl", "商品图片", "text", [], { required: true, className: "wide" }),
    field("fansText", "粉丝展示值", "text", [], { required: true }),
    field("fansValue", "粉丝数值", "number", [], { required: true }),
    field("favoriteText", "收藏展示值", "text", [], { required: true }),
    field("favoriteValue", "收藏数值", "number", [], { required: true }),
    field("genderTag", "性别标签", "text", [], { required: true }),
    field("genderRatio", "男女粉比例", "text", [], { required: true, className: "wide" }),
    field("fansProfile", "粉丝画像", "textarea", [], { required: true, className: "xwide" }),
    field("certifiedText", "实名展示文案", "select", ["已实名", "未实名"], { required: true }),
    field("certificationMode", "实名模式", "select", ["固定实名", "可自定义实名"], { required: true }),
    field("introduction", "商品介绍", "textarea", [], { required: true, className: "xwide" }),
    field("instructions", "使用说明", "textarea", [], { required: true, className: "xwide" }),
    field("usageNotes", "常见说明", "textarea", [], { required: true, className: "xwide" }),
    field("sortOrder", "排序值", "number", [], { required: false }),
    field("statusText", "商品状态", "select", ["上架", "下架"], { required: true })
  ];

  var userForm = [
    field("username", "用户名", "text", [], { required: true }),
    field("nickname", "昵称", "text", [], { required: true }),
    field("password", "密码", "password", [], { required: true }),
    field("statusText", "用户状态", "select", ["正常", "禁用"], { required: true }),
    field("remark", "备注", "textarea", [], { className: "xwide" })
  ];

  var productRows = [
    {
      id: 1,
      productCode: "xhs-001",
      platformName: "某红薯",
      audienceCategoryName: "女粉优势",
      title: "某红薯穿搭女粉号 · 高互动日常种草",
      subtitle: "适合服饰、美妆、生活方式方向，账号干净，互动表现稳定。",
      price: 188,
      imageUrl: "assets/images/product-1.svg",
      stockTotal: 12,
      stockAvailable: 12,
      salesCount: 6,
      fansText: "2.1w",
      fansValue: 21000,
      favoriteText: "8.7w",
      favoriteValue: 87000,
      genderTag: "女粉 76%",
      genderRatio: "女粉 76% / 男粉 24%",
      fansProfile: "18-28 岁居多，一二线城市用户占比高",
      certifiedText: "已实名",
      certificationMode: "可自定义实名",
      introduction: "女粉占比较高，收藏表现优于普通种草号。",
      instructions: "收到账号后先检查实名状态和基础资料。",
      usageNotes: "下单后自动获得账号密码；建议立刻修改密码；默认无违规记录。",
      statusText: "上架",
      sortOrder: 10,
      createdAt: "2026-05-20 10:12:30"
    },
    {
      id: 2,
      productCode: "dy-002",
      platformName: "某音",
      audienceCategoryName: "男粉优势",
      title: "某音数码测评男粉号 · 高精准科技受众",
      subtitle: "偏数码、游戏、测评用户画像，适合消费电子领域。",
      price: 228,
      imageUrl: "assets/images/product-2.svg",
      stockTotal: 8,
      stockAvailable: 5,
      salesCount: 9,
      fansText: "1.7w",
      fansValue: 17000,
      favoriteText: "6.2w",
      favoriteValue: 62000,
      genderTag: "男粉 71%",
      genderRatio: "男粉 71% / 女粉 29%",
      fansProfile: "数码兴趣强，20-35 岁用户为主",
      certifiedText: "已实名",
      certificationMode: "固定实名",
      introduction: "目标受众偏男性，互动结构自然。",
      instructions: "建议保持数码或游戏相关内容风格。",
      usageNotes: "适合科技内容承接；内容标签稳定；收藏基础较好。",
      statusText: "上架",
      sortOrder: 9,
      createdAt: "2026-05-21 09:22:10"
    },
    {
      id: 3,
      productCode: "ks-005",
      platformName: "某手",
      audienceCategoryName: "男粉优势",
      title: "某手运动健身男粉号 · 活跃评论强",
      subtitle: "适合健身课程、运动装备、塑形赛道营销投放。",
      price: 198,
      imageUrl: "assets/images/product-5.svg",
      stockTotal: 10,
      stockAvailable: 10,
      salesCount: 2,
      fansText: "1.9w",
      fansValue: 19000,
      favoriteText: "7.4w",
      favoriteValue: 74000,
      genderTag: "男粉 68%",
      genderRatio: "男粉 68% / 女粉 32%",
      fansProfile: "关注健身、营养、塑形和训练计划",
      certifiedText: "未实名",
      certificationMode: "可自定义实名",
      introduction: "评论与私信活跃，适合作为承接转化型内容号。",
      instructions: "账号未实名，可按需补充相关资料。",
      usageNotes: "适合训练计划；评论参与度高；资料完整。",
      statusText: "下架",
      sortOrder: 4,
      createdAt: "2026-05-22 14:36:18"
    }
  ];

  var orderForm = [
    field("productTitle", "商品ID", "select", productRows.map(function (item) { return item.title; }), { required: true }),
    field("username", "用户ID", "text"),
    field("buyerName", "联系人", "text", [], { required: true }),
    field("contactValue", "联系方式", "text", [], { required: true }),
    field("remarks", "备注说明", "textarea", [], { className: "xwide" }),
    field("payMethodName", "支付方式ID", "select", payOptions.slice(1), { required: true }),
    field("orderAmount", "订单金额", "number", [], { required: true }),
    field("orderStatusText", "订单状态", "select", orderStatusOptions.slice(1), { required: true }),
    field("deliveryStatusText", "交付状态", "select", deliveryStatusOptions.slice(1), { required: true }),
    field("aftersale", "售后说明", "textarea", [], { className: "xwide" })
  ];

  var cardRows = [
    { id: 1, productCode: "xhs-001", productTitle: "某红薯穿搭女粉号 · 高互动日常种草", accountValue: "xhsdemo001", passwordValue: "SG001#pw8", cardStatusText: "未售出", lockedOrderNo: "-", soldOrderNo: "-", createdAt: "2026-05-20 10:30:00", soldAt: "-", remark: "首批导入" },
    { id: 2, productCode: "dy-002", productTitle: "某音数码测评男粉号 · 高精准科技受众", accountValue: "xhsdemo002", passwordValue: "SG002#pw8", cardStatusText: "已售出", lockedOrderNo: "SG202605220014", soldOrderNo: "SG202605220014", createdAt: "2026-05-20 11:20:00", soldAt: "2026-05-22 10:15:10", remark: "静态样单已交付" },
    { id: 3, productCode: "ks-005", productTitle: "某手运动健身男粉号 · 活跃评论强", accountValue: "xhsdemo005", passwordValue: "SG005#pw8", cardStatusText: "已禁用", lockedOrderNo: "-", soldOrderNo: "-", createdAt: "2026-05-21 12:00:00", soldAt: "-", remark: "等待复核" }
  ];

  var orderRows = [
    { id: 1, orderNo: "SG202605230001", username: "demo", productId: 4, productTitle: "某视频号母婴成长高互动号 · 信任感强", buyerName: "静态用户A", contactValue: "demo-a", remarks: "偏好长期运营账号", payMethodName: "微信支付", orderAmount: 318, orderStatusText: "已支付", deliveryStatusText: "已发货", accountValue: "xhsdemo004", passwordValue: "SG004#pw8", timelineText: "提交订单 / 微信支付成功 / 系统自动发号 / 买家复制卡密", aftersale: "账号已自动交付，售后窗口 24 小时内可联系处理登录异常。", createdAt: "2026-05-23 18:20:16", paidAt: "2026-05-23 18:23:01", deliveredAt: "2026-05-23 18:23:08" },
    { id: 2, orderNo: "SG202605220014", username: "demo", productId: 2, productTitle: "某音数码测评男粉号 · 高精准科技受众", buyerName: "静态用户B", contactValue: "demo-b", remarks: "需要评论活跃型账号", payMethodName: "支付宝支付", orderAmount: 228, orderStatusText: "已支付", deliveryStatusText: "已发货", accountValue: "xhsdemo002", passwordValue: "SG002#pw8", timelineText: "提交订单 / 支付宝支付成功 / 风控校验通过 / 卡密自动交付", aftersale: "可在售后窗口确认实名状态。", createdAt: "2026-05-22 10:11:42", paidAt: "2026-05-22 10:15:10", deliveredAt: "2026-05-22 10:15:18" },
    { id: 3, orderNo: "SG20260528162211", username: "免登录", productId: 1, productTitle: "某红薯穿搭女粉号 · 高互动日常种草", buyerName: "匿名买家", contactValue: "buyer@example.com", remarks: "自动发号演示订单", payMethodName: "QQ支付", orderAmount: 188, orderStatusText: "待支付", deliveryStatusText: "待支付", accountValue: "-", passwordValue: "-", timelineText: "提交订单 / 等待支付", aftersale: "", createdAt: "2026-05-28 16:22:11", paidAt: "-", deliveredAt: "-" }
  ];

  var userRows = [
    { id: 1, username: "demo", nickname: "演示买家", statusText: "正常", createdAt: "2026-05-01 10:00:00", lastLoginAt: "2026-05-28 15:30:12", orderCount: 2, totalAmount: 546, latestOrderAt: "2026-05-23 18:20:16", remark: "系统内置演示用户" },
    { id: 2, username: "buyer001", nickname: "长期买家", statusText: "正常", createdAt: "2026-05-18 09:12:00", lastLoginAt: "2026-05-27 20:10:08", orderCount: 5, totalAmount: 1260, latestOrderAt: "2026-05-27 19:42:30", remark: "偏好实名账号" },
    { id: 3, username: "risk_test", nickname: "风控测试", statusText: "禁用", createdAt: "2026-05-19 18:00:00", lastLoginAt: "2026-05-20 11:00:00", orderCount: 0, totalAmount: 0, latestOrderAt: "暂无订单", remark: "测试禁用状态" }
  ];

  var noticeRows = [
    { id: 1, title: "站内交易说明", content: "本系统为前台演示版，流程支持登录/注册、支付二维码演示、自动展示卡密与本地订单记录保存。", timeLabel: "刚刚更新", statusText: "显示", autoPopupText: "开启", sortOrder: 10, publishedAt: "2026-05-28 09:00:00", updatedAt: "2026-05-28 09:00:00" },
    { id: 2, title: "自动发货提示", content: "提交订单后请在 15 分钟内完成支付，支付成功将自动跳转订单列表并展示账号密码。", timeLabel: "24小时有效", statusText: "显示", autoPopupText: "开启", sortOrder: 9, publishedAt: "2026-05-28 09:10:00", updatedAt: "2026-05-28 09:10:00" },
    { id: 3, title: "售后规则", content: "卡密类商品属于特殊虚拟商品，交付后请及时核对，如有异常请尽快联系售前。", timeLabel: "服务中", statusText: "隐藏", autoPopupText: "关闭", sortOrder: 4, publishedAt: "2026-05-27 18:00:00", updatedAt: "2026-05-28 10:20:00" }
  ];

  var paymentMethodRows = [
    { id: 1, methodName: "微信支付", methodCode: "wechat", qrPrefix: "https://pay.demo/wechat", statusText: "启用", sortOrder: 10, createdAt: "2026-05-20 10:00:00" },
    { id: 2, methodName: "支付宝支付", methodCode: "alipay", qrPrefix: "https://pay.demo/alipay", statusText: "启用", sortOrder: 9, createdAt: "2026-05-20 10:05:00" },
    { id: 3, methodName: "QQ支付", methodCode: "qqpay", qrPrefix: "https://pay.demo/qq", statusText: "启用", sortOrder: 8, createdAt: "2026-05-20 10:10:00" }
  ];

  var paymentRecordRows = [
    { id: 1, paymentNo: "PAY202605230001", orderNo: "SG202605230001", payMethodName: "微信支付", payAmount: 318, payStatusText: "支付成功", qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/", expireAt: "2026-05-23 18:35:16", paidAt: "2026-05-23 18:23:01", createdAt: "2026-05-23 18:20:16" },
    { id: 2, paymentNo: "PAY202605220014", orderNo: "SG202605220014", payMethodName: "支付宝支付", payAmount: 228, payStatusText: "支付成功", qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/", expireAt: "2026-05-22 10:26:42", paidAt: "2026-05-22 10:15:10", createdAt: "2026-05-22 10:11:42" },
    { id: 3, paymentNo: "PAY202605281622", orderNo: "SG20260528162211", payMethodName: "QQ支付", payAmount: 188, payStatusText: "待支付", qrCodeUrl: "https://api.qrserver.com/v1/create-qr-code/", expireAt: "2026-05-28 16:37:11", paidAt: "-", createdAt: "2026-05-28 16:22:11" }
  ];

  var platformRows = [
    { id: 1, name: "某音", code: "douyin", statusText: "启用", sortOrder: 10, createdAt: "2026-05-20 10:00:00" },
    { id: 2, name: "某手", code: "kuaishou", statusText: "启用", sortOrder: 9, createdAt: "2026-05-20 10:05:00" },
    { id: 3, name: "某红薯", code: "xhs", statusText: "启用", sortOrder: 8, createdAt: "2026-05-20 10:10:00" }
  ];

  var audienceRows = [
    { id: 1, name: "女粉优势", code: "female_fans", statusText: "启用", sortOrder: 10, createdAt: "2026-05-20 10:00:00" },
    { id: 2, name: "男粉优势", code: "male_fans", statusText: "启用", sortOrder: 9, createdAt: "2026-05-20 10:05:00" },
    { id: 3, name: "高收藏", code: "high_favorite", statusText: "启用", sortOrder: 8, createdAt: "2026-05-20 10:10:00" }
  ];

  var configRows = [
    { id: 1, configKey: "site_name", configName: "站点名称", configValue: "薯光卡密", statusText: "启用", remark: "前台展示站点名称", updatedAt: "2026-05-28 12:00:00" },
    { id: 2, configKey: "payment_expire_minutes", configName: "支付二维码有效期", configValue: "15", statusText: "启用", remark: "单位：分钟", updatedAt: "2026-05-28 12:10:00" },
    { id: 3, configKey: "customer_service_text", configName: "售后说明", configValue: "卡密交付后 24 小时内可联系处理登录异常。", statusText: "启用", remark: "订单详情展示", updatedAt: "2026-05-28 12:20:00" }
  ];

  var adminRows = [
    { id: 1, username: "admin", nickname: "超级管理员", statusText: "正常", lastLoginAt: "2026-05-28 20:00:00", createdAt: "2026-05-01 09:00:00", remark: "拥有全部后台权限" },
    { id: 2, username: "operator", nickname: "运营管理员", statusText: "正常", lastLoginAt: "2026-05-28 18:12:00", createdAt: "2026-05-12 10:30:00", remark: "负责商品和卡密维护" },
    { id: 3, username: "service", nickname: "售后管理员", statusText: "禁用", lastLoginAt: "2026-05-22 16:00:00", createdAt: "2026-05-14 11:00:00", remark: "售后权限演示账号" }
  ];

  var pages = {
    productList: {
      parent: "商品管理",
      title: "商品列表",
      entityName: "商品",
      summary: ["商品总数 3", "上架商品 2", "可售库存 27", "累计销量 17"],
      searches: [
        field("title", "商品标题", "text"),
        field("platformName", "账号分类", "select", platformOptions),
        field("audienceCategoryName", "受众偏好", "select", audienceOptions),
        field("certificationMode", "实名状态", "select", certOptions),
        field("statusText", "商品状态", "select", productStatusOptions),
        field("priceRange", "价格区间", "range"),
        field("fansRange", "粉丝数区间", "range"),
        field("favoriteRange", "收藏数区间", "range"),
        field("createdAt", "创建时间", "dateRange")
      ],
      columns: [col("id", "商品ID"), col("productCode", "商品编号"), col("title", "商品标题", "long"), col("platformName", "账号分类"), col("audienceCategoryName", "受众偏好"), col("price", "价格", "money"), col("stockAvailable", "库存数量"), col("fansText", "粉丝数"), col("favoriteText", "收藏数"), col("genderRatio", "男女粉比例"), col("certifiedText", "实名状态", "status"), col("statusText", "商品状态", "status"), col("sortOrder", "排序值"), col("createdAt", "创建时间")],
      actions: actions(["view", "edit", "delete", "status", "copy", "card"]),
      formFields: productForm,
      rows: productRows
    },
    productDetail: {
      parent: "商品管理",
      title: "商品详情",
      entityName: "商品",
      summary: ["详情字段 21", "关联卡密 30", "最近订单 3", "支持上下架"],
      searches: [field("id", "商品ID", "text"), field("productCode", "商品编号", "text")],
      columns: [col("productCode", "商品编号"), col("title", "商品标题", "long"), col("imageUrl", "商品图片"), col("price", "价格", "money"), col("stockAvailable", "可售库存"), col("fansProfile", "粉丝画像", "long"), col("introduction", "商品介绍", "long"), col("statusText", "状态", "status")],
      actions: actions(["view", "edit", "status", "delete", "card", "order"]),
      formFields: productForm,
      rows: productRows
    },
    cardList: {
      parent: "卡密库存管理",
      title: "卡密列表",
      entityName: "卡密",
      summary: ["卡密总数 3", "未售出 1", "已售出 1", "已禁用 1"],
      searches: [field("productTitle", "商品标题", "text"), field("productCode", "商品编号", "text"), field("accountValue", "账号", "text"), field("cardStatusText", "卡密状态", "select", ["全部", "未售出", "已锁定", "已售出", "已禁用"]), field("createdAt", "导入时间", "dateRange"), field("soldAt", "售出时间", "dateRange")],
      columns: [col("id", "卡密ID"), col("productCode", "商品编号"), col("productTitle", "商品标题", "long"), col("accountValue", "账号"), col("passwordValue", "密码"), col("cardStatusText", "卡密状态", "status"), col("lockedOrderNo", "锁定订单号"), col("soldOrderNo", "售出订单号"), col("createdAt", "导入时间"), col("soldAt", "售出时间")],
      actions: actions(["view", "edit", "delete", "status", "release", "bind"]),
      formFields: [field("productTitle", "商品ID", "select", productRows.map(function (item) { return item.title; }), { required: true }), field("accountValue", "账号", "text", [], { required: true }), field("passwordValue", "密码", "text", [], { required: true }), field("cardStatusText", "卡密状态", "select", ["未售出", "已锁定", "已售出", "已禁用"], { required: true }), field("remark", "备注", "textarea", [], { className: "xwide" })],
      rows: cardRows
    },
    cardImport: {
      parent: "卡密库存管理",
      title: "批量导入卡密",
      entityName: "导入批次",
      summary: ["导入批次 3", "成功数量 28", "失败数量 2", "最近导入 今日"],
      searches: [field("productTitle", "商品标题", "text"), field("batchNo", "导入批次号", "text"), field("importStatusText", "导入状态", "select", ["全部", "成功", "失败", "部分成功"]), field("createdAt", "导入时间", "dateRange")],
      columns: [col("batchNo", "导入批次号"), col("productTitle", "商品标题", "long"), col("totalCount", "导入总数"), col("successCount", "成功数量"), col("failedCount", "失败数量"), col("importStatusText", "导入状态", "status"), col("operatorName", "操作人"), col("createdAt", "导入时间")],
      actions: actions(["view", "download", "reimport"]),
      formFields: [field("productTitle", "商品ID", "select", productRows.map(function (item) { return item.title; }), { required: true }), field("fileName", "卡密文件", "file", [], { required: true }), field("importFormat", "导入格式", "select", ["账号密码两列", "账号----密码", "账号:密码"], { required: true }), field("overwriteDuplicate", "覆盖重复账号", "select", ["否", "是"], { required: true })],
      rows: [
        { id: 1, batchNo: "IMP20260528001", productTitle: "某红薯穿搭女粉号 · 高互动日常种草", totalCount: 12, successCount: 12, failedCount: 0, importStatusText: "成功", operatorName: "operator", createdAt: "2026-05-28 10:00:00" },
        { id: 2, batchNo: "IMP20260527002", productTitle: "某音数码测评男粉号 · 高精准科技受众", totalCount: 10, successCount: 8, failedCount: 2, importStatusText: "部分成功", operatorName: "operator", createdAt: "2026-05-27 17:00:00" },
        { id: 3, batchNo: "IMP20260526003", productTitle: "某手运动健身男粉号 · 活跃评论强", totalCount: 10, successCount: 10, failedCount: 0, importStatusText: "成功", operatorName: "admin", createdAt: "2026-05-26 12:30:00" }
      ]
    },
    orderList: {
      parent: "订单管理",
      title: "订单列表",
      entityName: "订单",
      summary: ["订单总数 3", "已支付 2", "待支付 1", "累计金额 ¥734"],
      searches: [field("orderNo", "订单号", "text"), field("productTitle", "商品标题", "text"), field("username", "买家用户名", "text"), field("buyerName", "联系人", "text"), field("contactValue", "联系方式", "text"), field("payMethodName", "支付方式", "select", payOptions), field("orderStatusText", "订单状态", "select", orderStatusOptions), field("deliveryStatusText", "交付状态", "select", deliveryStatusOptions), field("createdAt", "下单时间", "dateRange"), field("paidAt", "支付时间", "dateRange")],
      columns: [col("id", "订单ID"), col("orderNo", "订单号"), col("productTitle", "商品标题", "long"), col("username", "买家用户名"), col("buyerName", "联系人"), col("contactValue", "联系方式"), col("payMethodName", "支付方式"), col("orderAmount", "订单金额", "money"), col("orderStatusText", "订单状态", "status"), col("deliveryStatusText", "交付状态", "status"), col("createdAt", "下单时间"), col("paidAt", "支付时间"), col("deliveredAt", "交付时间")],
      actions: actions(["view", "edit", "delete", "cancel", "confirm", "redeliver"]),
      formFields: orderForm,
      rows: orderRows
    },
    orderDetail: {
      parent: "订单管理",
      title: "订单详情",
      entityName: "订单",
      summary: ["基础信息", "支付信息", "交付卡密", "订单流程"],
      searches: [field("orderNo", "订单号", "text")],
      columns: [col("orderNo", "订单号"), col("productTitle", "商品标题", "long"), col("buyerName", "联系人"), col("contactValue", "联系方式"), col("payMethodName", "支付方式"), col("accountValue", "交付账号"), col("passwordValue", "交付密码"), col("orderAmount", "成交金额", "money"), col("orderStatusText", "订单状态", "status"), col("deliveryStatusText", "交付状态", "status"), col("timelineText", "订单流程", "long")],
      actions: actions(["view", "edit", "confirm", "redeliver", "copy", "delete"]),
      formFields: orderForm,
      rows: orderRows
    },
    userList: {
      parent: "用户管理",
      title: "用户列表",
      entityName: "用户",
      summary: ["用户总数 3", "正常用户 2", "禁用用户 1", "累计支付 ¥1806"],
      searches: [field("username", "用户名", "text"), field("nickname", "昵称", "text"), field("statusText", "用户状态", "select", ["全部", "正常", "禁用"]), field("createdAt", "注册时间", "dateRange"), field("lastLoginAt", "最近登录时间", "dateRange")],
      columns: [col("id", "用户ID"), col("username", "用户名"), col("nickname", "昵称"), col("statusText", "用户状态", "status"), col("createdAt", "注册时间"), col("lastLoginAt", "最近登录时间"), col("orderCount", "订单数量"), col("totalAmount", "累计支付金额", "money")],
      actions: actions(["view", "edit", "delete", "status", "resetPassword", "order"]),
      formFields: userForm,
      rows: userRows
    },
    userDetail: {
      parent: "用户管理",
      title: "用户详情",
      entityName: "用户",
      summary: ["基础信息", "订单统计", "最近订单", "登录记录"],
      searches: [field("id", "用户ID", "text"), field("username", "用户名", "text")],
      columns: [col("id", "用户ID"), col("username", "用户名"), col("nickname", "昵称"), col("statusText", "用户状态", "status"), col("orderCount", "订单数量"), col("totalAmount", "累计支付", "money"), col("latestOrderAt", "最近下单"), col("lastLoginAt", "最近登录")],
      actions: actions(["view", "edit", "status", "resetPassword", "order"]),
      formFields: userForm,
      rows: userRows
    },
    noticeList: {
      parent: "网站公告管理",
      title: "公告列表",
      entityName: "公告",
      summary: ["公告总数 3", "显示中 2", "自动弹窗 2", "隐藏 1"],
      searches: [field("title", "公告标题", "text"), field("statusText", "公告状态", "select", ["全部", "显示", "隐藏"]), field("autoPopupText", "自动弹窗", "select", ["全部", "开启", "关闭"]), field("publishedAt", "发布时间", "dateRange")],
      columns: [col("id", "公告ID"), col("title", "公告标题"), col("content", "公告内容", "long"), col("timeLabel", "时间标签"), col("statusText", "公告状态", "status"), col("autoPopupText", "自动弹窗", "status"), col("sortOrder", "排序值"), col("publishedAt", "发布时间"), col("updatedAt", "更新时间")],
      actions: actions(["view", "edit", "delete", "status"]),
      formFields: [field("title", "公告标题", "text", [], { required: true }), field("content", "公告内容", "textarea", [], { required: true, className: "xwide" }), field("timeLabel", "时间标签", "text", [], { required: true }), field("statusText", "公告状态", "select", ["显示", "隐藏"], { required: true }), field("autoPopupText", "自动弹窗", "select", ["开启", "关闭"], { required: true }), field("sortOrder", "排序值", "number")],
      rows: noticeRows
    },
    paymentMethods: {
      parent: "支付管理",
      title: "支付方式列表",
      entityName: "支付方式",
      summary: ["支付方式 3", "启用 3", "禁用 0", "扫码支付"],
      searches: [field("methodName", "支付方式名称", "text"), field("methodCode", "支付方式编码", "text"), field("statusText", "支付状态", "select", statusOptions)],
      columns: [col("id", "支付方式ID"), col("methodName", "支付方式名称"), col("methodCode", "支付方式编码"), col("qrPrefix", "二维码前缀", "long"), col("statusText", "支付状态", "status"), col("sortOrder", "排序值"), col("createdAt", "创建时间")],
      actions: actions(["view", "edit", "delete", "status", "config"]),
      formFields: [field("methodName", "支付方式名称", "text", [], { required: true }), field("methodCode", "支付方式编码", "text", [], { required: true }), field("qrPrefix", "二维码前缀", "text", [], { className: "wide" }), field("statusText", "支付状态", "select", ["启用", "禁用"], { required: true }), field("sortOrder", "排序值", "number")],
      rows: paymentMethodRows
    },
    paymentRecords: {
      parent: "支付管理",
      title: "支付记录",
      entityName: "支付记录",
      summary: ["支付记录 3", "成功 2", "待支付 1", "支付金额 ¥734"],
      searches: [field("paymentNo", "支付流水号", "text"), field("orderNo", "订单号", "text"), field("payMethodName", "支付方式", "select", payOptions), field("payStatusText", "支付状态", "select", paymentStatusOptions), field("createdAt", "创建时间", "dateRange"), field("paidAt", "支付时间", "dateRange")],
      columns: [col("id", "支付记录ID"), col("paymentNo", "支付流水号"), col("orderNo", "订单号"), col("payMethodName", "支付方式"), col("payAmount", "支付金额", "money"), col("payStatusText", "支付状态", "status"), col("qrCodeUrl", "二维码地址", "long"), col("expireAt", "过期时间"), col("paidAt", "支付时间"), col("createdAt", "创建时间")],
      actions: actions(["view", "edit", "delete", "markSuccess", "markFail", "regenQr"]),
      formFields: [field("orderNo", "订单ID", "select", orderRows.map(function (item) { return item.orderNo; }), { required: true }), field("payMethodName", "支付方式ID", "select", payOptions.slice(1), { required: true }), field("paymentNo", "支付流水号", "text", [], { required: true }), field("payAmount", "支付金额", "number", [], { required: true }), field("qrCodeUrl", "二维码地址", "text", [], { required: true, className: "wide" }), field("payStatusText", "支付状态", "select", paymentStatusOptions.slice(1), { required: true }), field("expireAt", "过期时间", "datetime", [], { required: true })],
      rows: paymentRecordRows
    },
    platforms: {
      parent: "分类配置",
      title: "账号分类",
      entityName: "账号分类",
      summary: ["分类总数 3", "启用 3", "禁用 0", "前台筛选"],
      searches: [field("name", "分类名称", "text"), field("statusText", "分类状态", "select", statusOptions)],
      columns: [col("id", "分类ID"), col("name", "分类名称"), col("code", "分类编码"), col("statusText", "分类状态", "status"), col("sortOrder", "排序值"), col("createdAt", "创建时间")],
      actions: actions(["view", "edit", "delete", "status"]),
      formFields: [field("name", "分类名称", "text", [], { required: true }), field("code", "分类编码", "text", [], { required: true }), field("statusText", "分类状态", "select", ["启用", "禁用"], { required: true }), field("sortOrder", "排序值", "number")],
      rows: platformRows
    },
    audiences: {
      parent: "分类配置",
      title: "受众偏好",
      entityName: "受众偏好",
      summary: ["偏好总数 3", "启用 3", "禁用 0", "商品筛选"],
      searches: [field("name", "偏好名称", "text"), field("statusText", "偏好状态", "select", statusOptions)],
      columns: [col("id", "偏好ID"), col("name", "偏好名称"), col("code", "偏好编码"), col("statusText", "偏好状态", "status"), col("sortOrder", "排序值"), col("createdAt", "创建时间")],
      actions: actions(["view", "edit", "delete", "status"]),
      formFields: [field("name", "偏好名称", "text", [], { required: true }), field("code", "偏好编码", "text", [], { required: true }), field("statusText", "偏好状态", "select", ["启用", "禁用"], { required: true }), field("sortOrder", "排序值", "number")],
      rows: audienceRows
    },
    siteConfigs: {
      parent: "系统配置",
      title: "站点配置",
      entityName: "站点配置",
      summary: ["配置项 3", "启用 3", "禁用 0", "前台生效"],
      searches: [field("configKey", "配置键", "text"), field("statusText", "配置状态", "select", statusOptions)],
      columns: [col("id", "配置ID"), col("configKey", "配置键"), col("configName", "配置名称"), col("configValue", "配置值", "long"), col("statusText", "配置状态", "status"), col("updatedAt", "更新时间")],
      actions: actions(["view", "edit", "delete", "status"]),
      formFields: [field("configKey", "配置键", "text", [], { required: true }), field("configName", "配置名称", "text", [], { required: true }), field("configValue", "配置值", "textarea", [], { required: true, className: "xwide" }), field("statusText", "配置状态", "select", ["启用", "禁用"], { required: true }), field("remark", "备注", "textarea", [], { className: "xwide" })],
      rows: configRows
    },
    adminUsers: {
      parent: "后台管理员",
      title: "管理员列表",
      entityName: "管理员",
      summary: ["管理员 3", "正常 2", "禁用 1", "后台权限"],
      searches: [field("username", "管理员用户名", "text"), field("nickname", "管理员昵称", "text"), field("statusText", "管理员状态", "select", ["全部", "正常", "禁用"]), field("createdAt", "创建时间", "dateRange")],
      columns: [col("id", "管理员ID"), col("username", "管理员用户名"), col("nickname", "管理员昵称"), col("statusText", "管理员状态", "status"), col("lastLoginAt", "最近登录时间"), col("createdAt", "创建时间")],
      actions: actions(["view", "edit", "delete", "status", "resetPassword"]),
      formFields: [field("username", "管理员用户名", "text", [], { required: true }), field("nickname", "管理员昵称", "text", [], { required: true }), field("password", "密码", "password", [], { required: true }), field("statusText", "管理员状态", "select", ["正常", "禁用"], { required: true }), field("remark", "备注", "textarea", [], { className: "xwide" })],
      rows: adminRows
    }
  };

  window.AdminMockData = {
    menus: [
      { title: "商品管理", icon: "bi-bag-check", children: [{ key: "productList", title: "商品列表" }, { key: "productDetail", title: "商品详情" }] },
      { title: "卡密库存管理", icon: "bi-key", children: [{ key: "cardList", title: "卡密列表" }, { key: "cardImport", title: "批量导入卡密" }] },
      { title: "订单管理", icon: "bi-receipt", children: [{ key: "orderList", title: "订单列表" }, { key: "orderDetail", title: "订单详情" }] },
      { title: "用户管理", icon: "bi-people", children: [{ key: "userList", title: "用户列表" }, { key: "userDetail", title: "用户详情" }] },
      { title: "网站公告管理", icon: "bi-megaphone", children: [{ key: "noticeList", title: "公告列表" }] },
      { title: "支付管理", icon: "bi-credit-card", children: [{ key: "paymentMethods", title: "支付方式列表" }, { key: "paymentRecords", title: "支付记录" }] },
      { title: "分类配置", icon: "bi-diagram-3", children: [{ key: "platforms", title: "账号分类" }, { key: "audiences", title: "受众偏好" }] },
      { title: "系统配置", icon: "bi-sliders", children: [{ key: "siteConfigs", title: "站点配置" }] },
      { title: "后台管理员", icon: "bi-person-gear", children: [{ key: "adminUsers", title: "管理员列表" }] }
    ],
    pages: pages
  };
})();
