import logo from './logo.svg';
import Navbar from './navbar';
import './App.css';

function App() {
  return (
    <div className="App">
      <header className="App-header">
        <img src={logo} className="App-logo" alt="logo" />
        <p>
          Edit <code>src/App.js</code> and save to reload.
        </p>
        <Navbar className="color: red;" headerTitle="This is a Navbar" />
        <a
          className="App-link"
          href="https://reactjs.org"
          target="_blank"
          rel="noopener noreferrer"
        >
          Learn React Right Now!
        </a>
      </header>
    </div>
  );
}

export default App;
