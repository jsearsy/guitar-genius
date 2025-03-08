import React from 'react';

interface MusicalStaffProps {
  note: string | null;
  pitch: number | null;
}

const MusicalStaff: React.FC<MusicalStaffProps> = ({ note, pitch }) => {
  // Staff dimensions
  const width = 300;
  const height = 300;
  const lineSpacing = 10; // Standard spacing between staff lines
  
  // Note positions based on traditional staff lines and spaces
  const notePositions: { [key: string]: number } = {
    // Bass clef (bottom to top)
    'G2': 16,  // Bottom line
    'A2': 15,  // First space
    'B2': 14,  // Second line
    'C3': 13,  // Second space
    'D3': 12,  // Third line
    'E3': 11,  // Third space
    'F3': 10,  // Fourth line
    'G3': 9,   // Fourth space
    'A3': 8,   // Fifth line
    // Middle section
    'B3': 7,   // Space above bass staff
    'C4': 6,   // Middle C (first ledger line)
    'D4': 5,   // Space above middle C
    'E4': 4,   // Bottom line treble staff
    'F4': 3,   // First space
    'G4': 2,   // Second line
    'A4': 1,   // Second space
    'B4': 0,   // Third line
    'C5': -1,  // Third space
    'D5': -2,  // Fourth line
    'E5': -3,  // Fourth space
    'F5': -4,  // Fifth line
    'G5': -5   // Space above treble staff
  };

  const getAccidental = (note: string): string => {
    return note.includes('#') ? '♯' : note.includes('b') ? '♭' : '';
  };

  const getNotePosition = (note: string): number => {
    // Remove accidental and get base note with octave
    const baseNote = note.replace('#', '').replace('b', '');
    return notePositions[baseNote] || 0;
  };

  // Calculate vertical position for a note
  const getYPosition = (note: string): number => {
    const pos = getNotePosition(note);
    const centerY = height/2;
    return centerY + pos * (lineSpacing/2);
  };

  return (
    <div style={{ margin: '20px 0' }}>
      <svg width={width} height={height} style={{ display: 'block', margin: '0 auto' }}>
        {/* Background */}
        <rect x="0" y="0" width={width} height={height} fill="transparent" />
        
        {/* Treble Clef Staff Lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`treble-${i}`}
            x1="30"
            y1={height/2 - (2 * lineSpacing) + (i * lineSpacing)}
            x2={width - 30}
            y2={height/2 - (2 * lineSpacing) + (i * lineSpacing)}
            stroke="#fff"
            strokeWidth="1"
          />
        ))}

        {/* Bass Clef Staff Lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`bass-${i}`}
            x1="30"
            y1={height/2 + (4 * lineSpacing) + (i * lineSpacing)}
            x2={width - 30}
            y2={height/2 + (4 * lineSpacing) + (i * lineSpacing)}
            stroke="#fff"
            strokeWidth="1"
          />
        ))}

        {/* Treble Clef Symbol */}
        <text x="35" y={height/2 - (2 * lineSpacing)} fontSize="35" fontFamily="serif" fill="#fff">𝄞</text>

        {/* Bass Clef Symbol */}
        <text x="35" y={height/2 + (6 * lineSpacing)} fontSize="35" fontFamily="serif" fill="#fff">𝄢</text>

        {/* Current Note */}
        {note && (
          <>
            {/* Note head */}
            <circle
              cx={width/2}
              cy={getYPosition(note)}
              r={lineSpacing/2}
              fill="#ff3366"
            />
            {/* Note name */}
            <text
              x={width/2 + 30}
              y={getYPosition(note) + 5}
              fontSize="14"
              fill="#fff"
            >
              {note}
            </text>
          </>
        )}

        {/* Middle C ledger line */}
        <line
          x1={width/2 - 15}
          y1={height/2 + (3 * lineSpacing)}
          x2={width/2 + 15}
          y2={height/2 + (3 * lineSpacing)}
          stroke="#fff"
          strokeWidth="1"
        />
      </svg>
    </div>
  );
};

export default MusicalStaff; 