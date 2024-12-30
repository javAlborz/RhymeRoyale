'use client'

import { useState, useRef, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightLeft, Play, Square } from 'lucide-react'

export default function TemplateGame() {
  // State management
  const [user1Text, setUser1Text] = useState('')
  const [user2Text, setUser2Text] = useState('')
  const [user1Submitted, setUser1Submitted] = useState(false)
  const [user2Submitted, setUser2Submitted] = useState(false)
  const [result, setResult] = useState('')
  const [isUser1First, setIsUser1First] = useState(true)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [audioReady, setAudioReady] = useState(false)
  
  // Audio element reference
  const audioRef = useRef<HTMLAudioElement | null>(null)

  // Generate result automatically when both users have submitted
  useEffect(() => {
    if (user1Submitted && user2Submitted) {
      generateResult()
    }
  }, [user1Submitted, user2Submitted])

  // Event handlers
  const handleUser1Submit = () => {
    if (!user1Text.trim()) return
    setUser1Submitted(true)
    setError(null)
  }

  const handleUser2Submit = () => {
    if (!user2Text.trim()) return
    setUser2Submitted(true)
    setError(null)
  }

  const generateResult = () => {
    if (user1Submitted && user2Submitted) {
      const firstUser = isUser1First ? user1Text : user2Text
      const secondUser = isUser1First ? user2Text : user1Text
      const firstLabel = isUser1First ? "user a" : "user b"
      const secondLabel = isUser1First ? "user b" : "user a"
      
      const story = `

[First Rapper - ${firstLabel} - Aggressive, confident delivery]
${firstUser}

[Beat Break]
2 bars of instrumental

[Second Rapper - ${secondLabel} - Intense, responding with equal energy]
${secondUser}

[Closing]
Fade out with 2 bars of beat`
      setResult(story)
    }
  }

  const generateSpeech = async () => {
    if (!process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY) {
      setError('API key is not configured')
      return
    }

    setIsLoading(true)
    setError(null)
    setAudioReady(false)

    try {
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/JBFqnCBsd6RMkjVDRZzb', {
        method: 'POST',
        headers: {
          'Accept': 'audio/mpeg',
          'Content-Type': 'application/json',
          'xi-api-key': process.env.NEXT_PUBLIC_ELEVENLABS_API_KEY,
        },
        body: JSON.stringify({
          text: result,
          model_id: 'eleven_multilingual_v2',
          voice_settings: {
            stability: 0.5,
            similarity_boost: 0.5
          }
        }),
      })

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`)
      }

      const audioData = await response.arrayBuffer()
      const audioBlob = new Blob([audioData], { type: 'audio/mpeg' })
      const audioUrl = URL.createObjectURL(audioBlob)

      if (audioRef.current) {
        audioRef.current.src = audioUrl
        await audioRef.current.load()
        setAudioReady(true)
      }

    } catch (error) {
      console.error('Error generating speech:', error)
      setError(error instanceof Error ? error.message : 'Failed to generate speech')
    } finally {
      setIsLoading(false)
    }
  }

  const togglePlayback = async () => {
    if (!audioRef.current || !audioReady) return

    try {
      if (isPlaying) {
        audioRef.current.pause()
        setIsPlaying(false)
      } else {
        await audioRef.current.play()
        setIsPlaying(true)
      }
    } catch (error) {
      console.error('Playback error:', error)
      setError('Error playing audio')
      setIsPlaying(false)
    }
  }

  const switchOrder = () => {
    if (!user1Submitted && !user2Submitted) {
      setIsUser1First(prev => !prev)
    }
  }

  const resetAll = () => {
    // First, pause any playing audio
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current.removeAttribute('src')
      // Store the current src before clearing
      const currentSrc = audioRef.current.src
      if (currentSrc.startsWith('blob:')) {
        URL.revokeObjectURL(currentSrc)
      }
    }

    // Then reset all state
    setUser1Text('')
    setUser2Text('')
    setUser1Submitted(false)
    setUser2Submitted(false)
    setResult('')
    setError(null)
    setIsPlaying(false)
    setAudioReady(false)
  }

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current && audioRef.current.src) {
        const currentSrc = audioRef.current.src
        if (currentSrc.startsWith('blob:')) {
          URL.revokeObjectURL(currentSrc)
        }
      }
    }
  }, [])

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Rap Battle Generator</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {error && (
          <div className="p-4 mb-4 text-sm text-red-800 bg-red-100 rounded-lg dark:bg-red-900/50 dark:text-red-400">
            {error}
          </div>
        )}

        <div className="flex justify-center mb-4">
          <Button 
            onClick={switchOrder}
            disabled={user1Submitted || user2Submitted}
            className="flex items-center gap-2"
            variant="outline"
          >
            <ArrowRightLeft className="w-4 h-4" />
            {isUser1First ? "User A First" : "User B First"}
          </Button>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="user1" className="text-sm font-medium">
            {isUser1First ? "User A" : "User B"}
          </label>
          <div className="flex space-x-2">
            <Input
              id="user1"
              value={user1Text}
              onChange={(e) => setUser1Text(e.target.value)}
              disabled={user1Submitted}
              placeholder="Enter your 4 bars here (separate lines with / )"
            />
            <Button 
              onClick={handleUser1Submit} 
              disabled={user1Submitted || !user1Text.trim()}
            >
              Submit
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="user2" className="text-sm font-medium">
            {isUser1First ? "User B" : "User A"}
          </label>
          <div className="flex space-x-2">
            <Input
              id="user2"
              value={user2Text}
              onChange={(e) => setUser2Text(e.target.value)}
              disabled={user2Submitted}
              placeholder="Enter your 4 bars here (separate lines with / )"
            />
            <Button 
              onClick={handleUser2Submit} 
              disabled={user2Submitted || !user2Text.trim()}
            >
              Submit
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="result" className="text-sm font-medium">Generated Prompt</label>
          <textarea
            id="result"
            value={result}
            readOnly
            className="w-full h-96 p-4 text-lg font-mono border rounded-md bg-secondary/50"
          />
        </div>

        {result && (
          <div className="flex justify-center space-x-2">
            <Button 
              onClick={generateSpeech} 
              disabled={isLoading || audioReady}
            >
              {isLoading ? 'Generating...' : 'Generate Audio'}
            </Button>

            {audioReady && (
              <Button
                onClick={togglePlayback}
                variant="outline"
                className="flex items-center gap-2"
              >
                {isPlaying ? <Square className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isPlaying ? 'Stop' : 'Play'}
              </Button>
            )}
          </div>
        )}

        <audio
          ref={audioRef}
          onEnded={() => setIsPlaying(false)}
          onError={(e) => {
            // Only show error if we're expecting audio to play
            if (audioReady) {
              console.error('Audio error:', e)
              setError('Error playing audio')
              setIsPlaying(false)
              setAudioReady(false)
            }
          }}
        />
      </CardContent>
      
      <CardFooter className="flex justify-center">
        <Button 
          onClick={resetAll} 
          variant="destructive"
          className="w-32"
        >
          Reset
        </Button>
      </CardFooter>
    </Card>
  )
}