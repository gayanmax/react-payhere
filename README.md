# PayHere React Integration Project

This project demonstrates how to integrate the [PayHere](https://www.payhere.lk) payment gateway using a React frontend (Vite) and a Node.js backend (Express).

---

## 📁 Project Structure
payhere-app/ # Frontend - Vite + React

payhere-backend/ # Backend - Express + Node.js

💳 PayHere Integration (Frontend)

```bash
npm create vite@latest
# Choose a project name (e.g., payhere-app)
# Choose React and JavaScript

cd payhere-app
npm install crypto-js
npm run dev


## Create new file in src/PayHereChechkout.jsx

import './App.css'
import PayHereCheckout from './PayHereCheckout.jsx';

function App() {

  return (
    <>
      <div>
        <a href="https://www.payhere.lk" target="_blank">
          <img  src="https://www.payhere.lk/downloads/images/payhere_square_banner_dark.png" className="logo" alt="Vite logo"  style={{ width: '250px' }} />
        </a>

        <div className="App">
            <h1>React + PayHere Integration</h1>
            <PayHereCheckout />
        </div>
      </div>
    </>
  )
}

export default App
 




