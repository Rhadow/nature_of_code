import * as React from "react";
import { ICanvasProps, ICanvasState } from './CanvasInterfaces';
import { ICreatureInterface } from "../../elements/ElementInterface";
import {pageCreatureMapping} from '../../constants/pages';
import cloneDeep from 'lodash.clonedeep';
import * as numjs from 'numjs';
import Mover from '../../elements/Mover/Mover';

export default class Canvas extends React.Component<ICanvasProps, ICanvasState> {
    private canvasRef = React.createRef<HTMLCanvasElement>();
    private pageCreatureMapping: { [key: string]: ICreatureInterface[] } = pageCreatureMapping;
    private gravity: nj.NdArray = numjs.array([0, 0.5]);
    private wind: nj.NdArray = numjs.array([0.01, 0]);
    private frictionCoefficient = 0.01;
    private frictionNormalForce = 1;

    constructor(props: ICanvasProps) {
        super(props);
        this.state = {
            ctx: null,
            mouseX: 0,
            mouseY: 0,
            currentCreatures: cloneDeep(this.pageCreatureMapping[this.props.currentPage])
        }
    }

    draw(): void {
        const { currentCreatures, ctx } = this.state;
        ctx!.clearRect(0, 0, this.props.width, this.props.height);
        currentCreatures.forEach((creature:ICreatureInterface) => {
            if (creature instanceof Mover) {
                const frictionMagniture = this.frictionCoefficient * this.frictionNormalForce;
                creature.applyForce(this.gravity.multiply(creature.mass));
                creature.applyForce(this.wind);
                let friction = numjs.array([0, 0]);
                if (creature.velocity.max() !== 0 || creature.velocity.min() !== 0) {
                    friction = creature.velocity.subtract(creature.velocity.min()).divide(creature.velocity.max() - creature.velocity.min());
                }
                creature.applyForce(friction.multiply(-frictionMagniture));
            }
            creature.step(this.state);
            creature.display(this.state);
        });
        window.requestAnimationFrame(() => this.draw());
    }

    componentWillReceiveProps(nextProps: ICanvasProps): void {
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