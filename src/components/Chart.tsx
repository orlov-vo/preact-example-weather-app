import { h } from "preact";
import { useEffect, useState, useCallback } from "preact/hooks";

const HEIGHT_PADDING = 80;
const WIDTH_PADDING = 100;

const X0 = 30;
const Y0 = 30;

interface Props {
    data: Array<{ t: Date; v: number }>;
}

/**
 * Component for render chart in canvas
 *
 * @param props Properties for component
 * @returns JSX element
 */
export default function Chart(props: Props) {
    const { data } = props;
    const [context, setContext] = useState<CanvasRenderingContext2D | null>(null);
    const [height, setHeight] = useState<number>(0);
    const [width, setWidth] = useState<number>(0);
    const [stepX, setStepX] = useState(0);
    const [stepY, setStepY] = useState(0);
    const [y0, setY0] = useState(Y0);

    // Callback for connecting to canvas
    const setRef = useCallback<(node: HTMLCanvasElement) => void>((node) => {
        if (!node) return;
        setContext(node.getContext("2d"));
        setHeight(node.height - HEIGHT_PADDING);
        setWidth(node.width - WIDTH_PADDING);
    }, []);

    // Calculate steps for rendering chart based on data
    useEffect(() => {
        const maxValue = data.reduce((acc, { v }) => (v > acc ? v : acc), Number.MIN_VALUE);
        const minValue = data.reduce((acc, { v }) => (v < acc ? v : acc), Number.MAX_VALUE);

        const stepX = width / data.length;
        const stepY = height / (maxValue - minValue);

        setStepX(stepX);
        setStepY(stepY);
        setY0(Y0 + maxValue * stepY);
    }, [height, width, data]);

    // Rendering effect
    useEffect(() => {
        if (!context) return;

        //--- Clear
        context.clearRect(0, 0, width + WIDTH_PADDING, height + HEIGHT_PADDING);

        //--- Draw lines
        context.beginPath();

        // Vertical line
        context.moveTo(X0, Y0);
        context.lineTo(X0, height + Y0);

        // Horizontal line
        context.moveTo(X0, y0);
        context.lineTo(width + X0, y0);

        context.strokeStyle = "#000";
        context.lineWidth = 2;
        context.stroke();

        context.closePath();

        //--- Draw chart
        context.beginPath();

        data.forEach((point, index, arr) => {
            const { v: value } = point;

            const x = X0 + index * stepX;
            const y = y0 - value * stepY;

            if (index === 0) {
                context.moveTo(x, y);
            } else {
                context.lineTo(x, y);
            }

            if (arr.length <= 100) {
                context.fillText(value + "", x - 5, y - 5);
            }
        });

        context.strokeStyle = "#f00";
        context.lineWidth = 1;
        context.stroke();

        context.closePath();
    }, [context, width, height, stepX, stepY, y0, data]);

    return <canvas ref={setRef} class="chart" width="500" height="300"></canvas>;
}
