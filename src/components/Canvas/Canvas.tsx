import * as React from "react";
import { CanvasProps, CanvasState } from './CanvasInterfaces';
import CreatureInterface from "../../elements/CreatureInterface";
import {pageCreatureMapping} from '../../constants/pages';
import cloneDeep from 'lodash.clonedeep';

export default class Canvas extends React.Component<CanvasProps, CanvasState> {
    private canvasRef = React.createRef<HTMLCanvasElement>();
    private pageCreatureMapping: { [key: string]: CreatureInterface[] } = pageCreatureMapping;

    constructor(props: CanvasProps) {
        super(props);
        this.state = {
            ctx: null,
            mouseX: 0,
            mouseY: 0,
            currentCreatures: cloneDeep(this.pageCreatureMapping[this.props.currentPage])
        }
    }

    draw(): void {
        const { currentCreatures } = this.state;
        currentCreatures.forEach((creature:CreatureInterface) => {
            creature.step(this.state);
            creature.display(this.state);
        });
        window.requestAnimationFrame(() => this.draw());
    }

    componentWillReceiveProps(nextProps: CanvasProps): void {
        const { ctx } = this.state;
        if (nextProps.currentPage !== this.props.currentPage) {
            if (ctx) {
                ctx.clearRect(0, 0, this.props.width, this.props.height);
            }
            this.setState((oldState) => ({
                ...oldState,
                currentCreatures: cloneDeep(this.pageCreatureMapping[nextProps.currentPage])
            }));
        }
    }

    componentDidMount():void {
        if (this.canvasRef.current) {
            const cavasRef = this.canvasRef.current;
            this.canvasRef.current.addEventListener('mousemove', (e) => {
                this.setState((state: CanvasState): CanvasState => ({
                    ...state,
                    mouseX: e.offsetX,
                    mouseY: e.offsetY
                }));
            });
            this.setState((state: CanvasState): CanvasState => ({
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