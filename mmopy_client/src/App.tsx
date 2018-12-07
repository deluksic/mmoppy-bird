import * as React from 'react';
import './App.css';

import logo from './logo.svg';

class SimpleState {
  public message: string | null;
}

class App extends React.Component<{}, SimpleState> {

  public componentWillMount() {
    this.setState({ message: null });
    const ws = new WebSocket("ws://localhost:3000/");
    ws.onopen = ev => {
      ws.send("Hello from frontend!");
    }
    ws.onmessage = ev => {
      this.setState({ message: ev.data });
    }
  }

  public render() {
    return (
      <div className="App">
        <header className="App-header">
          <img src={logo} className="App-logo" alt="logo" />
          <h1 className="App-title">Welcome to React</h1>
        </header>
        <p className="App-intro">
          To get started, edit <code>src/App.tsx</code> and save to reload.
        </p>
        {this.state.message &&
          <p>
            We received this message: {this.state.message}
          </p>
        }
      </div>
    );
  }
}

export default App;
