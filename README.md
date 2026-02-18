# EC-Space - Weapon Store

ระบบ E-Commerce สำหรับขายอาวุธ มี Frontend (React + Vite), Backend (Go + Gin), และ Database (PostgreSQL)

---

## สิ่งที่ต้องติดตั้งก่อน

| เครื่องมือ | ลิงก์ดาวน์โหลด |
|---|---|
| [Docker Desktop](https://www.docker.com/products/docker-desktop/) | สำหรับรัน Database |
| [Go 1.25+](https://go.dev/dl/) | สำหรับรัน Backend |
| [Node.js 18+](https://nodejs.org/) | สำหรับรัน Frontend |
| [Git](https://git-scm.com/) | สำหรับ Clone โปรเจกต์ |

---

## วิธี Clone โปรเจกต์

```bash
git clone https://github.com/YOUR_USERNAME/ec-space.git
cd ec-space
```

---

## ขั้นตอนที่ 1 — รัน Database ด้วย Docker

### เปิด Docker Desktop ก่อน แล้วรันคำสั่ง:

```bash
docker compose up -d
```

คำสั่งนี้จะดาวน์โหลด PostgreSQL และรันขึ้นมาใน background

### ตรวจสอบว่า Container รันอยู่:

```bash
docker ps
```

ควรเห็น container ชื่อ `space_weapon_db` กับ status `Up`

### ข้อมูล Database

| รายการ | ค่า |
|---|---|
| Host | localhost |
| Port | 5432 |
| Database | weapon_store |
| Username | galaxy_admin |
| Password | super_secret_password |

### หยุด / ลบ Database

```bash
# หยุดชั่วคราว (ข้อมูลยังอยู่)
docker compose stop

# รันต่อ
docker compose start

# ลบทิ้งทั้งหมด (ข้อมูลหาย)
docker compose down -v
```

---

## ขั้นตอนที่ 2 — รัน Backend (Go)

```bash
# อยู่ที่ root folder ของโปรเจกต์
go mod tidy
go run main.go
```

Backend จะรันที่ `http://localhost:8080`

> หมายเหตุ: Backend จะทำการ Auto-migrate สร้าง Table ใน Database ให้อัตโนมัติตอน Start

---

## ขั้นตอนที่ 3 — รัน Frontend (React)

```bash
cd ec-space-frontend
npm install
npm run dev
```

Frontend จะรันที่ `http://localhost:5173`

---

## รันทั้งหมดพร้อมกัน (สรุปสั้น)

เปิด Terminal 3 ช่อง:

**Terminal 1 — Database:**
```bash
docker compose up -d
```

**Terminal 2 — Backend:**
```bash
go mod tidy
go run main.go
```

**Terminal 3 — Frontend:**
```bash
cd ec-space-frontend
npm install
npm run dev
```

แล้วเปิด browser ที่ `http://localhost:5173`

---

## โครงสร้างโปรเจกต์

```
ec-space/
├── config/              # Database connection
├── handlers/            # API request handlers
├── middleware/          # JWT auth & admin check
├── models/              # Database models (User, Weapon, Order, Cart)
├── routes/              # Route definitions
├── utils/               # Helper functions
├── ec-space-frontend/   # React frontend
│   ├── src/
│   │   ├── components/  # Shared components
│   │   ├── contexts/    # React contexts (Cart state)
│   │   ├── pages/       # Page components
│   │   └── services/    # API calls
│   └── package.json
├── docker-compose.yml   # PostgreSQL Docker config
├── main.go              # Backend entry point
└── go.mod
```

---

## Tech Stack

| ส่วน | เทคโนโลยี |
|---|---|
| Frontend | React 19, Vite, Tailwind CSS, Axios |
| Backend | Go, Gin Framework, GORM |
| Database | PostgreSQL 15 |
| Authentication | JWT |
| Container | Docker |

---

## API Endpoints หลัก

| Method | Path | รายละเอียด | Auth |
|---|---|---|---|
| POST | /api/register | สมัครสมาชิก | - |
| POST | /api/login | เข้าสู่ระบบ | - |
| GET | /api/weapons | ดูรายการอาวุธ | - |
| GET | /api/profile | ดูโปรไฟล์ | JWT |
| POST | /api/topup | เติมเครดิต | JWT |
| GET | /api/cart | ดูตะกร้า | JWT |
| POST | /api/cart | เพิ่มสินค้าในตะกร้า | JWT |
| DELETE | /api/cart/:weapon_id | ลบสินค้าออกจากตะกร้า | JWT |
| POST | /api/orders | สั่งซื้อ | JWT |
| GET | /api/orders | ประวัติการสั่งซื้อ | JWT |
| POST | /api/admin/weapons | เพิ่มอาวุธ (Admin) | JWT + Admin |
| PATCH | /api/admin/weapons/:id | แก้ไขอาวุธ (Admin) | JWT + Admin |
| DELETE | /api/admin/weapons/:id | ลบอาวุธ (Admin) | JWT + Admin |

---

## แก้ปัญหาเบื้องต้น

**Docker ไม่ยอมรัน:**
- ตรวจสอบว่าเปิด Docker Desktop อยู่
- รัน `docker compose down` แล้ว `docker compose up -d` ใหม่

**Backend ต่อ Database ไม่ได้:**
- ตรวจสอบว่า Docker container รันอยู่ด้วย `docker ps`
- รอสัก 5-10 วินาทีหลัง `docker compose up -d` แล้วค่อยรัน Backend

**Frontend เรียก API ไม่ได้:**
- ตรวจสอบว่า Backend รันอยู่ที่ port 8080
- ตรวจสอบ CORS — Frontend ต้องรันที่ port 5173 เท่านั้น
