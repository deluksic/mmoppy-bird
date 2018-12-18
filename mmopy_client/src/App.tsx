import * as React from 'react';
import './App.css';
import {init, render} from './main';

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

  public componentDidMount(){
    init();
    this.loop();
  }

  loop(): void {
    requestAnimationFrame(this.loop.bind(this));
    render();
  }

  public render() {
    return (
      <div className="App">
        <canvas id="main_canvas"></canvas>
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
