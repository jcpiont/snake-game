import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const numRows = 20;
const cellSize = 20;

const App = () => {
  const [snake, setSnake] = useState([{ x: 5, y: 5 }]);
  const [food, setFood] = useState({ x: 10, y: 10 });
  const [dir, setDir] = useState({ x: 0, y: 0 });

  const moveSnake = useCallback(() => {
    let newSnake = snake.map(pos => ({ ...pos }));
    let head = Object.assign({}, newSnake[0]);

    head.x += dir.x;
    head.y += dir.y;

    if (head.x === food.x && head.y === food.y) {
      setFood({
        x: Math.floor(Math.random() * numRows),
        y: Math.floor(Math.random() * numRows)
      });
      newSnake = [head, ...newSnake];
    } else {
      newSnake.pop();
      newSnake = [head, ...newSnake];
    }

    setSnake(newSnake);
  }, [dir, food, snake]);

  useEffect(() => {
    const handleKeydown = e => {
      switch (e.key) {
        case "ArrowUp":
          setDir({ x: 0, y: -1 });
          break;
        case "ArrowDown":
          setDir({ x: 0, y: 1 });
          break;
        case "ArrowLeft":
          setDir({ x: -1, y: 0 });
          break;
        case "ArrowRight":
          setDir({ x: 1, y: 0 });
          break;
        default:
          break;
      }
    };

    document.addEventListener("keydown", handleKeydown);
    return () => document.removeEventListener("keydown", handleKeydown);
  }, []);

  useEffect(() => {
    const gameInterval = setInterval(moveSnake, 150);
    return () => clearInterval(gameInterval);
  }, [moveSnake]);

  return (
    <div className="App">
      <div className="GameBoard">
        {Array.from({ length: numRows }).map((_, y) =>
          Array.from({ length: numRows }).map((_, x) => (
            <div
              key={`cell-${x}-${y}`}
              className={`cell ${snake.some(pos => pos.x === x && pos.y === y) ? "snake" : ""} ${food.x === x && food.y === y ? "food" : ""}`}
              style={{
                width: `${cellSize}px`,
                height: `${cellSize}px`
              }}
            ></div>
          ))
        )}
      </div>
    </div>
  );
};

export default App;
