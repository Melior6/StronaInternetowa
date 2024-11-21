import React, { useState, useEffect } from "react";

const BouncingBall = () => {
  const [position, setPosition] = useState(0); // Pozycja kulki (odległość od góry)
  const [moving, setMoving] = useState(false); // Czy kulka się porusza
  const [direction, setDirection] = useState(1); // Kierunek ruchu: 1 = w dół, -1 = w górę
  const [percentage, setPercentage] = useState(0); // Procent przebytej drogi

  const wallHeight = 400; // Wysokość ściany
  const ballSpeed = 2; // Prędkość kulki (piksele na klatkę)

  // Funkcja obsługująca klawiaturę
  const handleKeyDown = (e) => {
    if (e.code === "Space" && !moving) {
      setMoving(true); // Rozpoczynamy ruch
    }
  };

  const handleKeyUp = (e) => {
    if (e.code === "Space") {
      setMoving(false); // Zatrzymujemy ruch
    }
  };

  // Obliczenie procentu przebytej drogi
  useEffect(() => {
    if (!moving) {
      setPercentage(((position / wallHeight) * 100).toFixed(2)); // Obliczamy procent
    }
  }, [moving, position]);

  // Animacja ruchu kulki z odbijaniem
  useEffect(() => {
    let animationFrame;

    const moveBall = () => {
      if (moving) {
        setPosition((prev) => {
          const nextPosition = prev + direction * ballSpeed;

          // Odbijanie od góry lub dołu
          if (nextPosition >= wallHeight) {
            setDirection(-1); // Zmieniamy kierunek na w górę
            return wallHeight; // Kulka zostaje na dole
          } else if (nextPosition <= 0) {
            setDirection(1); // Zmieniamy kierunek na w dół
            return 0; // Kulka zostaje na górze
          }

          return nextPosition;
        });
      }

      animationFrame = requestAnimationFrame(moveBall);
    };

    moveBall();

    return () => cancelAnimationFrame(animationFrame);
  }, [moving, direction]);

  // Obsługa zdarzeń klawiatury
  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, []);

  return (
    <div style={{ textAlign: "center", margin: "20px", userSelect: "none" }}>
      <h2>Odbijająca się Kulka</h2>
      <div
        style={{
          width: "100px",
          height: `${wallHeight}px`,
          background: "lightgray",
          position: "relative",
          margin: "0 auto",
          overflow: "hidden",
          border: "1px solid black",
        }}
      >
        {/* Kulka */}
        <div
          style={{
            width: "20px",
            height: "20px",
            background: "red",
            borderRadius: "50%",
            position: "absolute",
            top: `${position}px`,
            left: "50%",
            transform: "translateX(-50%)",
          }}
        ></div>
      </div>
      <p>
        Przytrzymaj <b>Spację</b>, aby kulka się poruszała.
      </p>
      <p>
        Procent przebytej drogi: <b>{percentage}%</b>
      </p>
    </div>
  );
};

export default BouncingBall;
