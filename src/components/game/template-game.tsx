'use client'

import { useState, useEffect } from 'react'
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { ArrowRightLeft } from 'lucide-react'

export default function TemplateGame() {
  const [user1Text, setUser1Text] = useState('')
  const [user2Text, setUser2Text] = useState('')
  const [user1Submitted, setUser1Submitted] = useState(false)
  const [user2Submitted, setUser2Submitted] = useState(false)
  const [result, setResult] = useState('')
  const [isUser1First, setIsUser1First] = useState(true)

  const handleUser1Submit = () => {
    setUser1Submitted(true)
  }

  const handleUser2Submit = () => {
    setUser2Submitted(true)
  }

  // Use useEffect to monitor submission states
  useEffect(() => {
    if (user1Submitted && user2Submitted) {
      const firstUser = isUser1First ? user1Text : user2Text
      const secondUser = isUser1First ? user2Text : user1Text
      const firstLabel = isUser1First ? "user a" : "user b"
      const secondLabel = isUser1First ? "user b" : "user a"
      
      const story = `Generate a rap battle with two distinct voices and an aggressive hip-hop beat. The battle should maintain high energy throughout.

[Instructions]
- Create a trap-style beat at 140 BPM
- First rapper performs 4 bars
- Include a 2-bar instrumental break
- Second rapper responds with 4 bars
- Match the delivery style to the emotional tone of the lyrics
- Maintain clear vocal clarity for both rappers

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
  }, [user1Submitted, user2Submitted, user1Text, user2Text, isUser1First])

  const switchOrder = () => {
    if (!user1Submitted && !user2Submitted) {
      setIsUser1First(prev => !prev)
    }
  }

  const resetAll = () => {
    setUser1Text('')
    setUser2Text('')
    setUser1Submitted(false)
    setUser2Submitted(false)
    setResult('')
  }

  return (
    <Card className="w-full max-w-2xl mx-auto mt-8">
      <CardHeader>
        <CardTitle className="text-2xl font-bold text-center">Template Story Game</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
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
            <Button onClick={handleUser1Submit} disabled={user1Submitted || !user1Text}>
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
            <Button onClick={handleUser2Submit} disabled={user2Submitted || !user2Text}>
              Submit
            </Button>
          </div>
        </div>
        
        <div className="space-y-2">
          <label htmlFor="result" className="text-sm font-medium">Final Story</label>
          <textarea
            id="result"
            value={result}
            readOnly
            className="w-full h-96 p-4 text-lg font-mono border rounded-md bg-secondary/50"
          />
        </div>
      </CardContent>
      <CardFooter className="flex justify-center">
        <Button onClick={resetAll}>Start New Game</Button>
      </CardFooter>
    </Card>
  )
}