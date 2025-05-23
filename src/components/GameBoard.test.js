import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import GameBoard from './GameBoard';

// Mock Math.random() for predictable food/obstacle placement
const mockMath = Object.create(global.Math);
mockMath.random = () => 0.5; // Default mock, can be overridden in tests
global.Math = mockMath;

describe('GameBoard Logic', () => {
    beforeEach(() => {
        // Using fake timers to control setInterval game loop
        jest.useFakeTimers();
    });

    afterEach(() => {
        // Restore real timers and clear any mocks
        jest.runOnlyPendingTimers();
        jest.useRealTimers();
        jest.clearAllMocks(); // Clear all mocks, including Math.random if overridden in a test
        global.Math.random = () => 0.5; // Reset Math.random to default mock for next test
    });

    test('should display initial score of 0', () => {
        render(<GameBoard />);
        expect(screen.getByText(/Score: 0/i)).toBeInTheDocument();
    });

    test('should increment score when snake eats food', async () => {
        // Override Math.random for predictable food placement
        // Place food at x=20, y=30 so snake eats it on first move (initial snake head {x:10, y:30}, dir {x:10,y:0})
        // Canvas 250x250, Object_size 10. So x=20 means 2*10, y=30 means 3*10
        // food.x = Math.floor(random() * 25) * 10. If random = 0.08 => floor(2) * 10 = 20
        // food.y = Math.floor(random() * 25) * 10. If random = 0.12 => floor(3) * 10 = 30
        // Obstacles are also generated using Math.random.
        // For this test, let's make obstacles far away.
        // Obstacle 1: x=0.6*250=150, y=0.6*250=150
        // Obstacle 2: x=0.7*250=170, y=0.7*250=170
        // ...and so on for NUM_OBSTACLES = 5
        
        let callCount = 0;
        const randomValues = [
            // For initial food generation (after obstacles)
            0.08, // food x = 20
            0.12, // food y = 30
            // For initial obstacle generation (NUM_OBSTACLES = 5)
            // These need to be safe from initial snake {x:10, y:30} and each other.
            0.6, 0.6, // Obstacle 1 (150,150)
            0.7, 0.7, // Obstacle 2 (170,170)
            0.8, 0.8, // Obstacle 3 (200,200)
            0.9, 0.9, // Obstacle 4 (220,220)
            0.95, 0.95, // Obstacle 5 (230,230) - check CANVAS_SIZE for bounds
        ];

        global.Math.random = () => {
            const val = randomValues[callCount] || 0.5; // fallback to 0.5 if more calls than values
            callCount++;
            return val;
        };
        
        render(<GameBoard />);
        
        // Initial score
        expect(screen.getByText(/Score: 0/i)).toBeInTheDocument();

        // Game loop runs every 100ms. Snake moves right by default.
        // Initial snake: [{ x: 10, y: 30, size: 10 }]
        // Initial food will be set to { x: 20, y: 30 } by our mock
        // Snake moves to x: 10 + 10 = 20. Collision with food.
        act(() => {
            jest.advanceTimersByTime(100); // Advance 1 game tick
        });
        
        // Score should be 10
        expect(screen.getByText(/Score: 10/i)).toBeInTheDocument();
    });
    
    test('should trigger game over when snake hits a wall', async () => {
        render(<GameBoard />);
        // Initial snake: [{ x: 10, y: 30, size: 10 }], dir: {x: 10, y: 0} (moves right)
        // To hit the left wall, we need to change direction first.
        
        act(() => {
            fireEvent.keyDown(document, { key: 'ArrowUp' }); // Change direction to Up
        });
        act(() => {
            jest.advanceTimersByTime(100); // Move {x:10, y:20}
        });
         act(() => {
            fireEvent.keyDown(document, { key: 'ArrowLeft' }); // Change direction to Left
        });
        act(() => {
            jest.advanceTimersByTime(100); // Move {x:0, y:20}
        });
        act(() => {
            jest.advanceTimersByTime(100); // Move {x:-10, y:20} -> Hits left wall
        });

        expect(await screen.findByText('Game Over!')).toBeInTheDocument();
    });

    test('should trigger game over when snake hits an obstacle', async () => {
        // Place an obstacle at x=30, y=30.
        // Snake starts at {x:10, y:30}, moves right by default.
        // Move 1: {x:20, y:30}
        // Move 2: {x:30, y:30} -> hits obstacle
        let callCount = 0;
        const randomValuesForObstacleTest = [
            // For initial food generation (make it far away)
            0.8, 0.8, // food (200,200)
            // For initial obstacle generation (NUM_OBSTACLES = 5)
            // Obstacle 1: x=30, y=30
            0.12, // x = floor(0.12 * 25) * 10 = 3 * 10 = 30
            0.12, // y = floor(0.12 * 25) * 10 = 3 * 10 = 30
            // Other obstacles far away
            0.7, 0.7,
            0.8, 0.8,
            0.9, 0.9,
            0.95, 0.95,
        ];
        global.Math.random = () => {
            const val = randomValuesForObstacleTest[callCount] || 0.5;
            callCount++;
            return val;
        };

        render(<GameBoard />);

        // Initial snake: [{ x: 10, y: 30, size: 10 }], dir: {x: 10, y: 0} (moves right)
        // Obstacle is at {x:30, y:30}
        
        // Move 1: snake head becomes {x:20, y:30}
        act(() => {
            jest.advanceTimersByTime(100);
        });
        // Move 2: snake head becomes {x:30, y:30} -> should hit obstacle
        act(() => {
            jest.advanceTimersByTime(100);
        });
        
        expect(await screen.findByText('Game Over!')).toBeInTheDocument();
        // Check final score if needed, for this test, it would be 0.
        expect(screen.getByText(/Final Score: 0/i)).toBeInTheDocument();
    });
});
