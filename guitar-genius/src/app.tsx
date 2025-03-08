import { useState, useRef, useEffect } from 'react'
import { PitchDetector } from 'pitchy'
import './App.css'
import MusicalStaff from './components/MusicalStaff'

function App() {
  const [pitch, setPitch] = useState<number | null>(null)
  const [note, setNote] = useState<string>('')
  const [isListening, setIsListening] = useState(false)
  const [error, setError] = useState<string>('')
  const [debug, setDebug] = useState<string>('')
  const [visitorCount, setVisitorCount] = useState(Math.floor(Math.random() * 100000))
  const audioContextRef = useRef<AudioContext | null>(null)
  const analyserRef = useRef<AnalyserNode | null>(null)
  const streamRef = useRef<MediaStream | null>(null)
  const animationFrameRef = useRef<number | null>(null)
  const isListeningRef = useRef(false)
  const pitchBufferRef = useRef<number[]>([])
  const BUFFER_SIZE = 5

  useEffect(() => {
    // Increment visitor count randomly
    const interval = setInterval(() => {
      setVisitorCount(prev => prev + Math.floor(Math.random() * 10))
    }, 30000)
    return () => clearInterval(interval)
  }, [])

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
    setDebug('Cleaned up audio pipeline')
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
      setDebug('Starting...')

      // Check if the browser supports getUserMedia
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Your browser does not support audio input. Please try a modern browser like Chrome or Firefox.')
      }

      // First check if we have permission
      const permissionStatus = await navigator.permissions.query({ name: 'microphone' as PermissionName })
      setDebug(`Microphone permission status: ${permissionStatus.state}`)
      
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

      setDebug('Mic access granted')
      
      streamRef.current = stream
      const audioContext = new AudioContext()
      audioContextRef.current = audioContext
      
      // Check if audio context is running
      if (audioContext.state !== 'running') {
        setDebug(`Audio context state: ${audioContext.state}. Attempting to resume...`)
        await audioContext.resume()
        setDebug(`Audio context resumed. New state: ${audioContext.state}`)
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
      setDebug('Audio pipeline ready')

      let frameCount = 0
      const detectPitch = () => {
        if (!analyserRef.current || !isListeningRef.current) {
          setDebug('Stopping detection loop - ' + 
            (!analyserRef.current ? 'No analyzer' : 'Not listening'))
          return
        }
        
        analyserRef.current.getFloatTimeDomainData(input)
        const [pitchVal, clarity] = detector.findPitch(input, audioContext.sampleRate)

        frameCount++
        if (frameCount % 10 === 0) {
          setDebug(`Frame: ${frameCount}, Raw Pitch: ${pitchVal?.toFixed(1)} Hz, Clarity: ${clarity?.toFixed(2)}, Context: ${audioContext.state}`)
        }
        
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
      setDebug('Error: ' + (error as Error).message)
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
      <div className="marquee">
        <div className="marquee-content">
          🔥 WELCOME TO GUITAR GENIUS - THE MOST EXTREME PITCH DETECTION APP IN THE UNIVERSE! 🔥 
          BEST VIEWED IN NETSCAPE NAVIGATOR 4.0 OR HIGHER! 🔥 WEBMASTER: LUCIFER@HELL.COM 🔥
        </div>
      </div>
      
      <div className="skull-decoration skull-1">💀</div>
      <div className="skull-decoration skull-2">💀</div>

      <h1 className="title">Guitar Genius</h1>
      <div className="content">
        {error && <div className="error">{error}</div>}
        <div className="debug">{debug}</div>
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
      </div>

      <div className="visitor-counter">
        VISITORS: {visitorCount.toLocaleString()}
      </div>
      <div className="construction">
        {/* Construction GIF will be shown via CSS */}
      </div>
    </div>
  )
}

export default App
