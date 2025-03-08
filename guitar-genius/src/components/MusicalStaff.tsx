import React from 'react';

interface MusicalStaffProps {
  note: string | null;
  pitch: number | null;
}

const MusicalStaff: React.FC<MusicalStaffProps> = ({ note, pitch }) => {
  // Staff dimensions using golden ratio (φ ≈ 1.618)
  const width = 500;
  const height = 300;
  const lineSpacing = 15;
  const goldenRatio = 1.618;
  const verticalPadding = height / (2 * goldenRatio); // Top padding using golden ratio
  
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
    'G5': -5,  // First space above treble staff
    'A5': -6,  // First ledger line above treble
    'B5': -7,  // Space above first ledger line
    'C6': -8,  // Second ledger line above treble
    'D6': -9,  // Space above second ledger line
    'E6': -10  // Third ledger line above treble
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

  // Function to determine if a note needs a ledger line
  const needsLedgerLine = (note: string): boolean => {
    const baseNote = note.replace('#', '').replace('b', '');
    // Middle C and notes above treble staff
    return ['C4', 'A5', 'C6', 'E6'].includes(baseNote);
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
            x1="50"
            y1={height/2 - (2 * lineSpacing) + (i * lineSpacing)}
            x2={width - 50}
            y2={height/2 - (2 * lineSpacing) + (i * lineSpacing)}
            stroke="#fff"
            strokeWidth="1.5"
          />
        ))}

        {/* Bass Clef Staff Lines */}
        {[0, 1, 2, 3, 4].map((i) => (
          <line
            key={`bass-${i}`}
            x1="50"
            y1={height/2 + (4 * lineSpacing) + (i * lineSpacing)}
            x2={width - 50}
            y2={height/2 + (4 * lineSpacing) + (i * lineSpacing)}
            stroke="#fff"
            strokeWidth="1.5"
          />
        ))}

        {/* Treble Clef Symbol - centered on its staff */}
        <text 
          x="55" 
          y={height/2} 
          fontSize="50" 
          fontFamily="serif" 
          fill="#fff"
          dominantBaseline="middle"
        >𝄞</text>

        {/* Bass Clef Symbol - centered on its staff */}
        <text 
          x="55" 
          y={height/2 + (6 * lineSpacing) + 12} 
          fontSize="50" 
          fontFamily="serif" 
          fill="#fff"
          dominantBaseline="middle"
        >𝄢</text>

        {/* Current Note and its Ledger Lines */}
        {note && (
          <>
            {/* Ledger lines */}
            {needsLedgerLine(note) && (
              <>
                {/* Middle C ledger line */}
                {note === 'C4' && (
                  <line
                    x1={width/2 - 20}
                    y1={height/2 + (3 * lineSpacing)}
                    x2={width/2 + 20}
                    y2={height/2 + (3 * lineSpacing)}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                )}
                {/* High A ledger line */}
                {note === 'A5' && (
                  <line
                    x1={width/2 - 20}
                    y1={height/2 - (5 * lineSpacing)}
                    x2={width/2 + 20}
                    y2={height/2 - (5 * lineSpacing)}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                )}
                {/* High C ledger line */}
                {note === 'C6' && (
                  <line
                    x1={width/2 - 20}
                    y1={height/2 - (6 * lineSpacing)}
                    x2={width/2 + 20}
                    y2={height/2 - (6 * lineSpacing)}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                )}
                {/* High E ledger line */}
                {note === 'E6' && (
                  <line
                    x1={width/2 - 20}
                    y1={height/2 - (7 * lineSpacing)}
                    x2={width/2 + 20}
                    y2={height/2 - (7 * lineSpacing)}
                    stroke="#fff"
                    strokeWidth="1.5"
                  />
                )}
              </>
            )}
            {/* Note head */}
            <circle
              cx={width/2}
              cy={getYPosition(note)}
              r={lineSpacing/1.5}
              fill="#ff3366"
            />
            {/* Note name */}
            <text
              x={width/2 + 40}
              y={getYPosition(note) + 7}
              fontSize="20"
              fill="#fff"
            >
              {note}
            </text>
          </>
        )}

        {/* Middle C ledger line with glow */}
        <line
          x1={width/2 - 20}
          y1={height/2 + (3 * lineSpacing)}
          x2={width/2 + 20}
          y2={height/2 + (3 * lineSpacing)}
          stroke="#fff"
          strokeWidth="1.5"
          filter="url(#staff-glow)"
        />
      </svg>
    </div>
  );
};

export default MusicalStaff; 