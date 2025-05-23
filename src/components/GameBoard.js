import React, { useState, useEffect, useCallback, useRef } from 'react';
import GameCanvas from './GameCanvas';

const OBJECT_SIZE = 10;
const CANVAS_SIZE = 250;
const SPEED = 10;
const INITIAL_SNAKE = [{ x: 10, y: 30, size: OBJECT_SIZE }];
// INITIAL_FOOD will be set by generateRandomPosition in restartGame
const INITIAL_DIR = { x: SPEED, y: 0 };
const NUM_OBSTACLES = 5;

const GameBoard = () => {
    const [snake, setSnake] = useState(INITIAL_SNAKE);
    const [food, setFood] = useState({}); // Initialize empty, will be set in restartGame
    const [obstacles, setObstacles] = useState([]);
    const [dir, setDir] = useState(INITIAL_DIR);
    const inputQueue = useRef([]);
    const [score, setScore] = useState(0);
    const [gameOver, setGameOver] = useState(false);
    const [isGameRunning, setIsGameRunning] = useState(false); // Start as false, true after setup

    const isPositionSafe = (position, snakeArray, obstaclesArray, foodItem = null) => {
        // Check against snake
        for (const segment of snakeArray) {
            if (segment.x === position.x && segment.y === position.y) return false;
        }
        // Check against obstacles
        for (const obstacle of obstaclesArray) {
            if (obstacle.x === position.x && obstacle.y === position.y) return false;
        }
        // Check against food (if provided)
        if (foodItem && foodItem.x === position.x && foodItem.y === position.y) return false;
        return true;
    };

    const generateRandomPosition = (snakeArray = [], obstaclesArray = [], foodItem = null) => {
        let position;
        do {
            position = {
                x: Math.floor(Math.random() * CANVAS_SIZE / OBJECT_SIZE) * OBJECT_SIZE,
                y: Math.floor(Math.random() * CANVAS_SIZE / OBJECT_SIZE) * OBJECT_SIZE,
                size: OBJECT_SIZE
            };
        } while (!isPositionSafe(position, snakeArray, obstaclesArray, foodItem));
        return position;
    };

    const generateObstacles = (snakeArray, foodItem) => {
        const newObstacles = [];
        for (let i = 0; i < NUM_OBSTACLES; i++) {
            let obstaclePos;
            do {
                obstaclePos = {
                    x: Math.floor(Math.random() * CANVAS_SIZE / OBJECT_SIZE) * OBJECT_SIZE,
                    y: Math.floor(Math.random() * CANVAS_SIZE / OBJECT_SIZE) * OBJECT_SIZE,
                    size: OBJECT_SIZE
                };
            // Ensure obstacle is not on snake, existing newObstacles, or food
            } while (!isPositionSafe(obstaclePos, snakeArray, newObstacles, foodItem));
            newObstacles.push(obstaclePos);
        }
        return newObstacles;
    };

    const restartGame = () => {
        setSnake(INITIAL_SNAKE);
        setDir(INITIAL_DIR);
        
        // Generate obstacles first, ensuring they are not on the initial snake
        const newObstacles = generateObstacles(INITIAL_SNAKE, null);
        setObstacles(newObstacles);

        // Then generate food, ensuring it's not on the initial snake or new obstacles
        const newFood = generateRandomPosition(INITIAL_SNAKE, newObstacles);
        setFood(newFood);
        
        setScore(0);
        setGameOver(false);
        setIsGameRunning(true);
    };

    useEffect(() => {
        restartGame(); // Initialize game on first mount
    }, []); // Empty dependency array ensures this runs only once on mount

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

    // generateRandomPosition is now defined above restartGame

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

        // Food consumption
        if (food.x !== undefined && // Check if food is initialized
            head.x < food.x + food.size && head.x + head.size > food.x &&
            head.y < food.y + food.size && head.y + head.size > food.y) {
            setFood(generateRandomPosition(newSnake, obstacles)); // Pass current snake and obstacles
            newSnake = [head, ...snake]; // Grow snake
            setScore(score => score + 10);
        }

        // Collision detection
        const collidesWithWall = head.x < 0 || head.x >= CANVAS_SIZE || head.y < 0 || head.y >= CANVAS_SIZE;
        const collidesWithSelf = newSnake.slice(1).some(segment => segment.x === head.x && segment.y === head.y);
        const collidesWithObstacle = obstacles.some(obstacle => obstacle.x === head.x && obstacle.y === head.y);

        if (collidesWithWall || collidesWithSelf || collidesWithObstacle) {
            setGameOver(true);
            setIsGameRunning(false);
        } else {
            setSnake(newSnake);
        }
    }, [snake, dir, food, obstacles]);

    useEffect(() => {
        if (isGameRunning && !gameOver) { // Ensure game doesn't run if game over
            const gameInterval = setInterval(moveSnake, 100);
            return () => clearInterval(gameInterval);
        }
    }, [moveSnake, isGameRunning, gameOver]);

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
                <GameCanvas snake={snake} food={food} obstacles={obstacles} width={CANVAS_SIZE} height={CANVAS_SIZE} objectSize={OBJECT_SIZE} />
            </div>
        </div>
    );
};

export default GameBoard;
