import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from './GameCanvas';

const OBJECT_SIZE = 10;
const CANVAS_SIZE = 250;
const SPEED = 10;
const INITIAL_SNAKE = [{ x: 10, y: 30, size: OBJECT_SIZE }];
const INITIAL_FOOD = { x: 100, y: 100, size: OBJECT_SIZE };
const INITIAL_DIR = { x: SPEED, y: 0 };

const GameBoard = () => {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState(INITIAL_FOOD);
    const [dir, setDir] = useState(INITIAL_DIR);
    const inputQueue = useRef([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isGameRunning, setIsGameRunning] = useState(true);

    const restartGame = () => {
        setSnake(INITIAL_SNAKE);
        setDir(INITIAL_DIR);
        setScore(0);
        setGameOver(false);
        setIsGameRunning(true);
    };

    const handleKeydown = useCallback((e) => {
        let newDir = null;
        switch (e.key) {
            case 'ArrowUp':
                if (dir.y === 0) newDir = { x: 0, y: -SPEED };
                break;
            case 'ArrowDown':
                if (dir.y === 0) newDir = { x: 0, y: SPEED };
                break;
            case 'ArrowLeft':
                if (dir.x === 0) newDir = { x: -SPEED, y: 0 };
                break;
            case 'ArrowRight':
                if (dir.x === 0) newDir = { x: SPEED, y: 0 };
                break;
            default:
                break;
        }

        if (newDir) {
            inputQueue.current.push(newDir);
        }
    }, [dir]);

    useEffect(() => {
        document.addEventListener("keydown", handleKeydown);
        return () => document.removeEventListener("keydown", handleKeydown);
    }, [handleKeydown]);

    const generateRandomPosition = () => ({
        x: Math.floor(Math.random() * CANVAS_SIZE / OBJECT_SIZE) * OBJECT_SIZE,
        y: Math.floor(Math.random() * CANVAS_SIZE / OBJECT_SIZE) * OBJECT_SIZE,
        size: OBJECT_SIZE
    });

    const moveSnake = useCallback(() => {
        while (inputQueue.current.length) {
            const nextDir = inputQueue.current.shift();
            if (!nextDir) continue;
            if (dir.x + nextDir.x !== 0 || dir.y + nextDir.y !== 0) {
                setDir(nextDir);
            }
        }

        let head = { ...snake[0], x: snake[0].x + dir.x, y: snake[0].y + dir.y };
        let newSnake = [head, ...snake.slice(0, -1)];

        if (head.x < food.x + food.size && head.x + head.size > food.x &&
            head.y < food.y + food.size && head.y + head.size > food.y) {
            setFood(generateRandomPosition());
            newSnake = [head, ...snake];
            setScore(score => score + 10);
        }

        if (
            head.x < 0 || head.x >= CANVAS_SIZE ||
            head.y < 0 || head.y >= CANVAS_SIZE ||
            snake.some(segment => segment.x === head.x && segment.y === head.y)
        ) {
            setGameOver(true);
            setIsGameRunning(false);
        } else {
            setSnake(newSnake);
        }
    }, [snake, dir, food]);

    useEffect(() => {
        if (isGameRunning) {
            const gameInterval = setInterval(moveSnake, 100);
            return () => clearInterval(gameInterval);
        }
    }, [moveSnake, isGameRunning]);

    return (
        <div>
            <div className="score-board">
                <div className="score">Score: {score}</div>
            </div>
            {gameOver && (
                <div className="game-over active">
                    <div className="game-over-content">
                        <h2>Game Over!</h2>
                        <p>Final Score: {score}</p>
                        <button onClick={restartGame}>Restart</button>
                    </div>
                </div>
            )}
            <div className="game-board">
                <GameCanvas snake={snake} food={food} width={CANVAS_SIZE} height={CANVAS_SIZE} />
            </div>
        </div>
    );
};

export default GameBoard;
