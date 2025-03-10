"use client"
import React, { useEffect, useRef, useState } from 'react';
import { Timer } from "lucide-react";
import { useUserContext } from '@/context/UserContext';
import { createSupabaseClient } from '@/utils/supaBase';

// Constants
const FREE_PLAY_LIMIT = 3;
const RESET_INTERVAL_MS = 24 * 60 * 60 * 1000; // 24 hours in ms

// Helper function to get game data from localStorage
const getGameData = () => {
  const stored = localStorage.getItem("gameData");
  if (stored) {
    try {
      const data = JSON.parse(stored);
      // Check if 24 hours have passed since lastReset
      if (Date.now() - data.lastReset >= RESET_INTERVAL_MS) {
        // Reset data if older than 24 hours
        const newData = { lastReset: Date.now(), dailyPlayCount: 0 };
        localStorage.setItem("gameData", JSON.stringify(newData));
        return newData;
      }
      return data;
    } catch (error) {
      console.error("Error parsing gameData:", error);
      const newData = { lastReset: Date.now(), dailyPlayCount: 0 };
      localStorage.setItem("gameData", JSON.stringify(newData));
      return newData;
    }
  }
  const newData = { lastReset: Date.now(), dailyPlayCount: 0 };
  localStorage.setItem("gameData", JSON.stringify(newData));
  return newData;
};

// Helper function to format ms into hh:mm:ss
const formatTime = (ms: number) => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = String(Math.floor(totalSeconds / 3600)).padStart(2, '0');
  const minutes = String(Math.floor((totalSeconds % 3600) / 60)).padStart(2, '0');
  const seconds = String(totalSeconds % 60).padStart(2, '0');
  return `${hours}:${minutes}:${seconds}`;
};

const GamePage = () => {
  const { user, setUser, userData, setUserData } = useUserContext();
  const supabase = createSupabaseClient();

  // Local state for game start and daily play count
  const [gameStarted, setGameStarted] = useState(false);
  const [dailyPlayCount, setDailyPlayCount] = useState(0);
  const [freePlaysCountdown, setFreePlaysCountdown] = useState(0);

  // On mount, load daily play data from localStorage
  useEffect(() => {
    const data = getGameData();
    setDailyPlayCount(data.dailyPlayCount);
    const nextReset = data.lastReset + RESET_INTERVAL_MS;
    setFreePlaysCountdown(nextReset - Date.now());
  }, []);

  // Update free play countdown every second
  useEffect(() => {
    const interval = setInterval(() => {
      const data = getGameData();
      const nextReset = data.lastReset + RESET_INTERVAL_MS;
      setFreePlaysCountdown(Math.max(0, nextReset - Date.now()));
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Game dimensions state
  const [dimensions, setDimensions] = useState({
    width: window.innerWidth,
    height: window.innerHeight,
  });
  useEffect(() => {
    const handleResize = () =>
      setDimensions({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Refs and state for game elements
  const gameAreaRef = useRef<HTMLDivElement>(null);
  const playerRef = useRef<HTMLDivElement>(null);
  const playerPosRef = useRef({
    x: dimensions.width / 2 - 25,
    y: dimensions.height / 2 - 25,
  });
  const draggingRef = useRef(false);

  const [obstacles, setObstacles] = useState<any[]>([]);
  const obstaclesRef = useRef<any[]>([]);
  const [coins, setCoins] = useState<any[]>([]);
  const coinsRef = useRef<any[]>([]);

  const [speed, setSpeed] = useState(2);
  const [gameOver, setGameOver] = useState(false);
  const [time, setTime] = useState(0);
  const [coinCount, setCoinCount] = useState(0);

  const speedRef = useRef(speed);
  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const randomColor = () => {
    const color = Math.floor(Math.random() * 16777215).toString(16);
    return '#' + ('000000' + color).slice(-6);
  };

  const updatePlayer = (x: number, y: number) => {
    playerPosRef.current = { x, y };
    if (playerRef.current) {
      playerRef.current.style.transform = `translate(${x}px, ${y}px)`;
    }
  };

  const handlePointerDown = (e: React.PointerEvent) => {
    draggingRef.current = true;
    updatePlayer(e.clientX - 25, e.clientY - 25);
  };

  const handlePointerMove = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    updatePlayer(e.clientX - 25, e.clientY - 25);
  };

  const handlePointerUp = () => {
    draggingRef.current = false;
  };

  const generateObstacles = () => {
    if (Math.random() > 0.98) {
      const newObstacle = {
        x: Math.random() * (dimensions.width - 50),
        y: -50,
        size: 90,
        variant: Math.floor(Math.random() * 4) + 1,
      };
      obstaclesRef.current = [...obstaclesRef.current, newObstacle];
      setObstacles(obstaclesRef.current);
    }
  };

  const generateCoins = () => {
    if (Math.random() > 0.97) {
      const newCoin = {
        x: Math.random() * (dimensions.width - 30),
        y: -50,
        size: 30,
        variant: Math.floor(Math.random() * 3) + 1,
        shadow: `0 0 5px ${randomColor()}`
      };
      coinsRef.current = [...coinsRef.current, newCoin];
      setCoins(coinsRef.current);
    }
  };

  const moveObstacles = () => {
    obstaclesRef.current = obstaclesRef.current
      .map(obstacle => ({ ...obstacle, y: obstacle.y + speedRef.current }))
      .filter(obstacle => obstacle.y < dimensions.height);
    setObstacles(obstaclesRef.current);
  };

  const moveCoins = () => {
    coinsRef.current = coinsRef.current
      .map(coin => ({ ...coin, y: coin.y + speedRef.current }))
      .filter(coin => coin.y < dimensions.height);
    setCoins(coinsRef.current);
  };

  const getObstacleImage = (variant: number) => {
    switch (variant) {
      case 1: return '/Picture/obstacles-1.png';
      case 2: return '/Picture/obstacles-2.png';
      case 3: return '/Picture/obstacles-3.png';
      case 4: return '/Picture/obstacles-4.png';
      default: return '/Picture/obstacles-5.png';
    }
  };

  const getCoinImage = (variant: number) => {
    return './semzlogo.png';
  };

  const checkCollisions = () => {
    const { x, y } = playerPosRef.current;
    for (const obstacle of obstaclesRef.current) {
      const dx = (x + 25) - (obstacle.x + obstacle.size / 2);
      const dy = (y + 25) - (obstacle.y + obstacle.size / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < obstacle.size / 2 + 25) {
        setGameOver(true);
        return;
      }
    }
    coinsRef.current = coinsRef.current.filter(coin => {
      const dx = (x + 25) - (coin.x + coin.size / 2);
      const dy = (y + 25) - (coin.y + coin.size / 2);
      const distance = Math.sqrt(dx * dx + dy * dy);
      if (distance < coin.size / 2 + 25) {
        setCoinCount(prev => prev + 1);
        return false;
      }
      return true;
    });
    setCoins(coinsRef.current);
  };

  useEffect(() => {
    if (!gameStarted || gameOver) return;
    let animationFrameId: number;
    const gameLoop = () => {
      generateObstacles();
      moveObstacles();
      generateCoins();
      moveCoins();
      checkCollisions();
      animationFrameId = requestAnimationFrame(gameLoop);
    };
    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, [gameStarted, gameOver, dimensions]);

  useEffect(() => {
    if (gameOver) return;
    const speedIncrease = setInterval(() => {
      setSpeed(prev => prev + 0.2);
    }, 5000);
    return () => clearInterval(speedIncrease);
  }, [gameOver]);

  useEffect(() => {
    if (gameOver) return;
    const timer = setInterval(() => {
      setTime(prev => prev + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, [gameOver]);

  // Styles for start and game over screens
  const screenContainerStyle: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    height: '100vh',
    color: '#fff',
    fontFamily: 'Arial, sans-serif',
    textAlign: 'center',
    padding: '20px'
  };

  const buttonStyle: React.CSSProperties = {
    padding: '12px 24px',
    fontSize: '18px',
    background: '#1e51db',
    border: 'none',
    borderRadius: '8px',
    cursor: 'pointer',
    margin: '20px',
    color: '#fff',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)'
  };

  const infoStyle: React.CSSProperties = {
    fontSize: '18px',
    margin: '10px'
  };

  const gameTimeFormatted = formatTime(time * 1000);

  // Function to handle starting a new game (or replay)
  const startGame = async () => {
    const data = getGameData();

    if(userData && userData.balance){
      return
    }

    let cost = 0;
    if (data.dailyPlayCount >= FREE_PLAY_LIMIT) {
      cost = (data.dailyPlayCount - (FREE_PLAY_LIMIT - 1)) * 10000;
    }
    {/* @ts-expect-error: Property 'count' might ndot exist ddon 'userData?.users' */}
    if (cost > 0 && userData?.balance < cost) {
      alert("You don't have enough SEMZ tokens to play again.");
      return;
    }
    if (cost > 0) {
      {/* @ts-expect-error: Property 'count' migddht not exist ddon 'userData?.users' */}
      const updateDataBalance = parseInt(userData.balance) - cost;
      
      const { error: updateError } = await supabase
        .from("users")
        .update({ balance: updateDataBalance })
        /* @ts-expect-error: Property 'count' might not exist ddon 'userData?.users' */
        .eq("id", userData.id)
        .single();
      if (updateError) {
        console.error("Error updating balance:", updateError);
        return;
      }
      setUserData(prev => (prev ? { ...prev, balance: updateDataBalance } : prev));
    }
    const newDailyPlayCount = data.dailyPlayCount + 1;
    const newGameData = { lastReset: data.lastReset, dailyPlayCount: newDailyPlayCount };
    localStorage.setItem("gameData", JSON.stringify(newGameData));
    setDailyPlayCount(newDailyPlayCount);

    setGameOver(false);
    setTime(0);
    setCoinCount(0);
    obstaclesRef.current = [];
    coinsRef.current = [];
    setObstacles([]);
    setCoins([]);
    setSpeed(2);
    updatePlayer(dimensions.width / 2 - 25, dimensions.height / 2 - 25);
    setGameStarted(true);
  };

  if (!gameStarted || gameOver) {
    const freePlaysLeft = FREE_PLAY_LIMIT - dailyPlayCount > 0 ? FREE_PLAY_LIMIT - dailyPlayCount : 0;
    return (
      <div style={screenContainerStyle}>
        {gameOver && (
          <>
            <h1>Game Over!</h1>
            <p style={infoStyle}>You survived for {gameTimeFormatted}</p>
            <p style={infoStyle}>You collected {coinCount} coins.</p>
          </>
        )}
        <button onClick={startGame} style={buttonStyle}>Start Game</button>
        {dailyPlayCount < FREE_PLAY_LIMIT ? (
          <p style={infoStyle}>You have {freePlaysLeft} free play(s) remaining today.</p>
        ) : (
          <>
            <p style={infoStyle}>Next free play available in: {formatTime(freePlaysCountdown)}</p>
            <p style={infoStyle}>
              Alternatively, this play costs: {(dailyPlayCount - (FREE_PLAY_LIMIT - 1)) * 10000} SEMZ tokens.
            </p>
          </>
        )}
        <p style={infoStyle}>Games played today: {dailyPlayCount}</p>
      </div>
    );
  }

  return (
    <div>
      {/* Display Timer and Coin Count */}
      <div className='flex items-center gap-4 pt-2 pb-2' style={{ padding: '10px', background: '#222', color: '#fff' }}>
        <div className='flex items-center gap-2'>
          <Timer />
          <p style={{ margin: 0 }}>Time:</p>
          <p style={{ margin: 0 }}>{gameTimeFormatted}</p>
        </div>
        <div className='flex items-center gap-2'>
          <img
            src={'/semzlogo.png'}
            alt="coin"
            style={{
              width: "30px",
              height: "30px",
              borderRadius:"50%",
              backgroundColor: "#FFD700"
            }}
          />
          <p style={{ margin: 0 }}>Coins:</p>
          <p style={{ margin: 0 }}>{coinCount}</p>
        </div>
      </div>
      <div
        ref={gameAreaRef}
        style={{
          width: '100vw',
          height: '100vh',
          position: 'relative',
          overflow: 'hidden',
          backgroundColor: '#000',
        }}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerLeave={handlePointerUp}
      >
        {/* Player element */}
        <div
          ref={playerRef}
          style={{
            width: 75,
            height: 75,
            backgroundColor: 'transparent',
            borderRadius: '50%',
            position: 'absolute',
            transform: `translate(${playerPosRef.current.x}px, ${playerPosRef.current.y}px)`,
            transition: 'background-color 0.1s',
            backgroundImage: "url('./semz.png')",
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            backgroundRepeat: 'no-repeat',
          }}
        />
        {/* Render obstacles */}
        {obstacles.map((obstacle, index) => (
          <img
            key={index}
            src={getObstacleImage(obstacle.variant)}
            alt="obstacle"
            style={{
              width: obstacle.size,
              height: obstacle.size,
              position: 'absolute',
              left: obstacle.x,
              top: obstacle.y,
            }}
          />
        ))}
        {/* Render coins */}
        {coins.map((coin, index) => (
          <div key={index} style={{ borderRadius: "50%" }}>
            <img
              key={index}
              src={getCoinImage(coin.variant)}
              alt="coin"
              style={{
                width: coin.size,
                height: coin.size,
                position: 'absolute',
                left: coin.x,
                top: coin.y,
                borderRadius:"50%",
                boxShadow: coin.shadow,
                backgroundColor: "#FFD700"
              }}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default GamePage;
