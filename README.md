# 🏆 Live Bidding Platform

**A production-ready, real-time auction engine built for high concurrency.**

This repository is a submission for the **Levich Solutions Level 1 Challenge**. It demonstrates a fully functional auction platform capable of handling simultaneous bids, managing race conditions, and delivering sub-second updates to clients.

---

## 🚀 Key Highlights

* **Race Condition Proof:** Handles simultaneous bids atomically—only the first valid bid wins.
* **Real-Time Sync:** Users see price updates instantly (via WebSockets) without refreshing.
* **Smart UI:** The interface knows who you are—displaying **"WINNING"** (Green) or **"OUTBID"** (Red) badges dynamically.
* **Timer Security:** Countdowns are synchronized to server time to prevent client-side manipulation.

---

## 🛠️ Tech Stack

* **Frontend:** React 19, Vite, Tailwind CSS, Axios.
* **Backend:** Node.js, Express, Socket.io (WebSocket).
* **Database:** MongoDB (Mongoose) with atomic locking.
* **DevOps:** Docker, Docker Compose, Nginx (Multi-stage builds).
* **Security:** JWT Authentication, Helmet, Rate Limiting.

---

## ⚡ Quick Start (Run with Docker)

The entire application (Frontend, Backend, and Database) is containerized. You can launch it with a single command.

### Prerequisites

* Docker Desktop installed and running.

### Installation

1. **Clone the repository:**
```bash
git clone https://github.com/lazy-taurus/live-bidding-platform.git
cd live-bidding-platform

```


2. **Start the application:**
```bash
docker-compose up --build

```


3. **Access the App:**
* **Frontend:** [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000)
* **Backend API:** [http://localhost:5000](https://www.google.com/search?q=http://localhost:5000)



---

## 🧠 Engineering Decisions & Architecture

### 1. Handling Race Conditions (Concurrency)

**The Problem:** Two users bid $100 on the same item at the exact same millisecond.
**My Solution:** I implemented atomic database updates using MongoDB's `findOneAndUpdate`.

* The database checks `if currentPrice < newBid` AND `if time < endTime` in a single operation.
* The loser instantly receives a real-time **"OUTBID"** event via Socket.io.

### 2. Real-Time Engine (Socket.io vs REST)

Instead of polling the server every second (which is slow and resource-heavy), I used **Socket.io**.

* **Push Model:** The server pushes data only when a bid happens.
* **Broadcasts:** When User A bids, User B's screen flashes green instantly.

### 3. Auction Expiry Strategy (Double Validation)

* **Frontend:** A countdown timer disables buttons visually when time hits 0.
* **Backend:** A background Cron job runs every 60 seconds to sweep and officially "Close" expired auctions in the database, ensuring API security.

### 4. Smart Sorting

The dashboard doesn't just list items; it organizes them intelligently:

1. **Active Items:** Sorted by "Ending Soonest" (Top priority).
2. **Closed Items:** Pushed to the bottom.

---

## 🛡️ Security Features

* **Environment Variables:** Sensitive keys (Mongo URI, JWT Secrets) are managed via `.env` files and never exposed in the Docker image.
* **JWT Auth:** Stateless authentication that persists across reloads.
* **Input Validation:** All API inputs are sanitized to prevent injection attacks.

---

## 🎁 Bonus Features

* **Admin Panel:** I included a hidden route (`/admin`) to easily create items and generate random test images using keywords (via LoremFlickr).
* **Docker Optimization:** Used Multi-Stage Docker builds to reduce the frontend image size from ~500MB to <50MB using Nginx.

---

## 🧪 Testing

To run the backend test suite:

```bash
cd backend
npm install
npm test

```

*Tests cover: Bid validation, race conditions, and auction expiry logic.*

---

**Submitted by:** Vardan Rastogi
**Date:** 2nd February 2026
