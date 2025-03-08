import { useState, useRef, useEffect } from 'react'
import { PitchDetector } from 'pitchy'
import './App.css'
import MusicalStaff from './components/MusicalStaff'

function App() {
  const [pitch, setPitch] = useState<number | null>(null)
  const [note, setNote] = useState<string>('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string>('')
  const initialVisitorCount = 1234567890 + Math.floor(Math.random() * 1000000000);
  const [visitorCount, setVisitorCount] = useState(initialVisitorCount)
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isListeningRef = useRef(false)
  const pitchBufferRef = useRef<number[]>([])
  const BUFFER_SIZE = 5

  useEffect(() => {
    // Increment visitor count randomly, ensuring it stays above 1 billion
    const interval = setInterval(() => {
      setVisitorCount(prev => {
        const increment = Math.floor(Math.random() * 100000) + 50000;
        const newCount = prev + increment;
        return newCount < 1234567890 ? initialVisitorCount : newCount;
      });
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  // Format visitor count with commas
  const formatVisitorCount = (count: number) => {
    return count.toLocaleString('en-US');
  };

  const noteFromPitch = (frequency: number) => {
    const noteStrings = ["C", "C#", "D", "D#", "E", "F", "F#", "G", "G#", "A", "A#", "B"]
    const A4 = 440
    const C0 = A4 * Math.pow(2, -4.75)
    const halfStepsBelowMiddleC = Math.round(12 * Math.log2(frequency / C0))
    const octave = Math.floor(halfStepsBelowMiddleC / 12)
    const noteIndex = Math.abs(halfStepsBelowMiddleC % 12)
    return noteStrings[noteIndex] + octave
  }

  const cleanup = () => {
    isListeningRef.current = false
    pitchBufferRef.current = []
    if (animationFrameRef.current !== null) {
      cancelAnimationFrame(animationFrameRef.current)
      animationFrameRef.current = null
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop())
    }
    if (audioContextRef.current) {
      audioContextRef.current.close()
    }
    audioContextRef.current = null
    analyserRef.current = null
    streamRef.current = null
    setIsListening(false)
    setPitch(null)
    setNote('')
    setError('')
  }

  const getSmoothedPitch = (newPitch: number) => {
    const buffer = pitchBufferRef.current
    buffer.push(newPitch)
    if (buffer.length > BUFFER_SIZE) {
      buffer.shift()
    }
    return Math.round(buffer.reduce((a, b) => a + b, 0) / buffer.length)
  }

  const startListening = async () => {
    try {
      cleanup()
      setError('')

      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio input. Please try a modern browser like Chrome or Firefox.')
      }

      // First check if we have permission
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      
      console.log('Requesting microphone access...')
      const stream = await navigator.mediaDevices.getUserMedia({ 
        audio: { 
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      }).catch(err => {
        console.error('getUserMedia error:', err.name, err.message)
        throw new Error(`Microphone access failed: ${err.message}`)
      })
      
      streamRef.current = stream
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      
      // Check if audio context is running
      if (audioContext.state !== 'running') {
        await audioContext.resume()
      }
      
      const source = audioContext.createMediaStreamSource(stream)
      const analyser = audioContext.createAnalyser()
      analyserRef.current = analyser
      
      analyser.fftSize = 2048
      analyser.smoothingTimeConstant = 0.8
      analyser.minDecibels = -100
      analyser.maxDecibels = -10
      
      const detector = PitchDetector.forFloat32Array(analyser.fftSize)
      const input = new Float32Array(detector.inputLength)

      source.connect(analyser)
      isListeningRef.current = true
      setIsListening(true)

      const detectPitch = () => {
        if (!analyserRef.current || !isListeningRef.current) {
          return
        }
        
        analyserRef.current.getFloatTimeDomainData(input)
        const [pitchVal, clarity] = detector.findPitch(input, audioContext.sampleRate)
        
        if (clarity > 0.3 && pitchVal > 50 && pitchVal < 1500) {
          const smoothedPitch = getSmoothedPitch(pitchVal)
          setPitch(smoothedPitch)
          setNote(noteFromPitch(smoothedPitch))
        }

        animationFrameRef.current = requestAnimationFrame(detectPitch)
      }

      detectPitch()
    } catch (error) {
      console.error('Error accessing microphone:', error)
      setError('Error accessing microphone. Please ensure you have granted microphone permissions.')
      cleanup()
    }
  }

  const stopListening = () => {
    cleanup()
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      cleanup()
    }
  }, [])

  return (
    <div className="container">
      <div className="pentagram-pattern" />
      <div className="marquee">
        <div className="marquee-content">
          🤘 WELCOME TO GUITAR GENIUS - TRVER THAN VARG'S CHURCH ARSON COLLECTION! 🤘 
          ⚡️ NECRO AS EURONYMOUS' POLAROIDS ⚡️ 
          💀 FROSTIER THAN IMMORTAL'S CHRISTMAS PHOTOS 💀 
          🔥 MORE EVIL THAN GAAHL'S WINE CELLAR 🔥 
          ⛧ DARKER THAN DARKTHRONE'S FIRST REHEARSAL DEMO (1988) ⛧ 
          🎸 FEATURING BLAST BEATS FASTER THAN HELLHAMMER ON CAFFEINE 🎸 
          ⚔️ MORE SPIKES THAN GORGOROTH'S ENTIRE WARDROBE ⚔️ 
          🦇 KVLTER THAN A MAYHEM ALBUM RECORDED ON A POTATO 🦇 
          ⛧ AS GRIM AS ABBATH'S MAKEUP TUTORIAL ⛧ 
          🤘 PRODUCED IN A NORWEGIAN FOREST ON A 4-TRACK CASSETTE 🤘 
          💀 COMES WITH FREE DEAD'S FUNERAL PAMPHLET 💀 
          🔥 MORE CORPSEPAINT THAN A DIMMU BORGIR FAMILY REUNION 🔥 
          ⚡️ RECORDED IN ONE TAKE LIKE FILOSOFEM ⚡️ 
          🦇 FEATURING IHSAHN'S KEYBOARD PRESETS FROM 1994 🦇 
          ⛧ TRVE KVLT WEB 1.0 DESIGN BY FENRIZ ⛧ 
          🎸 USES MORE TREMOLO PICKING THAN ENTIRE SWEDISH SCENE 🎸 
          💀 APPROVED BY DEAD'S PET CROW 💀 
          🔥 MORE LEATHER AND SPIKES THAN A MARDUK COSPLAY CONTEST 🔥 
          ⚡️ COLDER THAN IMMORTAL'S MUSIC VIDEO SHOOT 🌨️ 
          🦇 GUEST APPEARANCE BY NOCTURNO CULTO'S CAT 🦇 
          ⛧ MIXED IN A CAVE BY CANDLELIGHT ⛧ 
          🎸 MASTERED ON EURONYMOUS' ORIGINAL 4-TRACK 🎸 
          �� COMES WITH AUTHENTIC NORWEGIAN FOREST DIRT 💀 
          🔥 MORE SATAN THAN DEATHCRUSH ON 8-TRACK 🔥
          ⚡️ FEATURING REAL MEDIEVAL TORTURE INSTRUMENTS AS PERCUSSION ⚡️
        </div>
      </div>
      
      <div className="skull-decoration skull-1">💀</div>
      <div className="skull-decoration skull-2">💀</div>
      <div className="skull-decoration skull-3">💀</div>
      <div className="skull-decoration skull-4">💀</div>
      <div className="skull-decoration skull-5">💀</div>
      <div className="skull-decoration skull-6">💀</div>
      <div className="skull-decoration skull-7">💀</div>
      <div className="skull-decoration skull-8">💀</div>
      <div className="skull-decoration skull-9">💀</div>

      <h1 className="title">Guitar Genius</h1>
      <div className="content">
        {error && <div className="error">{error}</div>}
        {pitch && <h2 className="pitch">Frequency: {pitch.toFixed(1)} Hz</h2>}
        {note && <h2 className="note">Note: {note}</h2>}
        <MusicalStaff note={note} pitch={pitch} />
        <button
          className={isListening ? 'stop-button' : 'start-button'}
          onClick={isListening ? stopListening : startListening}
        >
          {isListening ? 'Stop Listening' : 'Start Listening'}
        </button>
        <div className="status">
          {isListening ? '🔥 DETECTING YOUR SICK RIFFS 🔥' : '🎸 READY TO SHRED 🎸'}
        </div>
        <div className="content-pentagrams" />
      </div>

      <div className="visitor-counter">
        VISITORS: {formatVisitorCount(visitorCount)}
      </div>
      <div className="construction">
        {/* Construction GIF will be shown via CSS */}
      </div>
    </div>
  )
}

export default App
