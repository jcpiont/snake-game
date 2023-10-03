import React from 'react';
import Snake from './Snake';
import Food from './Food';

const Cell = ({ x, y, cellSize, snake, food }) => (
    <div
        key={`cell-${x}-${y}`}
        className="cell"
        style={{
            width: `${cellSize}px`,
            height: `${cellSize}px`,
        }}
    >
        {snake.some((pos) => pos.x === x && pos.y === y) && <Snake />}
        {food.x === x && food.y === y && <Food />}
    </div>
);

export default Cell;