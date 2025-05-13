"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { toast } from "react-toastify"

interface AudioFile {
  id: number
  title: string
  duration: number
}

interface AudioFilesListProps {
  audioFiles: AudioFile[]
}

const AudioFilesList: React.FC<AudioFilesListProps> = ({ audioFiles }) => {
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const audioRef = useRef<HTMLAudioElement | null>(null)

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
        audioRef.current = null
      }
    }
  }, [])

  const formatTime = (time: number): string => {
    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`
  }

  const playAudio = async (audioId: number) => {
    // If already playing this track, toggle play/pause
    if (currentlyPlaying === audioId) {
      if (audioRef.current) {
        if (isPlaying) {
          audioRef.current.pause()
          setIsPlaying(false)
        } else {
          audioRef.current.play()
          setIsPlaying(true)
        }
      }
      return
    }

    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
      audioRef.current = null
    }

    try {
      // Get the token for authentication
      const token = localStorage.getItem("accessToken")
      if (!token) {
        toast("Authentication required")
        return
      }

      // Create an audio element
      const audio = new Audio()

      // Set up error handling
      audio.onerror = (e) => {
        console.error("Audio error:", e)
        toast("Could not play audio file")
        setIsPlaying(false)
        setCurrentlyPlaying(null)
      }

      // Set up event listeners
      audio.onended = () => {
        setIsPlaying(false)
        setCurrentlyPlaying(null)
      }

      // Create the audio URL with the token as a query parameter
      const audioUrl = `/auth/download-audio/${audioId}?token=${encodeURIComponent(token)}`
      audio.src = audioUrl

      // Try to play the audio
      await audio.play()
      audioRef.current = audio
      setCurrentlyPlaying(audioId)
      setIsPlaying(true)
    } catch (err) {
      console.error("Error setting up audio:", err)
      toast("Could not play audio file")
    }
  }

  return (
    <div>
      {audioFiles.map((audioFile) => (
        <div key={audioFile.id}>
          <p>
            {audioFile.title} ({formatTime(audioFile.duration)})
            <button onClick={() => playAudio(audioFile.id)}>
              {currentlyPlaying === audioFile.id && isPlaying ? "Pause" : "Play"}
            </button>
          </p>
        </div>
      ))}
    </div>
  )
}

export default AudioFilesList
