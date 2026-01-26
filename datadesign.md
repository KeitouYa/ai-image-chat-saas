# 🗃️ AI Image Chat Database Design

## ER图总览

```
┌─────────────────────────────────────────────────────────────┐
│                        AI Image Chat Database              │
│                    (MongoDB with Mongoose)                 │
└─────────────────────┬───────────────────────────────────────┘
                      │
                      ▼
            ┌─────────────────┐
            │     User        │
            │─────────────────│
            │ _id (ObjectId)  │ ◄─── Primary Key (Auto-generated)
            │ userEmail       │ ◄─── Unique, Indexed (from Clerk)
            │ clerkUserId     │ ◄─── Unique, Indexed (Clerk auth)
            │ role            │ ◄─── Enum: 'user'|'admin'|'subscriber'
            │ metadata        │ ◄─── Map<String, Any> (flexible data)
            │ createdAt       │ ◄─── Timestamp (auto)
            │ updatedAt       │ ◄─── Timestamp (auto)
            └─────────────────┘
                      │
                      │ 1:N
                      │ (One user, many credits)
                      ▼
            ┌─────────────────┐          ┌─────────────────┐
            │    Credit       │◄─────────┤    Image        │
            │─────────────────│          │─────────────────│
            │ _id (ObjectId)  │          │ _id (ObjectId)  │
            │ userEmail       │ ◄────────┤ userEmail       │
            │ credits         │          │ userName        │
            │ amount          │          │ name            │
            │ createdAt       │          │ url             │
            │ updatedAt       │          │ publicId        │
            └─────────────────┘          │ width           │
                                         │ height          │
                                         │ createdAt       │
                                         │ updatedAt       │
                                         └─────────────────┘
```

## 📋 详细字段说明

### 👤 User 集合 (用户表)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `_id` | ObjectId | Primary Key | MongoDB自动生成的主键 |
| `userEmail` | String | Required, Unique, Indexed | 用户邮箱 (来自Clerk认证) |
| `clerkUserId` | String | Required, Unique, Indexed | Clerk用户ID |
| `role` | String | Required, Enum | 用户角色: 'user', 'admin', 'subscriber' |
| `metadata` | Map | Optional | 灵活的元数据存储 |
| `createdAt` | Date | Auto | 创建时间戳 |
| `updatedAt` | Date | Auto | 更新时间戳 |

### 💰 Credit 集合 (积分表)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `_id` | ObjectId | Primary Key | MongoDB自动生成的主键 |
| `userEmail` | String | Required, Indexed | 关联用户邮箱 (外键) |
| `credits` | Number | Required | 当前积分余额 |
| `amount` | Number | Required | 积分变动金额 |
| `createdAt` | Date | Auto | 创建时间戳 |
| `updatedAt` | Date | Auto | 更新时间戳 |

### 🖼️ Image 集合 (图像表)

| 字段名 | 类型 | 约束 | 说明 |
|--------|------|------|------|
| `_id` | ObjectId | Primary Key | MongoDB自动生成的主键 |
| `userEmail` | String | Required, Indexed | 关联用户邮箱 (外键) |
| `userName` | String | Optional | 用户显示名称 |
| `name` | String | Optional | 图像描述/提示词 |
| `url` | String | Optional | Cloudinary图像URL |
| `publicId` | String | Optional | Cloudinary公开ID |
| `width` | Number | Optional | 图像宽度 |
| `height` | Number | Optional | 图像高度 |
| `createdAt` | Date | Auto | 创建时间戳 |
| `updatedAt` | Date | Auto | 更新时间戳 |

## 🔗 实体关系详解

### 1:N 关系 (一对多)

#### User → Credit (用户拥有的积分记录)
- **外键**: `Credit.userEmail` → `User.userEmail`
- **业务含义**: 一个用户可以有多个积分变动记录
- **示例**: 用户购买积分、消耗积分等操作都会创建新的Credit记录

#### User → Image (用户生成的图像)
- **外键**: `Image.userEmail` → `User.userEmail`
- **业务含义**: 一个用户可以生成多张AI图像
- **示例**: 用户每次使用图像生成功能都会创建新的Image记录

### 索引策略

```javascript
// 性能优化的数据库索引
{
  "User": {
    "userEmail": 1,      // 用户邮箱查询
    "clerkUserId": 1,    // Clerk认证查询
    "role": 1           // 角色权限查询
  },
  "Credit": {
    "userEmail": 1       // 用户积分查询
  },
  "Image": {
    "userEmail": 1       // 用户图像查询
  }
}
```

## 📊 数据流示例

### 用户注册流程
```javascript
// 1. Clerk认证成功后创建用户
User.create({
  userEmail: "user@example.com",
  clerkUserId: "clerk_123",
  role: "user"
});

// 2. 赠送初始积分
Credit.create({
  userEmail: "user@example.com",
  credits: 10,
  amount: 10
});
```

### 图像生成流程
```javascript
// 1. 扣除积分
Credit.create({
  userEmail: "user@example.com",
  credits: 9,    // 原来10个，扣除1个
  amount: -1     // 负数表示消耗
});

// 2. 保存生成的图像
Image.create({
  userEmail: "user@example.com",
  userName: "John Doe",
  name: "A beautiful sunset",
  url: "https://cloudinary.com/...",
  publicId: "ai-generated/xyz123"
});
```

### 积分购买流程
```javascript
// 用户购买10个积分
Credit.create({
  userEmail: "user@example.com",
  credits: 19,   // 原来9个，加上购买的10个
  amount: 10     // 正数表示增加
});
```

## 🎯 设计特点

### ✅ 优势
1. **灵活的文档结构** - MongoDB的文档模型适合变化的数据需求
2. **性能优化** - 关键字段都有适当的索引
3. **审计追踪** - 所有积分变动都有历史记录
4. **可扩展性** - 易于添加新字段和关系

### 📈 扩展建议
1. **添加图像标签系统** - 为Image集合添加tags数组字段
2. **积分过期机制** - 为Credit添加过期时间字段
3. **用户统计缓存** - 定期计算并缓存用户统计数据

---

**项目**: AI Image Chat SaaS Application
**数据库**: MongoDB with Mongoose
**设计时间**: 2025年1月
**维护者**: AI Image Chat Team
