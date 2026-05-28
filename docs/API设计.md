# API设计

## 说明

- 当前 C 端是静态前台，没有 `fetch`、`$.ajax` 或真实 HTTP API。
- 当前数据来源为 `web/assets/js/data.js`，本地交互状态存储在 LocalStorage。
- 本文第一部分先如实记录当前 C 端实际数据接口来源，再给出后续后端化时建议的 C 端接口。
- B 端接口根据后台规划生成，所有管理模块均提供列表、详情、新增、编辑、删除、状态修改接口。

## 一、C端接口

### 1. 当前实际实现提取

#### 1.1 商品列表数据

- 实际来源：`window.AutoAccountData.products`
- 使用页面：`index.html`
- 使用函数：`getProducts()`、`getFilteredProducts()`、`renderProducts()`
- 筛选参数：`keyword`、`platform`、`category`、`sort`、`certification`、`minPrice`、`maxPrice`
- 响应字段：`id`、`platform`、`category`、`title`、`subtitle`、`price`、`stock`、`fans`、`likes`、`fansValue`、`likesValue`、`genderTag`、`genderRatio`、`fansProfile`、`certified`、`certifiedText`、`certificationMode`、`image`、`usage`、`introduction`、`instructions`、`credentials`

#### 1.2 商品详情数据

- 实际来源：`window.AutoAccountData.products`
- 使用页面：`detail.html?id=xhs-001`
- 使用函数：`getProductById(id)`、`renderDetailPage()`
- 请求参数：`id`
- 响应字段：同商品列表，额外用于详情展示 `usage`、`introduction`、`instructions`、`fansProfile`、`credentials`

#### 1.3 网站公告数据

- 实际来源：`window.AutoAccountData.notices`
- 使用页面：全站自动注入弹窗
- 使用函数：`renderNoticeModalList()`、`initSiteNoticeModal()`
- 本地状态：`auto-account-notice-hide-date`
- 响应字段：`title`、`content`、`time`

#### 1.4 支付方式数据

- 实际来源：`window.AutoAccountData.paymentMethods`
- 使用页面：`detail.html`
- 使用函数：`getPaymentMethods()`、`buildPaymentChoices()`
- 响应字段：支付方式名称字符串，如 `微信支付`、`支付宝支付`、`QQ支付`

#### 1.5 订单提交与待支付

- 实际来源：LocalStorage `auto-account-pending-payment`
- 使用页面：`detail.html`
- 使用函数：`savePendingPayment(payment)`、`renderPendingPayment(order, product)`、`startPaymentCountdown(deadline)`
- 请求字段：`productId`、`productTitle`、`price`、`buyerName`、`contactValue`、`remarks`、`payMethod`
- 响应字段：`orderId`、`paymentExpireAt`、`payMethod`、`deliveryStatus`、`status`、`credentials`

#### 1.6 支付完成与订单保存

- 实际来源：LocalStorage `auto-account-orders`
- 使用页面：`detail.html`、`orders.html`、`order-detail.html`
- 使用函数：`completePayment(order)`、`pushOrder(order)`、`getOrders()`
- 请求字段：`orderId`
- 响应字段：`orderId`、`productId`、`productTitle`、`price`、`buyerName`、`contactValue`、`remarks`、`createdAt`、`paidAt`、`payMethod`、`deliveryStatus`、`status`、`credentials`、`timeline`、`aftersale`

#### 1.7 登录注册

- 实际来源：LocalStorage `auto-account-users`、`auto-account-user`
- 使用页面：`auth.html`、`profile.html`
- 使用函数：`getUsers()`、`saveUsers(users)`、`saveCurrentUser(user)`、`getCurrentUser()`
- 注册字段：`username`、`password`、`confirmPassword`
- 登录字段：`username`、`password`
- 响应字段：`username`、`nickname`、`joinedAt`

### 2. C端后端化接口建议

#### 2.1 获取网站公告

- 请求方式：`GET`
- 请求路径：`/api/v1/notices`
- 请求参数：`autoPopup` 可选，1只返回自动弹窗公告
- 响应字段：`id`、`title`、`content`、`timeLabel`、`autoPopup`、`publishedAt`

#### 2.2 获取账号分类

- 请求方式：`GET`
- 请求路径：`/api/v1/platforms`
- 请求参数：无
- 响应字段：`id`、`name`、`code`

#### 2.3 获取受众偏好

- 请求方式：`GET`
- 请求路径：`/api/v1/audience-categories`
- 请求参数：无
- 响应字段：`id`、`name`、`code`

#### 2.4 商品列表

- 请求方式：`GET`
- 请求路径：`/api/v1/products`
- 请求参数：`keyword`、`platformId`、`audienceCategoryId`、`certification`、`minPrice`、`maxPrice`、`sort`、`page`、`pageSize`
- 响应字段：`id`、`productCode`、`platformName`、`audienceCategoryName`、`title`、`subtitle`、`price`、`imageUrl`、`stockAvailable`、`fansText`、`fansValue`、`favoriteText`、`favoriteValue`、`genderTag`、`genderRatio`、`certifiedText`、`certificationMode`

#### 2.5 商品详情

- 请求方式：`GET`
- 请求路径：`/api/v1/products/{id}`
- 请求参数：`id`
- 响应字段：`id`、`productCode`、`platformName`、`audienceCategoryName`、`title`、`subtitle`、`price`、`imageUrl`、`stockAvailable`、`fansText`、`fansValue`、`favoriteText`、`favoriteValue`、`genderTag`、`genderRatio`、`fansProfile`、`isCertified`、`certifiedText`、`certificationMode`、`introduction`、`instructions`、`usageNotes`

#### 2.6 获取支付方式

- 请求方式：`GET`
- 请求路径：`/api/v1/payment-methods`
- 请求参数：无
- 响应字段：`id`、`methodName`、`methodCode`

#### 2.7 创建订单并生成支付二维码

- 请求方式：`POST`
- 请求路径：`/api/v1/orders`
- 请求参数：`productId`、`buyerName`、`contactValue`、`remarks`、`payMethodId`
- 响应字段：`orderId`、`orderNo`、`productTitle`、`orderAmount`、`payMethodName`、`paymentNo`、`qrCodeUrl`、`paymentExpireAt`、`orderStatus`、`deliveryStatus`

#### 2.8 查询订单支付状态

- 请求方式：`GET`
- 请求路径：`/api/v1/orders/{orderNo}/payment-status`
- 请求参数：`orderNo`
- 响应字段：`orderNo`、`orderStatus`、`deliveryStatus`、`paidAt`、`deliveredAt`

#### 2.9 订单列表

- 请求方式：`GET`
- 请求路径：`/api/v1/orders`
- 请求参数：`userToken` 可选，`contactValue` 可选，`page`、`pageSize`
- 响应字段：`orderNo`、`productTitle`、`buyerName`、`contactValue`、`payMethodName`、`orderAmount`、`orderStatus`、`deliveryStatus`、`createdAt`、`paidAt`

#### 2.10 订单详情

- 请求方式：`GET`
- 请求路径：`/api/v1/orders/{orderNo}`
- 请求参数：`orderNo`
- 响应字段：`orderNo`、`productTitle`、`buyerName`、`contactValue`、`remarks`、`payMethodName`、`orderAmount`、`orderStatus`、`deliveryStatus`、`accountValue`、`passwordValue`、`timeline`、`aftersale`、`createdAt`、`paidAt`、`deliveredAt`

#### 2.11 用户注册

- 请求方式：`POST`
- 请求路径：`/api/v1/auth/register`
- 请求参数：`username`、`password`、`confirmPassword`
- 响应字段：`token`、`user.id`、`user.username`、`user.nickname`、`user.createdAt`

#### 2.12 用户登录

- 请求方式：`POST`
- 请求路径：`/api/v1/auth/login`
- 请求参数：`username`、`password`
- 响应字段：`token`、`user.id`、`user.username`、`user.nickname`、`user.createdAt`

#### 2.13 个人中心

- 请求方式：`GET`
- 请求路径：`/api/v1/profile`
- 请求参数：Header `Authorization`
- 响应字段：`id`、`username`、`nickname`、`createdAt`、`totalOrders`、`totalAmount`、`latestOrderAt`

#### 2.14 退出登录

- 请求方式：`POST`
- 请求路径：`/api/v1/auth/logout`
- 请求参数：Header `Authorization`
- 响应字段：`success`

## 二、B端接口

### 1. 后台登录

#### 1.1 管理员登录

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/auth/login`
- 请求参数：`username`、`password`
- 响应字段：`token`、`admin.id`、`admin.username`、`admin.nickname`

#### 1.2 管理员退出

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/auth/logout`
- 请求参数：Header `Authorization`
- 响应字段：`success`

### 2. 商品管理

#### 2.1 商品列表

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/products`
- 请求参数：`keyword`、`productCode`、`platformId`、`audienceCategoryId`、`isCertified`、`certificationMode`、`status`、`minPrice`、`maxPrice`、`minFansValue`、`maxFansValue`、`minFavoriteValue`、`maxFavoriteValue`、`startCreatedAt`、`endCreatedAt`、`page`、`pageSize`
- 响应字段：`id`、`productCode`、`title`、`platformId`、`platformName`、`audienceCategoryId`、`audienceCategoryName`、`price`、`stockTotal`、`stockAvailable`、`fansText`、`fansValue`、`favoriteText`、`favoriteValue`、`genderTag`、`genderRatio`、`isCertified`、`certifiedText`、`certificationMode`、`status`、`sortOrder`、`createdAt`

#### 2.2 商品详情

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/products/{id}`
- 请求参数：`id`
- 响应字段：`id`、`productCode`、`platformId`、`audienceCategoryId`、`title`、`subtitle`、`price`、`imageUrl`、`fansText`、`fansValue`、`favoriteText`、`favoriteValue`、`genderTag`、`genderRatio`、`fansProfile`、`isCertified`、`certifiedText`、`certificationMode`、`introduction`、`instructions`、`usageNotes`、`stockTotal`、`stockAvailable`、`salesCount`、`status`、`sortOrder`、`createdAt`、`updatedAt`

#### 2.3 新增商品

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/products`
- 请求参数：`productCode`、`platformId`、`audienceCategoryId`、`title`、`subtitle`、`price`、`imageUrl`、`fansText`、`fansValue`、`favoriteText`、`favoriteValue`、`genderTag`、`genderRatio`、`fansProfile`、`isCertified`、`certifiedText`、`certificationMode`、`introduction`、`instructions`、`usageNotes`、`status`、`sortOrder`
- 响应字段：`id`

#### 2.4 编辑商品

- 请求方式：`PUT`
- 请求路径：`/admin-api/v1/products/{id}`
- 请求参数：`id`、`productCode`、`platformId`、`audienceCategoryId`、`title`、`subtitle`、`price`、`imageUrl`、`fansText`、`fansValue`、`favoriteText`、`favoriteValue`、`genderTag`、`genderRatio`、`fansProfile`、`isCertified`、`certifiedText`、`certificationMode`、`introduction`、`instructions`、`usageNotes`、`status`、`sortOrder`
- 响应字段：`success`

#### 2.5 删除商品

- 请求方式：`DELETE`
- 请求路径：`/admin-api/v1/products/{id}`
- 请求参数：`id`
- 响应字段：`success`

#### 2.6 修改商品状态

- 请求方式：`PATCH`
- 请求路径：`/admin-api/v1/products/{id}/status`
- 请求参数：`id`、`status`
- 响应字段：`success`

### 3. 卡密库存管理

#### 3.1 卡密列表

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/product-cards`
- 请求参数：`productId`、`productCode`、`title`、`accountValue`、`cardStatus`、`startCreatedAt`、`endCreatedAt`、`startSoldAt`、`endSoldAt`、`page`、`pageSize`
- 响应字段：`id`、`productId`、`productCode`、`productTitle`、`accountValue`、`passwordValue`、`cardStatus`、`lockedOrderId`、`soldOrderId`、`lockedAt`、`soldAt`、`remark`、`createdAt`

#### 3.2 卡密详情

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/product-cards/{id}`
- 请求参数：`id`
- 响应字段：`id`、`productId`、`accountValue`、`passwordValue`、`cardStatus`、`lockedOrderId`、`soldOrderId`、`lockedAt`、`soldAt`、`remark`、`createdAt`、`updatedAt`

#### 3.3 新增卡密

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/product-cards`
- 请求参数：`productId`、`accountValue`、`passwordValue`、`cardStatus`、`remark`
- 响应字段：`id`

#### 3.4 编辑卡密

- 请求方式：`PUT`
- 请求路径：`/admin-api/v1/product-cards/{id}`
- 请求参数：`id`、`productId`、`accountValue`、`passwordValue`、`cardStatus`、`remark`
- 响应字段：`success`

#### 3.5 删除卡密

- 请求方式：`DELETE`
- 请求路径：`/admin-api/v1/product-cards/{id}`
- 请求参数：`id`
- 响应字段：`success`

#### 3.6 修改卡密状态

- 请求方式：`PATCH`
- 请求路径：`/admin-api/v1/product-cards/{id}/status`
- 请求参数：`id`、`cardStatus`
- 响应字段：`success`

#### 3.7 批量导入卡密

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/product-cards/import`
- 请求参数：`productId`、`file`、`importFormat`、`overwriteDuplicate`
- 响应字段：`batchNo`、`totalCount`、`successCount`、`failedCount`、`importStatus`、`failedFileUrl`

### 4. 订单管理

#### 4.1 订单列表

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/orders`
- 请求参数：`orderNo`、`productTitle`、`username`、`buyerName`、`contactValue`、`payMethodId`、`orderStatus`、`deliveryStatus`、`startCreatedAt`、`endCreatedAt`、`startPaidAt`、`endPaidAt`、`page`、`pageSize`
- 响应字段：`id`、`orderNo`、`userId`、`username`、`productId`、`productTitle`、`buyerName`、`contactValue`、`payMethodId`、`payMethodName`、`orderAmount`、`orderStatus`、`deliveryStatus`、`createdAt`、`paidAt`、`deliveredAt`

#### 4.2 订单详情

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/orders/{id}`
- 请求参数：`id`
- 响应字段：`id`、`orderNo`、`userId`、`productId`、`productTitle`、`buyerName`、`contactValue`、`remarks`、`payMethodId`、`payMethodName`、`orderAmount`、`orderStatus`、`deliveryStatus`、`cardId`、`accountValue`、`passwordValue`、`paymentExpireAt`、`paidAt`、`deliveredAt`、`aftersale`、`timeline`、`createdAt`、`updatedAt`

#### 4.3 新增订单

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/orders`
- 请求参数：`userId`、`productId`、`buyerName`、`contactValue`、`remarks`、`payMethodId`、`orderAmount`、`orderStatus`、`deliveryStatus`、`aftersale`
- 响应字段：`id`、`orderNo`

#### 4.4 编辑订单

- 请求方式：`PUT`
- 请求路径：`/admin-api/v1/orders/{id}`
- 请求参数：`id`、`buyerName`、`contactValue`、`remarks`、`payMethodId`、`orderAmount`、`orderStatus`、`deliveryStatus`、`aftersale`
- 响应字段：`success`

#### 4.5 删除订单

- 请求方式：`DELETE`
- 请求路径：`/admin-api/v1/orders/{id}`
- 请求参数：`id`
- 响应字段：`success`

#### 4.6 修改订单状态

- 请求方式：`PATCH`
- 请求路径：`/admin-api/v1/orders/{id}/status`
- 请求参数：`id`、`orderStatus`、`deliveryStatus`
- 响应字段：`success`

#### 4.7 确认支付

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/orders/{id}/confirm-payment`
- 请求参数：`id`、`payMethodId`
- 响应字段：`success`、`paidAt`

#### 4.8 重新发货

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/orders/{id}/redeliver`
- 请求参数：`id`
- 响应字段：`success`、`cardId`、`accountValue`、`passwordValue`、`deliveredAt`

### 5. 用户管理

#### 5.1 用户列表

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/users`
- 请求参数：`username`、`nickname`、`status`、`startCreatedAt`、`endCreatedAt`、`startLastLoginAt`、`endLastLoginAt`、`page`、`pageSize`
- 响应字段：`id`、`username`、`nickname`、`status`、`lastLoginAt`、`createdAt`、`orderCount`、`totalAmount`

#### 5.2 用户详情

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/users/{id}`
- 请求参数：`id`
- 响应字段：`id`、`username`、`nickname`、`status`、`lastLoginAt`、`remark`、`createdAt`、`updatedAt`、`orderCount`、`totalAmount`、`latestOrderAt`

#### 5.3 新增用户

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/users`
- 请求参数：`username`、`password`、`nickname`、`status`、`remark`
- 响应字段：`id`

#### 5.4 编辑用户

- 请求方式：`PUT`
- 请求路径：`/admin-api/v1/users/{id}`
- 请求参数：`id`、`nickname`、`status`、`remark`
- 响应字段：`success`

#### 5.5 删除用户

- 请求方式：`DELETE`
- 请求路径：`/admin-api/v1/users/{id}`
- 请求参数：`id`
- 响应字段：`success`

#### 5.6 修改用户状态

- 请求方式：`PATCH`
- 请求路径：`/admin-api/v1/users/{id}/status`
- 请求参数：`id`、`status`
- 响应字段：`success`

#### 5.7 重置用户密码

- 请求方式：`PATCH`
- 请求路径：`/admin-api/v1/users/{id}/password`
- 请求参数：`id`、`password`
- 响应字段：`success`

### 6. 网站公告管理

#### 6.1 公告列表

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/notices`
- 请求参数：`title`、`status`、`autoPopup`、`startPublishedAt`、`endPublishedAt`、`page`、`pageSize`
- 响应字段：`id`、`title`、`content`、`timeLabel`、`status`、`autoPopup`、`sortOrder`、`publishedAt`、`updatedAt`

#### 6.2 公告详情

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/notices/{id}`
- 请求参数：`id`
- 响应字段：`id`、`title`、`content`、`timeLabel`、`status`、`autoPopup`、`sortOrder`、`publishedAt`、`createdAt`、`updatedAt`

#### 6.3 新增公告

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/notices`
- 请求参数：`title`、`content`、`timeLabel`、`status`、`autoPopup`、`sortOrder`、`publishedAt`
- 响应字段：`id`

#### 6.4 编辑公告

- 请求方式：`PUT`
- 请求路径：`/admin-api/v1/notices/{id}`
- 请求参数：`id`、`title`、`content`、`timeLabel`、`status`、`autoPopup`、`sortOrder`、`publishedAt`
- 响应字段：`success`

#### 6.5 删除公告

- 请求方式：`DELETE`
- 请求路径：`/admin-api/v1/notices/{id}`
- 请求参数：`id`
- 响应字段：`success`

#### 6.6 修改公告状态

- 请求方式：`PATCH`
- 请求路径：`/admin-api/v1/notices/{id}/status`
- 请求参数：`id`、`status`、`autoPopup`
- 响应字段：`success`

### 7. 支付方式管理

#### 7.1 支付方式列表

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/payment-methods`
- 请求参数：`methodName`、`methodCode`、`status`、`page`、`pageSize`
- 响应字段：`id`、`methodName`、`methodCode`、`qrPrefix`、`status`、`sortOrder`、`createdAt`

#### 7.2 支付方式详情

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/payment-methods/{id}`
- 请求参数：`id`
- 响应字段：`id`、`methodName`、`methodCode`、`qrPrefix`、`status`、`sortOrder`、`createdAt`、`updatedAt`

#### 7.3 新增支付方式

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/payment-methods`
- 请求参数：`methodName`、`methodCode`、`qrPrefix`、`status`、`sortOrder`
- 响应字段：`id`

#### 7.4 编辑支付方式

- 请求方式：`PUT`
- 请求路径：`/admin-api/v1/payment-methods/{id}`
- 请求参数：`id`、`methodName`、`methodCode`、`qrPrefix`、`status`、`sortOrder`
- 响应字段：`success`

#### 7.5 删除支付方式

- 请求方式：`DELETE`
- 请求路径：`/admin-api/v1/payment-methods/{id}`
- 请求参数：`id`
- 响应字段：`success`

#### 7.6 修改支付方式状态

- 请求方式：`PATCH`
- 请求路径：`/admin-api/v1/payment-methods/{id}/status`
- 请求参数：`id`、`status`
- 响应字段：`success`

### 8. 支付记录管理

#### 8.1 支付记录列表

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/payment-records`
- 请求参数：`paymentNo`、`orderNo`、`payMethodId`、`payStatus`、`startCreatedAt`、`endCreatedAt`、`startPaidAt`、`endPaidAt`、`page`、`pageSize`
- 响应字段：`id`、`paymentNo`、`orderId`、`orderNo`、`payMethodId`、`payMethodName`、`payAmount`、`payStatus`、`qrCodeUrl`、`expireAt`、`paidAt`、`createdAt`

#### 8.2 支付记录详情

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/payment-records/{id}`
- 请求参数：`id`
- 响应字段：`id`、`paymentNo`、`orderId`、`orderNo`、`payMethodId`、`payMethodName`、`payAmount`、`payStatus`、`qrCodeUrl`、`expireAt`、`paidAt`、`createdAt`、`updatedAt`

#### 8.3 新增支付记录

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/payment-records`
- 请求参数：`orderId`、`payMethodId`、`paymentNo`、`payAmount`、`qrCodeUrl`、`payStatus`、`expireAt`
- 响应字段：`id`

#### 8.4 编辑支付记录

- 请求方式：`PUT`
- 请求路径：`/admin-api/v1/payment-records/{id}`
- 请求参数：`id`、`payMethodId`、`payAmount`、`qrCodeUrl`、`payStatus`、`expireAt`
- 响应字段：`success`

#### 8.5 删除支付记录

- 请求方式：`DELETE`
- 请求路径：`/admin-api/v1/payment-records/{id}`
- 请求参数：`id`
- 响应字段：`success`

#### 8.6 修改支付记录状态

- 请求方式：`PATCH`
- 请求路径：`/admin-api/v1/payment-records/{id}/status`
- 请求参数：`id`、`payStatus`
- 响应字段：`success`

### 9. 账号分类管理

#### 9.1 账号分类列表

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/platforms`
- 请求参数：`name`、`status`、`page`、`pageSize`
- 响应字段：`id`、`name`、`code`、`status`、`sortOrder`、`createdAt`

#### 9.2 账号分类详情

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/platforms/{id}`
- 请求参数：`id`
- 响应字段：`id`、`name`、`code`、`status`、`sortOrder`、`createdAt`、`updatedAt`

#### 9.3 新增账号分类

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/platforms`
- 请求参数：`name`、`code`、`status`、`sortOrder`
- 响应字段：`id`

#### 9.4 编辑账号分类

- 请求方式：`PUT`
- 请求路径：`/admin-api/v1/platforms/{id}`
- 请求参数：`id`、`name`、`code`、`status`、`sortOrder`
- 响应字段：`success`

#### 9.5 删除账号分类

- 请求方式：`DELETE`
- 请求路径：`/admin-api/v1/platforms/{id}`
- 请求参数：`id`
- 响应字段：`success`

#### 9.6 修改账号分类状态

- 请求方式：`PATCH`
- 请求路径：`/admin-api/v1/platforms/{id}/status`
- 请求参数：`id`、`status`
- 响应字段：`success`

### 10. 受众偏好管理

#### 10.1 受众偏好列表

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/audience-categories`
- 请求参数：`name`、`status`、`page`、`pageSize`
- 响应字段：`id`、`name`、`code`、`status`、`sortOrder`、`createdAt`

#### 10.2 受众偏好详情

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/audience-categories/{id}`
- 请求参数：`id`
- 响应字段：`id`、`name`、`code`、`status`、`sortOrder`、`createdAt`、`updatedAt`

#### 10.3 新增受众偏好

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/audience-categories`
- 请求参数：`name`、`code`、`status`、`sortOrder`
- 响应字段：`id`

#### 10.4 编辑受众偏好

- 请求方式：`PUT`
- 请求路径：`/admin-api/v1/audience-categories/{id}`
- 请求参数：`id`、`name`、`code`、`status`、`sortOrder`
- 响应字段：`success`

#### 10.5 删除受众偏好

- 请求方式：`DELETE`
- 请求路径：`/admin-api/v1/audience-categories/{id}`
- 请求参数：`id`
- 响应字段：`success`

#### 10.6 修改受众偏好状态

- 请求方式：`PATCH`
- 请求路径：`/admin-api/v1/audience-categories/{id}/status`
- 请求参数：`id`、`status`
- 响应字段：`success`

### 11. 站点配置管理

#### 11.1 配置列表

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/site-configs`
- 请求参数：`configKey`、`status`、`page`、`pageSize`
- 响应字段：`id`、`configKey`、`configName`、`configValue`、`status`、`updatedAt`

#### 11.2 配置详情

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/site-configs/{id}`
- 请求参数：`id`
- 响应字段：`id`、`configKey`、`configName`、`configValue`、`status`、`remark`、`createdAt`、`updatedAt`

#### 11.3 新增配置

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/site-configs`
- 请求参数：`configKey`、`configName`、`configValue`、`status`、`remark`
- 响应字段：`id`

#### 11.4 编辑配置

- 请求方式：`PUT`
- 请求路径：`/admin-api/v1/site-configs/{id}`
- 请求参数：`id`、`configKey`、`configName`、`configValue`、`status`、`remark`
- 响应字段：`success`

#### 11.5 删除配置

- 请求方式：`DELETE`
- 请求路径：`/admin-api/v1/site-configs/{id}`
- 请求参数：`id`
- 响应字段：`success`

#### 11.6 修改配置状态

- 请求方式：`PATCH`
- 请求路径：`/admin-api/v1/site-configs/{id}/status`
- 请求参数：`id`、`status`
- 响应字段：`success`

### 12. 后台管理员管理

#### 12.1 管理员列表

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/admin-users`
- 请求参数：`username`、`nickname`、`status`、`startCreatedAt`、`endCreatedAt`、`page`、`pageSize`
- 响应字段：`id`、`username`、`nickname`、`status`、`lastLoginAt`、`createdAt`

#### 12.2 管理员详情

- 请求方式：`GET`
- 请求路径：`/admin-api/v1/admin-users/{id}`
- 请求参数：`id`
- 响应字段：`id`、`username`、`nickname`、`status`、`lastLoginAt`、`remark`、`createdAt`、`updatedAt`

#### 12.3 新增管理员

- 请求方式：`POST`
- 请求路径：`/admin-api/v1/admin-users`
- 请求参数：`username`、`password`、`nickname`、`status`、`remark`
- 响应字段：`id`

#### 12.4 编辑管理员

- 请求方式：`PUT`
- 请求路径：`/admin-api/v1/admin-users/{id}`
- 请求参数：`id`、`nickname`、`status`、`remark`
- 响应字段：`success`

#### 12.5 删除管理员

- 请求方式：`DELETE`
- 请求路径：`/admin-api/v1/admin-users/{id}`
- 请求参数：`id`
- 响应字段：`success`

#### 12.6 修改管理员状态

- 请求方式：`PATCH`
- 请求路径：`/admin-api/v1/admin-users/{id}/status`
- 请求参数：`id`、`status`
- 响应字段：`success`

#### 12.7 重置管理员密码

- 请求方式：`PATCH`
- 请求路径：`/admin-api/v1/admin-users/{id}/password`
- 请求参数：`id`、`password`
- 响应字段：`success`
