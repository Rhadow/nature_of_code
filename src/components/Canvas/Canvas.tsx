import * as React from "react";
import cloneDeep from 'lodash.clonedeep';
import { ICanvasProps, ICanvasState } from './CanvasInterfaces';
import { ICreature, IEnvironment } from "../../elements/ElementInterface";
import { pageCreatureMapping, pageEnvironmentMapping, pageForceFunctionMapping } from '../../constants/pages';

export default class Canvas extends React.Component<ICanvasProps, ICanvasState> {
    private canvasRef = React.createRef<HTMLCanvasElement>();
    private pageCreatureMapping: { [key: string]: ICreature[] } = pageCreatureMapping;
    private pageEnvironmentMapping: { [key: string]: IEnvironment[] } = pageEnvironmentMapping;
    private pageForceFunctionMapping: { [key: string]: (currentEnvironment: IEnvironment[], creatures: ICreature[], canvasState: ICanvasState) => void } = pageForceFunctionMapping;
    private nonRefreshPages:string[] = ['walker', 'mousewalker'];

    constructor(props: ICanvasProps) {
        super(props);
        this.state = {
            ctx: null,
            mouseX: 0,
            mouseY: 0,
            currentCreatures: cloneDeep(this.pageCreatureMapping[this.props.currentPage]),
            currentEnvironment: cloneDeep(this.pageEnvironmentMapping[this.props.currentPage]),
        }
    }

    draw(): void {
        const { currentCreatures, ctx, currentEnvironment } = this.state;
        if (!this.nonRefreshPages.includes(this.props.currentPage)) {
            ctx!.clearRect(0, 0, this.props.width, this.props.height);
        }
        const applyForceFunction = this.pageForceFunctionMapping[this.props.currentPage];
        applyForceFunction(currentEnvironment, currentCreatures, this.state);
        window.requestAnimationFrame(() => this.draw());
    }

    componentWillReceiveProps(nextProps: ICanvasProps): void {
        const { ctx } = this.state;
        if (nextProps.currentPage !== this.props.currentPage) {
            this.setState((oldState) => ({
                ...oldState,
                currentCreatures: cloneDeep(this.pageCreatureMapping[nextProps.currentPage]),
                currentEnvironment: cloneDeep(this.pageEnvironmentMapping[nextProps.currentPage]),
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