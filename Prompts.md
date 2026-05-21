# AI Transparency & Debugging Ledger (Prompts.md)
**Project Code Name:** Live Ops Helpdesk (RapidDispatch Freight & Logistics)  
**Engineer:** Shivansh Vishwakarma (Full Stack Developer Intern)  
**Date:** May 20, 2026  

---

## 🔍 Log 1: Resolving React Strict Mode Double-Connection Loop

### 🛑 The Problem
Mera socket connection development me initial load par do-do baar trigger ho raha tha, jiski wajah se backend par duplicate socket IDs create ho rahi thi. Isse single browser tab par do connections ban rahe the aur ghost disconnect algorithm cross-check sahi se nahi kar pa raha tha.

### 💬 The AI Debugging Strategy Used
* **Prompt Dispatched:** "Hey, I'm building a real-time board using React and socket.io-client, but I'm facing a weird issue. In development mode, my socket connection is firing twice whenever the dashboard loads. I figured out it's because of React Strict Mode re-mounting components. How can I structure my useEffect setup to properly clean up and disconnect the old socket so I don't end up with duplicate connections on the backend?"

* **Resolution Applied:** Maine application module me dynamic lifecycle cleanup apply kiya. `useEffect` ke return function me saare active socket listeners ko `socket.off()` kiya aur connection string ko properly close (`socket.disconnect()`) kiya, jisse re-render hone par duplicate connections leak hona band ho gaye.

---

## 💾 Log 2: In-Memory Map Structure for High-Speed Synchronization

### 🛑 The Problem
Client ki demand thi ki data fast real-time sync hona chahiye, isliye database ka up-and-down query cycle bohot slow tha. Agar do dispatch agents ek sath ek ticket par click karte, toh normal database lock speed handle nahi kar pata aur race condition ho jati.

### 💬 The AI Debugging Strategy Used
* **Prompt Dispatched:** "The client doesn't want us to hit the database every time an agent opens a ticket because it's too slow for instant locking. I need to handle this in-memory on my Node.js server. How do I use a JavaScript Map() to store which ticket_id is locked by which socket.id and agent_name? Also, if a user directly closes their browser tab without clicking unlock, how can I loop through this Map inside socket.on('disconnect') to automatically clear their locks and notify other users?"

* **Resolution Applied:** Server par database bypass karne ke liye `src/sockets/lockStore.js` ke andar JavaScript ka native `new Map()` memory structure set kiya jo RAM level par chalta hai. Sockets ke `disconnect` listener me `for...of` loop chalakar socket.id se locked tickets ko match kiya aur tab cut hone par memory se data instantly delete karke baki agents ko automatic unlock emit bhej diya.

---

## 🛠️ Verification Metrics
* **REST API:** Initial data loading ke liye Axios ko backend `/api/tickets` se securely link kiya.
* **CORS Policy:** Local mapping ko Port 5173 par adjust kiya aur live production urls ke liye env variables set kiye taaki cross-origin network pipeline strictly pass ho sake.