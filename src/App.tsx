import React, { Component } from 'react';
import './App.css';
import Canvas from './components/Canvas/Canvas';
import { CanvasProps } from './components/Canvas/CanvasInterfaces';
import { width, height, pages, pageLabelMapping} from './constants/pages';

interface AppProps {}
interface AppState {
    currentPage: string;
}

class App extends Component<AppProps, AppState> {
    private width: number = width;
    private height: number = height;
    private pages: string[] = pages;
    private pageLabelMapping: { [key: string]: string } = pageLabelMapping;

    constructor(props: AppProps) {
        super(props);
        this.state = {
            currentPage: 'walker'
        };
    };

    renderButtons(): JSX.Element[] {
        return this.pages.map((page: string) => {
            return (
                <button onClick={() => {
                    this.setState((oldState) => ({
                        ...oldState,
                        currentPage: page
                    }));
                }}>
                    {this.pageLabelMapping[page]}
                </button>
            );
        });
    }

    render() {
        const { currentPage } = this.state;
        const canvasProps: CanvasProps = {
            width: this.width,
            height: this.height,
            currentPage,
        }
        return (
            <div className="App">
                {this.renderButtons()}
                <h3>Nature of Code</h3>
                <Canvas {...canvasProps} />
            </div>
        );
    }
}

export default App;
