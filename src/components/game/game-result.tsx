import React, { useEffect, useState } from 'react'
import { Button } from "@/components/ui/button"
import { Play, Loader2 } from 'lucide-react'

interface GameResultProps {
  prompt: string;
  onReset: () => void;
}

interface AudioResult {
  id: string;
  status: string;
  audio_url?: string;
}

export default function GameResult({ prompt, onReset }: GameResultProps) {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [audioResults, setAudioResults] = useState<AudioResult[]>([]);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);

  const generateSong = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      // Initial API call to start generation
      const response = await fetch('/api/generate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          prompt,
          make_instrumental: false,
          wait_audio: false
        })
      });

      if (!response.ok) {
        throw new Error('Failed to generate song');
      }

      const data = await response.json();
      setAudioResults(data);

      // Poll for completion
      const interval = setInterval(async () => {
        const ids = data.map((result: AudioResult) => result.id).join(',');
        const statusResponse = await fetch(`/api/get?ids=${ids}`);
        const statusData = await statusResponse.json();

        // Update results
        setAudioResults(statusData);

        // Check if generation is complete
        if (statusData.some((result: AudioResult) => result.status === 'streaming')) {
          clearInterval(interval);
          setIsLoading(false);
        }
      }, 5000);

      // Cleanup interval after 5 minutes (maximum wait time)
      setTimeout(() => clearInterval(interval), 300000);

    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate song');
      setIsLoading(false);
    }
  };

  const playAudio = (url: string) => {
    if (audio) {
      audio.pause();
    }
    const newAudio = new Audio(url);
    newAudio.play();
    setAudio(newAudio);
  };

  // Cleanup audio on unmount
  useEffect(() => {
    return () => {
      if (audio) {
        audio.pause();
      }
    };
  }, [audio]);

  return (
    <div className="space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Generated Song</label>
        <textarea
          value={prompt}
          readOnly
          className="w-full h-48 p-4 text-sm font-mono border rounded-md bg-secondary/50"
        />
      </div>

      <div className="flex justify-between items-center">
        <Button 
          onClick={generateSong} 
          disabled={isLoading}
          className="flex items-center gap-2"
        >
          {isLoading ? (
            <>
              <Loader2 className="animate-spin" />
              Generating...
            </>
          ) : (
            <>
              <Play />
              Generate Song
            </>
          )}
        </Button>
        <Button onClick={onReset} variant="outline">
          Start New Game
        </Button>
      </div>

      {error && (
        <p className="text-sm text-red-500">
          {error}
        </p>
      )}

      {audioResults.length > 0 && !isLoading && (
        <div className="space-y-2">
          {audioResults.map((result) => (
            result.audio_url && (
              <div key={result.id} className="flex items-center gap-2">
                <Button
                  onClick={() => playAudio(result.audio_url!)}
                  variant="secondary"
                  size="sm"
                >
                  <Play className="w-4 h-4 mr-2" />
                  Play Version {audioResults.indexOf(result) + 1}
                </Button>
              </div>
            )
          ))}
        </div>
      )}
    </div>
  );
}