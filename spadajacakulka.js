import React, { useState, useEffect } from "react";

const VerticalDrop = () => {
  const [position, setPosition] = useState(0); // Pozycja kulki (odległość od góry)
  const [moving, setMoving] = useState(false); // Czy kulka się porusza
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

  // Animacja ruchu kulki
  useEffect(() => {
    let animationFrame;

    const moveBall = () => {
      if (moving) {
        setPosition((prev) => Math.min(prev + ballSpeed, wallHeight)); // Aktualizujemy pozycję
      }
      animationFrame = requestAnimationFrame(moveBall);
    };

    moveBall();

    return () => cancelAnimationFrame(animationFrame);
  }, [moving]);

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
      <h2>Spadająca Kulka</h2>
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
         <b>Spacja</b> aby kulka spadała.
      </p>
      <p>
        Procent obstawianych żetonów: <b>{percentage}%</b>
      </p>
    </div>
  );
};

export default VerticalDrop;
