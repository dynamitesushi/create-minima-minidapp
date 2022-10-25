import minimaLogo from './minima_logo.png';
import './App.css';
import Balance from './Balance';

function App() {
  return (
    <div className="App">
      <section className="container">
        <h1>Minima MiniDApp</h1>
        <img src={minimaLogo} className="logo" alt="logo" />
        <p>
          Edit <code>src/App.jsx</code>.
        </p>
        <Balance />
      </section>
    </div>
  );
}

export default App;
