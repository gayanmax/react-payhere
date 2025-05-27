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
