import React, { useEffect, useState } from 'react';
import { PitchDetector } from 'pitchy';

const App: React.FC = () => {
  const [pitch, setPitch] = useState<number | null>(null);
  const [note, setNote] = useState<string>('');
  const [isListening, setIsListening] = useState(false);

  const noteFromPitch = (frequency: number) => {
    const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"];
    const noteNum = 12 * (Math.log2(frequency / 440) + 4);
    return noteStrings[Math.round(noteNum) % 12];
  };

  const startListening = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const audioContext = new AudioContext();
      const source = audioContext.createMediaStreamSource(stream);
      const analyser = audioContext.createAnalyser();
      const detector = PitchDetector.forFloat32Array(analyser.fftSize);
      const input = new Float32Array(detector.inputLength);

      source.connect(analyser);
      setIsListening(true);

      const detectPitch = () => {
        analyser.getFloatTimeDomainData(input);
        const [pitch, clarity] = detector.findPitch(input, audioContext.sampleRate);

        if (clarity > 0.8 && pitch > 0) {
          setPitch(Math.round(pitch));
          setNote(noteFromPitch(pitch));
        }

        if (isListening) {
          requestAnimationFrame(detectPitch);
        }
      };

      requestAnimationFrame(detectPitch);
    } catch (error) {
      console.error('Error accessing microphone:', error);
    }
  };

  const stopListening = () => {
    setIsListening(false);
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Guitar Genius</h1>
      <div style={styles.content}>
        {pitch && <h2 style={styles.pitch}>Frequency: {pitch.toFixed(1)} Hz</h2>}
        {note && <h2 style={styles.note}>Note: {note}</h2>}
        <button
          style={isListening ? styles.stopButton : styles.startButton}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
      </div>
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    minHeight: '100vh',
    backgroundColor: '#1a1a1a',
    color: '#ffffff',
    padding: '20px',
  },
  title: {
    fontSize: '2.5rem',
    marginBottom: '2rem',
    color: '#4CAF50',
  },
  content: {
    display: 'flex',
    flexDirection: 'column' as const,
    alignItems: 'center',
    gap: '1rem',
    padding: '2rem',
    backgroundColor: '#2d2d2d',
    borderRadius: '10px',
    boxShadow: '0 4px 6px rgba(0, 0, 0, 0.1)',
  },
  pitch: {
    fontSize: '1.5rem',
    margin: '0.5rem 0',
  },
  note: {
    fontSize: '2rem',
    margin: '0.5rem 0',
    color: '#4CAF50',
  },
  startButton: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    backgroundColor: '#4CAF50',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
  stopButton: {
    padding: '1rem 2rem',
    fontSize: '1.2rem',
    backgroundColor: '#f44336',
    color: 'white',
    border: 'none',
    borderRadius: '5px',
    cursor: 'pointer',
    transition: 'background-color 0.3s',
  },
};

export default App; 