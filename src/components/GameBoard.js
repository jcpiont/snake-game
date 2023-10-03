import React, { useState, useEffect, useCallback, useRef } from 'react';
import Cell from './Cell';

const numRows = 20;
const cellSize = 20;

const GameBoard = () => {
    const [snake, setSnake] = useState([{ x: 5, y: 3 }]);
    const [food, setFood] = useState({ x: 10, y: 10 });
    const [dir, setDir] = useState({ x: 0, y: 1 });
    const inputQueue = useRef([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isGameRunning, setIsGameRunning] = useState(true);

    const restartGame = () => {
        setSnake([{ x: 5, y: 5 }]);
        setDir({ x: 0, y: 1 });
        setScore(0);
        setGameOver(false);
        setIsGameRunning(true);
    };


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
            setGameOver(true);
            setIsGameRunning(false);
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
        if (isGameRunning) {
            const gameInterval = setInterval(moveSnake, 150);
            return () => clearInterval(gameInterval);
        }
    }, [moveSnake, isGameRunning]); // Now it only depends on moveSnake.


    return (
        <div>
            <div className="score-board">
                <div className="score">Score: {score}</div>
            </div>
            {gameOver && <div className={gameOver ? "game-over active" : "game-over"}>
                <div className="game-over-content">
                    <h2>Game Over!</h2>
                    <p>Final Score: {score}</p>
                    <button onClick={restartGame}>Restart</button>
                </div>
            </div>
            }
            <div className="game-board">
                {Array.from({ length: numRows }).map((_, y) =>
                    Array.from({ length: numRows }).map((_, x) => (
                        <Cell x={x} y={y} cellSize={cellSize} snake={snake} food={food} key={`cell-${x}-${y}`} />
                    ))
                )}
            </div>
        </div>
    );
};

export default GameBoard;
