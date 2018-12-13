import * as React from "react";
import Walker from "../../elements/Walker";
import MouseWalker from "../../elements/MouseWalker";
import { CanvasProps, CanvasState } from './CanvasInterfaces';
import CreatureInterface from "../../elements/CreatureInterface";

export default class Canvas extends React.Component<CanvasProps, CanvasState> {
    private canvasRef = React.createRef<HTMLCanvasElement>();
    constructor(props: CanvasProps) {
        super(props);
        this.state = {
            ctx: null,
            mouseX: 0,
            mouseY: 0,
            creatures: [
                new Walker(this.props.width / 2, this.props.height / 2),
                new MouseWalker(this.props.width / 2, this.props.height / 2)
            ]
        }
    }

    draw(): void {
        this.state.creatures.forEach((creature:CreatureInterface) => {
            creature.step(this.state);
            creature.display(this.state);
        });
        window.requestAnimationFrame(() => this.draw());
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