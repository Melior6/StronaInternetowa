import React, { useState } from 'react';

// Lista elementów (np. obrazków lub tekstów) do wylosowania na sloty
const slotItems = ["🍒", "🍊", "🍋", "🍉", "🍇"]; // Możesz używać obrazków zamiast emoji

const SlotMachine = () => {
  const [slots, setSlots] = useState(["", "", ""]); // Puste sloty na początku
  const [spinning, setSpinning] = useState(false); // Stan, który określa czy maszyna kręci
  const [balance, setBalance] = useState(10); // Początkowy balans
  const [bet, setBet] = useState(1); // Początkowa stawka
  const [intervals, setIntervals] = useState([]); // Przechowujemy identyfikatory dla setInterval

  // Funkcja uruchamiająca losowanie z animacją
  const spinSlots = () => {
    if (spinning) return; // Zablokowanie kliknięć, gdy maszyna już "kręci"
    if (bet > balance) {
      alert("Nie masz wystarczającego balansu!");
      return; // Sprawdzamy, czy gracz ma wystarczający balans
    }

    setSpinning(true);
    const newIntervals = [];
    
    // Uruchamiamy animację dla każdego slotu (szybkie zmiany obrazków)
    const spinInterval = setInterval(() => {
      setSlots(prevSlots =>
        prevSlots.map(() => slotItems[Math.floor(Math.random() * slotItems.length)])
      );
    }, 100); // Zmiana co 100ms dla efektu animacji

    newIntervals.push(spinInterval);

    // Po 2 sekundach zatrzymujemy animację i pokazujemy losowy wynik
    setTimeout(() => {
      clearInterval(spinInterval); // Zatrzymanie animacji
      const newSlots = [
        slotItems[Math.floor(Math.random() * slotItems.length)],
        slotItems[Math.floor(Math.random() * slotItems.length)],
        slotItems[Math.floor(Math.random() * slotItems.length)],
      ];
      setSlots(newSlots);
      
      // Sprawdzamy, czy gracz wygrał
      const isWin = newSlots[0] === newSlots[1] && newSlots[1] === newSlots[2];
      if (isWin) {
        const winnings = bet * 2; // Przykładowe wygrane: jeśli wszystkie sloty są takie same, gracz podwaja stawkę
        setBalance(balance + winnings); // Dodajemy wygrane do balansu
        alert(`Wygrałeś! Podwajasz swoją stawkę!`);
      } else {
        setBalance(balance - bet); // Odejmujemy stawkę od balansu
        alert(`Przegrałeś!`);
      }

      setSpinning(false); // Umożliwiamy ponowne kręcenie
      // Czyszczenie ustawionych interwałów
      newIntervals.forEach(interval => clearInterval(interval));
    }, 2000); // Animacja trwa 2 sekundy

    setIntervals(newIntervals);
  };

  return (
    <div className="slot-machine">
      <h2>Balans: {balance}💰</h2>

      <div>
        <label htmlFor="bet">Wybierz stawkę: </label>
        <input
          type="number"
          id="bet"
          value={bet}
          min="1"
          max={balance}
          onChange={(e) => setBet(Math.max(1, Math.min(e.target.value, balance)))}
        />
      </div>

      <div className="slots">
        {/* Wyświetlanie trzech slotów */}
        {slots.map((slot, index) => (
          <div key={index} className="slot">
            <span>{slot}</span>
          </div>
        ))}
      </div>

      <button onClick={spinSlots} disabled={spinning}>Spin</button>
    </div>
  );
};

export default SlotMachine;
