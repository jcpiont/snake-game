import React from 'react';
import { useRef, useEffect } from 'react';

function GameCanvas({ snake, food, width, height }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');
        context.clearRect(0, 0, canvas.width, canvas.height);

        // Draw border
        context.strokeStyle = 'black';
        context.lineWidth = 2;
        context.strokeRect(0, 0, width, height);

        // Draw snake
        context.fillStyle = 'green';
        for (let segment of snake) {
            context.fillRect(segment.x, segment.y, segment.size, segment.size);
        }

        // Draw food
        context.fillStyle = 'red';
        context.fillRect(food.x, food.y, food.size, food.size);

    }, [snake, food, height, width]);  // Re-render when snake or food state changes

    return <div><canvas ref={canvasRef} width={width} height={height}></canvas></div>;
}

export default GameCanvas;
