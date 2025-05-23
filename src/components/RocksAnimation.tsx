import React, { useEffect, useRef } from 'react';
import Matter from 'matter-js';

interface RocksAnimationProps {
  className?: string;
  maxBodies?: number;
  colors?: string[];
}

const RocksAnimation: React.FC<RocksAnimationProps> = ({
  className = '',
  maxBodies = 100,
  colors = ['#fc79bc', '#fcec79', '#fafafa'],
}) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const engineRef = useRef<Matter.Engine | null>(null);
  const renderRef = useRef<Matter.Render | null>(null);
  const bodyCountRef = useRef(0);
  const mousePositionRef = useRef({ x: 0, y: 0 });

  useEffect(() => {
    if (!containerRef.current) return;

    // Create engine
    const engine = Matter.Engine.create({
      gravity: {
        x: 0,
        y: 0,
      },
    });
    engineRef.current = engine;

    // Create renderer
    const render = Matter.Render.create({
      element: containerRef.current,
      engine: engine,
      options: {
        width: containerRef.current.clientWidth,
        height: containerRef.current.clientHeight,
        wireframes: false,
        background: 'transparent',
      },
    });
    renderRef.current = render;

    // Create walls
    const createWalls = () => {
      // Remove existing walls
      engine.world.bodies.forEach((body) => {
        if (body.isStatic) {
          Matter.Composite.remove(engine.world, body);
        }
      });

      const wallOptions = {
        isStatic: true,
        render: {
          visible: false,
        },
      };

      // Add walls
      Matter.World.add(engine.world, [
        Matter.Bodies.rectangle(
          containerRef.current!.clientWidth / 2,
          -25,
          containerRef.current!.clientWidth,
          50,
          wallOptions
        ), // top
        Matter.Bodies.rectangle(
          containerRef.current!.clientWidth / 2,
          containerRef.current!.clientHeight + 25,
          containerRef.current!.clientWidth,
          50,
          wallOptions
        ), // bottom
        Matter.Bodies.rectangle(
          -25,
          containerRef.current!.clientHeight / 2,
          50,
          containerRef.current!.clientHeight,
          wallOptions
        ), // left
        Matter.Bodies.rectangle(
          containerRef.current!.clientWidth + 25,
          containerRef.current!.clientHeight / 2,
          50,
          containerRef.current!.clientHeight,
          wallOptions
        ), // right
      ]);
    };

    // Create a new body
    const createBody = (x: number, y: number) => {
      const sides = Math.floor(Math.random() * (8 - 4 + 1)) + 4;
      const maxRadius = 40;
      const vertices = [];

      for (let i = 0; i < sides; i++) {
        const angle = ((Math.PI * 2) / sides) * i;
        const radius = Math.random() * maxRadius * 0.5 + maxRadius * 0.5;
        vertices.push({
          x: x + radius * Math.cos(angle),
          y: y + radius * Math.sin(angle),
        });
      }

      const randomColor = colors[Math.floor(Math.random() * colors.length)];

      const body = Matter.Bodies.fromVertices(
        x,
        y,
        [vertices],
        {
          frictionAir: 0.05,
          inertia: Infinity,
          render: {
            fillStyle: randomColor,
            strokeStyle: '#3F3F46',
            lineWidth: 1,
          },
        },
        true
      );

      Matter.Body.setVelocity(body, {
        x: (Math.random() - 0.5) * 0.2,
        y: 2,
      });

      bodyCountRef.current++;
      return body;
    };

    // Apply cursor attraction
    const applyCursorAttraction = () => {
      const bodies = Matter.Composite.allBodies(engine.world);

      bodies.forEach((body) => {
        const dx = mousePositionRef.current.x - body.position.x;
        const dy = mousePositionRef.current.y - body.position.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const forceMagnitude = 0.00001 * body.mass;

        Matter.Body.applyForce(body, body.position, {
          x: (dx / distance) * forceMagnitude,
          y: (dy / distance) * forceMagnitude,
        });
      });
    };

    // Create initial body
    const createInitialBody = () => {
      if (bodyCountRef.current < maxBodies) {
        const initialBody = createBody(
          containerRef.current!.clientWidth / 2,
          containerRef.current!.clientHeight / 50
        );
        Matter.World.add(engine.world, initialBody);
      }
    };

    // Setup event listeners
    const handleMouseMove = (event: MouseEvent) => {
      mousePositionRef.current.x = event.clientX;
      mousePositionRef.current.y = event.clientY;
    };

    const handleTouchMove = (event: TouchEvent) => {
      if (event.touches.length > 0) {
        const touch = event.touches[0];
        mousePositionRef.current.x = touch.clientX;
        mousePositionRef.current.y = touch.clientY;
      }
    };

    const handleResize = () => {
      if (!containerRef.current || !render) return;

      render.canvas.width = containerRef.current.clientWidth;
      render.canvas.height = containerRef.current.clientHeight;
      render.options.width = containerRef.current.clientWidth;
      render.options.height = containerRef.current.clientHeight;
      createWalls();
    };

    // Initialize
    createWalls();
    createInitialBody();

    // Add event listeners
    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('touchmove', handleTouchMove);
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Run engine and renderer
    Matter.Engine.run(engine);
    Matter.Render.run(render);

    // Add event for continuous body creation
    const intervalId = setInterval(createInitialBody, 2000);

    // Add event for cursor attraction
    Matter.Events.on(engine, 'beforeUpdate', applyCursorAttraction);

    // Cleanup
    return () => {
      clearInterval(intervalId);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('touchmove', handleTouchMove);
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      Matter.Events.off(engine, 'beforeUpdate', applyCursorAttraction);
      Matter.Render.stop(render);
      Matter.Engine.clear(engine);
      render.canvas.remove();
    };
  }, [maxBodies, colors]);

  return (
    <div
      ref={containerRef}
      className={`rocks-animation ${className}`}
      style={{ width: '100%', height: '100%', position: 'relative' }}
    />
  );
};

export default RocksAnimation;
