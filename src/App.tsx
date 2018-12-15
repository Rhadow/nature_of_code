import React, { Component } from 'react';
import './App.css';
import Canvas from './components/Canvas/Canvas';
import { ICanvasProps } from './components/Canvas/CanvasInterfaces';
import { width, height, pages, pageLabelMapping, IPageLabelMapping, defaultPage } from './constants/pages';

interface AppProps {}
interface AppState {
    currentPage: string;
}

class App extends Component<AppProps, AppState> {
    private width: number = width;
    private height: number = height;
    private pages: string[] = pages;
    private pageLabelMapping: IPageLabelMapping = pageLabelMapping;

    constructor(props: AppProps) {
        super(props);
        this.state = {
            currentPage: defaultPage
        };
    };

    renderButtons(): JSX.Element[] {
        return this.pages.map((page: string, i:number) => {
            return (
                <button key={`button${i}`} onClick={() => {
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
        const IcanvasProps: ICanvasProps = {
            width: this.width,
            height: this.height,
            currentPage,
        }
        return (
            <div className="App">
                {this.renderButtons()}
                <h3>Nature of Code</h3>
                <Canvas {...IcanvasProps} />
            </div>
        );
    }
}

export default App;
