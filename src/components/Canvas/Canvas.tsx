import * as React from "react";
import cloneDeep from 'lodash.clonedeep';
import { ICanvasProps, ICanvasState } from './CanvasInterfaces';
import { experiments } from '../../constants/pages';

export default class Canvas extends React.Component<ICanvasProps, ICanvasState> {
    private canvasRef = React.createRef<HTMLCanvasElement>();
    private nonRefreshPages:string[] = ['walker', 'mousewalker'];

    constructor(props: ICanvasProps) {
        super(props);
        this.state = {
            ctx: null,
            mouseX: 0,
            mouseY: 0,
            pressedKey: '',
            currentFrame: 0,
            worldWidth: this.props.width,
            worldHeight: this.props.height,
            currentCreatures: cloneDeep(experiments[this.props.currentPage].creatures),
            currentEnvironment: cloneDeep(experiments[this.props.currentPage].environments),
        }
    }

    draw(): void {
        const { currentCreatures, ctx, currentEnvironment, currentFrame } = this.state;
        if (!this.nonRefreshPages.includes(this.props.currentPage)) {
            ctx!.clearRect(0, 0, this.props.width, this.props.height);
        }
        const initalForceFunction = experiments[this.props.currentPage].initialForceFunction;
        const applyForceFunction = experiments[this.props.currentPage].forceFunction;

        if (currentFrame === 0) {
            initalForceFunction(currentEnvironment, currentCreatures, this.state);
        }
        applyForceFunction(currentEnvironment, currentCreatures, this.state);
        this.setState((oldState) => ({
            ...oldState,
            currentFrame: oldState.currentFrame + 1
        }), () => {
            window.requestAnimationFrame(() => this.draw());
        });
    }

    componentWillReceiveProps(nextProps: ICanvasProps): void {
        const { ctx } = this.state;
        if (nextProps.currentPage !== this.props.currentPage) {
            this.setState((oldState) => ({
                ...oldState,
                currentFrame: 0,
                currentCreatures: cloneDeep(experiments[nextProps.currentPage].creatures),
                currentEnvironment: cloneDeep(experiments[nextProps.currentPage].environments),
            }), () => {
                if (ctx) {
                    ctx.clearRect(0, 0, this.props.width, this.props.height);
                }
            });
        }
    }

    componentDidMount():void {
        if (this.canvasRef.current) {
            const cavasRef = this.canvasRef.current;
            this.canvasRef.current.addEventListener('mousemove', (e) => {
                this.setState((state: ICanvasState): ICanvasState => ({
                    ...state,
                    mouseX: e.offsetX,
                    mouseY: e.offsetY
                }));
            });
            document.addEventListener('keydown', (e) => {
                this.setState((state: ICanvasState): ICanvasState => ({
                    ...state,
                    pressedKey: e.key
                }));
            });
            document.addEventListener('keyup', (e) => {
                this.setState((state: ICanvasState): ICanvasState => ({
                    ...state,
                    pressedKey: ''
                }));
            });
            this.setState((state: ICanvasState): ICanvasState => ({
                ...state,
                ctx: cavasRef.getContext('2d')
            }), () => {
                if (this.state.ctx) {
                    this.draw();
                }
            });
        }
    }

    render():JSX.Element {
        return (
            <div>
                <canvas id="world" ref={this.canvasRef} width={this.props.width} height={this.props.height} />
            </div>
        );
    }
}