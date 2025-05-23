import React from 'react';
import { useRef, useEffect } from 'react';

function GameCanvas({ snake, food, obstacles, width, height, objectSize }) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        const context = canvas.getContext('2d');

        // Fill background
        context.fillStyle = '#f4f4f4'; // Light grey background
        context.fillRect(0, 0, width, height);

        // Draw grid
        context.strokeStyle = '#ddd'; // Light grey for grid lines
        context.lineWidth = 0.5;
        for (let x = 0; x < width; x += objectSize) {
            context.beginPath();
            context.moveTo(x, 0);
            context.lineTo(x, height);
            context.stroke();
        }
        for (let y = 0; y < height; y += objectSize) {
            context.beginPath();
            context.moveTo(0, y);
            context.lineTo(width, y);
            context.stroke();
        }

        // Draw border
        context.strokeStyle = '#333'; // Darker grey for border
        context.lineWidth = 2;
        context.strokeRect(0, 0, width, height);

        // Draw snake
        context.fillStyle = '#32CD32'; // Lime green
        snake.forEach((segment) => {
            context.fillRect(segment.x, segment.y, segment.size, segment.size);
        });

        // Draw food
        context.fillStyle = '#FF4136'; // Grapefruit red
        if (food && food.x !== undefined && food.y !== undefined) {
            context.fillRect(food.x, food.y, food.size, food.size);
        }

        // Draw obstacles
        context.fillStyle = '#8B4513'; // Saddle brown
        if (obstacles) {
            obstacles.forEach(obstacle => {
                context.fillRect(obstacle.x, obstacle.y, obstacle.size, obstacle.size);
            });
        }

    }, [snake, food, obstacles, height, width, objectSize]); // Re-render when state changes

    return <div><canvas ref={canvasRef} width={width} height={height}></canvas></div>;
}

export default GameCanvas;
