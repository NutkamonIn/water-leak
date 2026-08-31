# 💧 Water Leak Monitoring System — Demo MVP

ระบบ Demo สำหรับตรวจสอบสถานะน้ำรั่วของบ้านพักอาศัย โดยจำลองข้อมูลจาก Sensor

> **Demo MVP:** ยังไม่เชื่อมต่อ Sensor จริง ใช้ Mock Data เพื่อจำลองสถานะและเหตุการณ์น้ำรั่ว

---

# 🎯 MVP Goal

แสดงให้เห็นว่า

1. วิศวกรสามารถดูภาพรวมบ้านทั้งหมดได้
2. บ้าน 1 หลังมี Sensor ทั้งหมด 9 ตัว
3. Main Sensor 1 ตัวทำหน้าที่เป็นตัวกลาง
4. Detection Sensor 8 ตัวใช้ตรวจจับน้ำรั่ว
5. ระบบสามารถแสดงสถานะ Normal / Warning / Leak / Offline
6. วิศวกรสามารถเข้าไปดูรายละเอียด Sensor ของแต่ละบ้าน
7. ลูกบ้านสามารถดูสถานะบ้านของตัวเอง
8. เมื่อเกิดน้ำรั่ว ระบบสามารถแสดง Alert ได้

---

# 🏠 Sensor Structure

บ้าน 1 หลังมี Sensor ทั้งหมด **9 ตัว**

```text
House A001
│
├── Main Sensor
│   └── Gateway / Controller
│
└── Detection Sensors
    ├── Sensor 01
    ├── Sensor 02
    ├── Sensor 03
    ├── Sensor 04
    ├── Sensor 05
    ├── Sensor 06
    ├── Sensor 07
    └── Sensor 08
```

### จำนวน

```text
1 House
├── Main Sensor × 1
└── Detection Sensor × 8

Total = 9 Sensors / House
```

---

# 👥 User Roles

MVP มี 2 Role

## Engineer

ผู้ดูแลระบบ / วิศวกร

สามารถ:

- ดูบ้านทั้งหมด
- ดูสถานะบ้าน
- ดู Sensor ทั้ง 9 ตัว
- ดู Alert
- ดูรายละเอียด Sensor

---

## Resident

ลูกบ้าน

สามารถ:

- ดูบ้านของตัวเอง
- ดูสถานะ Sensor
- ดู Alert ของบ้านตัวเอง

ไม่สามารถ:

- ดูบ้านอื่น
- จัดการ Sensor
- ดู Dashboard รวม

---

# 🖥️ MVP Screens

ระบบ Demo มีประมาณ **6 หน้าหลัก**

```text
Login
 │
 ├── Engineer
 │     │
 │     ├── Dashboard
 │     ├── House Detail
 │     └── Sensor Detail
 │
 └── Resident
       │
       ├── My House
       └── Alert Detail
```

---

# 1. 🔐 Login

หน้า Login สำหรับ Demo

```text
┌─────────────────────────────────┐
│                                 │
│       💧 Water Leak System      │
│                                 │
│      Email                      │
│      [____________________]     │
│                                 │
│      Password                   │
│      [____________________]     │
│                                 │
│          [ Login ]              │
│                                 │
└─────────────────────────────────┘
```

สำหรับ Demo สามารถมี Account จำลอง:

```text
Engineer
email: engineer@demo.com

Resident
email: resident@demo.com
```

ไม่จำเป็นต้องทำระบบ Register ใน MVP

---

# 2. 👨‍🔧 Engineer Dashboard

หน้าแรกหลัง Login ของวิศวกร

## Overview

```text
┌─────────────────────────────────────────────────┐
│ Water Leak Monitoring            👨‍🔧 Engineer  │
├─────────────────────────────────────────────────┤
│                                                 │
│  🏠 Houses    🟢 Normal   🔴 Leak   ⚫ Offline │
│      20           16          3          1      │
│                                                 │
├─────────────────────────────────────────────────┤
│ 🚨 Active Alerts                                │
│                                                 │
│ A002   🔴 Leak Detected    Sensor 03            │
│ A007   🔴 Leak Detected    Sensor 06            │
│ A014   ⚫ Offline          Main Sensor           │
│                                                 │
├─────────────────────────────────────────────────┤
│ 🏠 House Overview                               │
│                                                 │
│ A001   🟢 Normal       9/9 Online               │
│ A002   🔴 Leak         9/9 Online               │
│ A003   🟢 Normal       9/9 Online               │
│ A004   ⚫ Offline       0/9 Online               │
│                                                 │
└─────────────────────────────────────────────────┘
```

### Features

- [ ] จำนวนบ้านทั้งหมด
- [ ] จำนวนบ้านปกติ
- [ ] จำนวนบ้านที่พบ Leak
- [ ] จำนวนบ้าน Offline
- [ ] Active Alerts
- [ ] House List
- [ ] Search
- [ ] Filter Status

---

# 3. 🏠 House Detail

เมื่อวิศวกรเลือกบ้าน

ตัวอย่าง:

```text
House A002
```

แสดงข้อมูล

```text
┌───────────────────────────────────────────┐
│ ← Back                                    │
│                                           │
│ 🏠 House A002                             │
│ Status: 🔴 LEAK DETECTED                  │
│                                           │
│ Main Sensor                               │
│ ┌───────────────────────────────────────┐ │
│ │ MAIN-A002                             │ │
│ │ 🟢 Online                             │ │
│ │ Last Seen: 10:28:31                   │ │
│ └───────────────────────────────────────┘ │
│                                           │
│ Detection Sensors                         │
│                                           │
│ S01 🟢 Normal     ห้องน้ำ                 │
│ S02 🟢 Normal     ห้องครัว                │
│ S03 🔴 LEAK       ห้องน้ำ                 │
│ S04 🟢 Normal     ห้องนอน                 │
│ S05 🟢 Normal     ห้องซักล้าง              │
│ S06 🟢 Normal     หลังบ้าน                 │
│ S07 🟢 Normal     ห้องครัว                │
│ S08 🟢 Normal     จุดน้ำหลัก              │
│                                           │
└───────────────────────────────────────────┘
```

### Features

- [ ] Main Sensor Status
- [ ] Detection Sensor 8 ตัว
- [ ] Sensor Status
- [ ] Location
- [ ] Current Value
- [ ] Last Update
- [ ] กด Sensor เพื่อดูรายละเอียด

---

# 4. 📡 Sensor Detail

แสดงข้อมูลของ Sensor ที่เลือก

```text
Sensor S03
────────────────────────

Location
ห้องน้ำ

Status
🔴 LEAK DETECTED

Current Value
87

Threshold
50

Last Update
10:28:31
```

### Mock Graph

สามารถใช้ข้อมูลจำลองเพื่อแสดง Graph

```text
Water Level

100 |               ╭──╮
 80 |             ╭─╯  ╰
 60 |──────╮──────╯
 40 |      ╰────────────
 20 |
    └────────────────────
       10:00  10:15  10:30
```

ไม่จำเป็นต้องมี Historical Data จริง

ใช้ Mock Data เช่น:

```text
10:00 → 20
10:05 → 23
10:10 → 25
10:15 → 32
10:20 → 45
10:25 → 67
10:30 → 87
```

---

# 5. 🏠 Resident Dashboard

ลูกบ้านเห็นเฉพาะบ้านตัวเอง

```text
┌──────────────────────────────────────┐
│ 💧 My House                          │
├──────────────────────────────────────┤
│                                      │
│ 🏠 บ้าน A002                         │
│                                      │
│ 🔴 ตรวจพบน้ำรั่ว                     │
│                                      │
│ จุดที่พบ: ห้องน้ำ                    │
│ Sensor: S03                          │
│ เวลา: 10:28                          │
│                                      │
├──────────────────────────────────────┤
│ Sensors                              │
│                                      │
│ Main Sensor     🟢 Online             │
│ S01             🟢 Normal             │
│ S02             🟢 Normal             │
│ S03             🔴 Leak               │
│ S04             🟢 Normal             │
│ S05             🟢 Normal             │
│ S06             🟢 Normal             │
│ S07             🟢 Normal             │
│ S08             🟢 Normal             │
│                                      │
└──────────────────────────────────────┘
```

---

# 6. 🚨 Alert Detail

เมื่อมีน้ำรั่ว

```text
┌──────────────────────────────────────┐
│ 🚨 Water Leak Alert                  │
├──────────────────────────────────────┤
│                                      │
│ 🔴 LEAK DETECTED                     │
│                                      │
│ House                                 │
│ A002                                 │
│                                      │
│ Sensor                                │
│ S03                                  │
│                                      │
│ Location                              │
│ ห้องน้ำ                               │
│                                      │
│ Value                                 │
│ 87                                   │
│                                      │
│ Threshold                             │
│ 50                                   │
│                                      │
│ Detected At                           │
│ 31 Aug 2026 10:28:31                 │
│                                      │
└──────────────────────────────────────┘
```

---

# 🧪 Mock Data

เนื่องจาก MVP ยังไม่มี Hardware จริง ให้ใช้ Mock Data

## House

```json
{
  "id": "HOUSE-002",
  "houseNumber": "A002",
  "status": "leak"
}
```

## Main Sensor

```json
{
  "id": "MAIN-A002",
  "status": "online",
  "lastSeen": "2026-08-31T10:28:31"
}
```

## Detection Sensor

```json
{
  "id": "S03",
  "location": "ห้องน้ำ",
  "status": "leak",
  "value": 87,
  "threshold": 50,
  "battery": 82,
  "lastSeen": "2026-08-31T10:28:31"
}
```

---

# 🚦 Sensor Status

MVP ใช้ 4 สถานะ

| Status | ความหมาย |
|---|---|
| 🟢 Normal | Sensor ทำงานปกติ |
| 🟡 Warning | ค่าเริ่มผิดปกติ |
| 🔴 Leak | ตรวจพบน้ำรั่ว |
| ⚫ Offline | Sensor ไม่สามารถติดต่อได้ |

---

# 🧠 Business Logic

## House Status

สถานะของบ้านคำนวณจาก Sensor

```text
IF Main Sensor Offline
    → House = Offline

ELSE IF Any Detection Sensor = Leak
    → House = Leak

ELSE IF Any Sensor = Warning
    → House = Warning

ELSE
    → House = Normal
```

---

# 📊 Mock Scenario

เพื่อให้ Demo ดูสมจริง ควรเตรียมข้อมูลประมาณ 10–20 บ้าน

ตัวอย่าง:

```text
A001 → 🟢 Normal
A002 → 🔴 Leak
A003 → 🟢 Normal
A004 → 🟡 Warning
A005 → 🟢 Normal
A006 → 🟢 Normal
A007 → 🔴 Leak
A008 → ⚫ Offline
A009 → 🟢 Normal
A010 → 🟢 Normal
```

### บ้านที่มี Leak

```text
A002
└── S03 → 🔴 Leak

A007
└── S06 → 🔴 Leak
```

### บ้านที่ Offline

```text
A008
└── Main Sensor → ⚫ Offline
```

---

# 🗄️ MVP Database

ไม่จำเป็นต้องทำ Database ซับซ้อนมาก

```text
User
House
Sensor
Alert
```

## Relationship

```text
User
 │
 ▼
House
 │
 ├── Main Sensor × 1
 │
 └── Detection Sensor × 8
            │
            ▼
          Alert
```

---

# 🔌 API ที่จำเป็น

MVP สามารถมี API เพียงไม่กี่ตัว

### Authentication

```http
POST /api/auth/login
```

### Houses

```http
GET /api/houses
GET /api/houses/:id
```

### Sensors

```http
GET /api/houses/:id/sensors
GET /api/sensors/:id
```

### Alerts

```http
GET /api/alerts
GET /api/houses/:id/alerts
```

ยังไม่จำเป็นต้องทำ MQTT API ใน MVP

---

# 🧱 MVP Architecture

```text
                 ┌──────────────┐
                 │   Frontend   │
                 │   Next.js    │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │   Backend    │
                 │   REST API   │
                 └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │  PostgreSQL  │
                 └──────────────┘
                        ▲
                        │
                   Mock Data
```

---

# 🚫 สิ่งที่ยังไม่ทำใน MVP

เพื่อควบคุม Scope ให้ชัดเจน **ยังไม่ต้องทำ**

- ❌ Sensor Hardware จริง
- ❌ MQTT
- ❌ Real-time Communication
- ❌ LINE Notification
- ❌ Email Notification
- ❌ Mobile Application
- ❌ Advanced Analytics
- ❌ Maintenance System
- ❌ Firmware Management
- ❌ Sensor Configuration จริง
- ❌ Automatic Sensor Provisioning

สิ่งเหล่านี้สามารถอยู่ใน Phase ถัดไปหลัง Demo MVP

---

# 🏁 MVP Demo Flow

Demo ควรนำเสนอประมาณนี้:

```text
1. Login
      ↓
2. Engineer Dashboard
      ↓
3. แสดงบ้านทั้งหมด
      ↓
4. พบว่า A002 มี Leak
      ↓
5. กดเข้า A002
      ↓
6. แสดง Main Sensor + Sensor 8 ตัว
      ↓
7. พบ S03 เป็น Leak
      ↓
8. กด S03
      ↓
9. แสดง Sensor Detail + Graph
      ↓
10. Logout
      ↓
11. Login เป็น Resident
      ↓
12. แสดงเฉพาะบ้าน A002
      ↓
13. แสดง Alert น้ำรั่ว
```

---

# 📌 MVP Success Criteria

Demo ถือว่าสำเร็จเมื่อสามารถแสดง Flow ต่อไปนี้ได้:

```text
Engineer
   │
   ▼
เห็นบ้านทั้งหมด
   │
   ▼
เลือกบ้าน
   │
   ▼
เห็น Sensor 9 ตัว
   │
   ▼
พบ Sensor ที่ผิดปกติ
   │
   ▼
เห็นรายละเอียด Leak
   │
   ▼
เกิด Alert
```

และ

```text
Resident
   │
   ▼
Login
   │
   ▼
เห็นเฉพาะบ้านตัวเอง
   │
   ▼
เห็น Sensor 9 ตัว
   │
   ▼
เห็น Alert น้ำรั่ว
```

---

# 📈 Future Development

หลังจาก Demo MVP ผ่านแล้ว จึงค่อยเพิ่ม:

```text
MVP
 │
 ├── MQTT
 │
 ├── Real Sensor
 │
 ├── Real-time Data
 │
 ├── Notification
 │
 ├── Maintenance
 │
 ├── Analytics
 │
 └── Production Deployment
```

> **MVP Principle:** ทำให้คนดูสามารถเข้าใจระบบและเห็น End-to-End Flow ได้ก่อน โดยใช้ Mock Data แทน Sensor จริง เมื่อ Hardware พร้อมจึงค่อยเปลี่ยน Data Source โดยไม่ต้องออกแบบระบบใหม่ทั้งหมด