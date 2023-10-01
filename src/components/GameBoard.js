import React, { useState, useEffect, useCallback, useRef } from 'react';
import Snake from './Snake';
import Food from './Food';

const numRows = 20;
const cellSize = 20;

const GameBoard = () => {
    const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
    const [food, setFood] = useState({ x: 10, y: 10 });
    const [dir, setDir] = useState({ x: 0, y: 1 });
    const inputQueue = useRef([]);
    const [score, setScore] = useState(0);

    const moveSnake = useCallback(() => {
        // Process all direction changes in the queue
        while (inputQueue.current.length) {
            const nextDir = inputQueue.current.shift();
            if (!nextDir) continue;
            // Prevent reversing direction directly
            if (dir.x + nextDir.x !== 0 || dir.y + nextDir.y !== 0) {
                setDir(nextDir);
            }
        }

        let head = Object.assign({}, snake[0]);
        head.x += dir.x;
        head.y += dir.y;

        let newSnake = snake.map(pos => ({ ...pos }));
        newSnake = [head, ...newSnake.slice(0, -1)];

        if (head.x === food.x && head.y === food.y) {
            setFood({
                x: Math.floor(Math.random() * numRows),
                y: Math.floor(Math.random() * numRows)
            });
            newSnake = [head, ...snake];
            setScore(prevScore => prevScore + 10);
        }

        // Check for snake going out of bounds or eating itself
        if (
            head.x < 0 || head.x >= numRows ||
            head.y < 0 || head.y >= numRows ||
            snake.some(s => s.x === head.x && s.y === head.y)
        ) {
            // Reset Game
            setSnake([{ x: 5, y: 5 }]);
            setDir({ x: 0, y: 1 });
            setScore(0);
        } else {
            setSnake(newSnake);
        }
    }, [snake, dir, food]);

    useEffect(() => {
        const handleKeydown = (e) => {
            let newDir = null;
            switch (e.key) {
                case 'ArrowUp':
                    if (dir.y === 0) newDir = { x: 0, y: -1 };
                    break;
                case 'ArrowDown':
                    if (dir.y === 0) newDir = { x: 0, y: 1 };
                    break;
                case 'ArrowLeft':
                    if (dir.x === 0) newDir = { x: -1, y: 0 };
                    break;
                case 'ArrowRight':
                    if (dir.x === 0) newDir = { x: 1, y: 0 };
                    break;
                default:
                    break;
            }

            if (newDir) {
                inputQueue.current.push(newDir);
            }
        };

        document.addEventListener("keydown", handleKeydown);
        return () => document.removeEventListener("keydown", handleKeydown);
    }, [dir]);

    useEffect(() => {
        const gameInterval = setInterval(moveSnake, 125);
        return () => clearInterval(gameInterval);
    }, [moveSnake]); // Now it only depends on moveSnake.


    return (
        <div>
            <div className="score-board">
                Score: {score}
            </div>
            <div className="game-board">
                {Array.from({ length: numRows }).map((_, y) =>
                    Array.from({ length: numRows }).map((_, x) => (
                        <div
                            key={`cell-${x}-${y}`}
                            className="cell"
                            style={{
                                width: `${cellSize}px`,
                                height: `${cellSize}px`
                            }}
                        >
                            {snake.some(pos => pos.x === x && pos.y === y) && <Snake />}
                            {food.x === x && food.y === y && <Food />}
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default GameBoard;
