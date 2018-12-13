import React, { Component } from 'react';
import './App.css';
import Canvas from './components/Canvas/Canvas';

class App extends Component {
    render() {
        return (
            <div className="App">
                <h3>Nature of Code</h3>
                <Canvas width={640} height={360}/>
            </div>
        );
    }
}

export default App;
