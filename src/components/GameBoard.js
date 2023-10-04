import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from './GameCanvas';

const objectSize = 10;
const canvasSize = 250;
const speed = 10;

const GameBoard = () => {
    const [snake, setSnake] = useState([{ x: 10, y: 30, size: objectSize }]);
    const [food, setFood] = useState({ x: 100, y: 100, size: objectSize });
    const [dir, setDir] = useState({ x: speed, y: 0 });
    const inputQueue = useRef([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isGameRunning, setIsGameRunning] = useState(true);

    const restartGame = () => {
        setSnake([{ x: 10, y: 30, size: 10 }]);
        setDir({ x: speed, y: 0 });
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

        if (head.x < food.x + food.size && head.x + head.size > food.x &&
            head.y < food.y + food.size && head.y + head.size > food.y) {
            setFood({
                x: Math.floor(Math.random() * canvasSize / objectSize) * objectSize,
                y: Math.floor(Math.random() * canvasSize / objectSize) * objectSize,
                size: objectSize
            });
            newSnake = [head, ...snake];
            setScore(prevScore => prevScore + 10);
        }

        // Check for snake going out of bounds or eating itself
        if (
            head.x < 0 || head.x >= canvasSize ||
            head.y < 0 || head.y >= canvasSize ||
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
                    if (dir.y === 0) newDir = { x: 0, y: -speed };
                    break;
                case 'ArrowDown':
                    if (dir.y === 0) newDir = { x: 0, y: speed };
                    break;
                case 'ArrowLeft':
                    if (dir.x === 0) newDir = { x: -speed, y: 0 };
                    break;
                case 'ArrowRight':
                    if (dir.x === 0) newDir = { x: speed, y: 0 };
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
            const gameInterval = setInterval(moveSnake, 100);
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
                <GameCanvas snake={snake} food={food} width={canvasSize} height={canvasSize} />
            </div>
        </div>
    );
};

export default GameBoard;
