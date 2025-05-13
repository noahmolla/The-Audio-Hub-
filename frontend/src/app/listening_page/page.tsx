"use client"

import type React from "react"

import { useAuth } from "@/context/AuthContext"
import { API_HOST_BASE_URL } from "@/lib/constants"
import { useRouter } from "next/navigation"
import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Upload, Play, Pause, Volume2, FileAudio } from "lucide-react"
import { cn } from "@/lib/utils"

export default function AudioPlayerPage() {
  const { logout } = useAuth()
  const router = useRouter()
  const [audioSrc, setAudioSrc] = useState<string | null>(null)
  const [fileName, setFileName] = useState<string | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [audioElement, setAudioElement] = useState<HTMLAudioElement | null>(null)
  const [currentTime, setCurrentTime] = useState(0)
  const [duration, setDuration] = useState(0)
  const [volume, setVolume] = useState(0.7)

  // Handle logout and redirection
  const handleLogoutAndRedirect = () => {
    try {
      // Call logout function
      logout()

      // Use setTimeout to ensure the redirect happens after state updates
      setTimeout(() => {
        router.push("/sign_in_sign_up/sign-in")
      }, 100)
    } catch (error) {
      console.error("Logout failed:", error)
      // Try to redirect anyway
      router.push("/sign_in_sign_up/sign-in")
    }
  }

  useEffect(() => {
    const checkAudioEndpoint = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          handleLogoutAndRedirect()
          return
        }

        const res = await fetch(`${API_HOST_BASE_URL}/auth/audio/get_audios`, {
          headers: {
            token: token,
          },
        })

        if (!res.ok) {
          handleLogoutAndRedirect()
          return
        }

        // Optionally parse to ensure it's valid JSON
        await res.json()
      } catch (err) {
        console.error("Error checking audio endpoint:", err)
        handleLogoutAndRedirect()
      } finally {
        setIsLoading(false)
      }
    }

    checkAudioEndpoint()
  }, [logout, router])

  useEffect(() => {
    if (audioSrc) {
      const audio = new Audio(audioSrc)
      setAudioElement(audio)

      audio.addEventListener("play", () => setIsPlaying(true))
      audio.addEventListener("pause", () => setIsPlaying(false))
      audio.addEventListener("ended", () => setIsPlaying(false))
      audio.addEventListener("timeupdate", () => setCurrentTime(audio.currentTime))
      audio.addEventListener("loadedmetadata", () => setDuration(audio.duration))
      audio.volume = volume

      return () => {
        audio.pause()
        URL.revokeObjectURL(audioSrc)
        audio.removeEventListener("play", () => setIsPlaying(true))
        audio.removeEventListener("pause", () => setIsPlaying(false))
        audio.removeEventListener("ended", () => setIsPlaying(false))
        audio.removeEventListener("timeupdate", () => setCurrentTime(audio.currentTime))
        audio.removeEventListener("loadedmetadata", () => setDuration(audio.duration))
      }
    }
  }, [audioSrc, volume])

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file && file.type.startsWith("audio/") && (file.type === "audio/mpeg" || file.type === "audio/wav")) {
      const url = URL.createObjectURL(file)
      setAudioSrc(url)
      setFileName(file.name)
    } else {
      alert("Please select a valid MP3 or WAV file.")
    }
  }

  const togglePlayPause = () => {
    if (!audioElement) return

    if (isPlaying) {
      audioElement.pause()
    } else {
      audioElement.play()
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const handleProgressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTime = Number.parseFloat(e.target.value)
    setCurrentTime(newTime)
    if (audioElement) {
      audioElement.currentTime = newTime
    }
  }

  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVolume = Number.parseFloat(e.target.value)
    setVolume(newVolume)
    if (audioElement) {
      audioElement.volume = newVolume
    }
  }

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-pulse flex flex-col items-center">
          <div className="h-12 w-12 rounded-full border-4 border-muted border-t-[#0CC0DF] animate-spin"></div>
          <p className="mt-4 text-muted-foreground">Verifying authentication...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-background p-4">
      <Card className="w-full max-w-md shadow-xl border-border">
        <CardHeader className="text-center border-b border-border bg-[#0CC0DF] rounded-t-lg">
          <CardTitle className="text-2xl font-bold flex items-center justify-center text-white">
            <FileAudio className="mr-2 h-6 w-6 text-white" />
            Audio Player
          </CardTitle>
          <CardDescription className="text-white/90">Upload and play your audio files</CardDescription>
        </CardHeader>
        <CardContent className="p-6">
          <div className="flex flex-col items-center space-y-6">
            <div className="w-full">
              <label
                htmlFor="audio-upload"
                className="group flex flex-col items-center justify-center w-full h-32 border-2 border-dashed border-muted-foreground/25 rounded-lg hover:bg-[#0CC0DF]/5 transition-all cursor-pointer"
              >
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <Upload className="w-10 h-10 mb-3 text-muted-foreground group-hover:text-[#0CC0DF] transition-colors" />
                  <p className="mb-2 text-sm text-muted-foreground">
                    <span className="font-semibold">Click to upload</span> or drag and drop
                  </p>
                  <p className="text-xs text-muted-foreground">MP3 or WAV audio files only</p>
                </div>
                <input
                  id="audio-upload"
                  type="file"
                  accept="audio/mp3,audio/wav"
                  onChange={handleFileChange}
                  className="hidden"
                />
              </label>
            </div>

            {fileName && (
              <div className="w-full px-4 py-2 bg-[#0CC0DF]/10 rounded-lg border border-[#0CC0DF]/20">
                <p className="text-sm text-foreground truncate">{fileName}</p>
              </div>
            )}

            {audioSrc && (
              <div className="w-full space-y-4">
                <div className="flex items-center justify-center">
                  <Button
                    onClick={togglePlayPause}
                    variant="outline"
                    size="icon"
                    className={cn(
                      "h-12 w-12 rounded-full border-2",
                      "border-[#0CC0DF] text-[#0CC0DF] hover:bg-[#0CC0DF]/10",
                    )}
                  >
                    {isPlaying ? <Pause className="h-6 w-6" /> : <Play className="h-6 w-6 ml-0.5" />}
                  </Button>
                </div>

                {/* Progress bar */}
                <div className="w-full space-y-1">
                  <div className="flex justify-between text-xs text-muted-foreground">
                    <span>{formatTime(currentTime)}</span>
                    <span>{formatTime(duration)}</span>
                  </div>
                  <input
                    type="range"
                    min={0}
                    max={duration || 100}
                    step={0.1}
                    value={currentTime}
                    onChange={handleProgressChange}
                    className="w-full h-2 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-[#0CC0DF] [&::-moz-range-thumb]:bg-[#0CC0DF]"
                    style={{ accentColor: "#0CC0DF" }}
                  />
                </div>

                {/* Volume control */}
                <div className="flex items-center gap-2 w-full mt-2">
                  <Volume2 className="h-4 w-4 text-muted-foreground" />
                  <input
                    type="range"
                    min={0}
                    max={1}
                    step={0.01}
                    value={volume}
                    onChange={handleVolumeChange}
                    className="w-full h-1.5 bg-muted rounded-lg appearance-none cursor-pointer [&::-webkit-slider-thumb]:bg-[#0CC0DF] [&::-moz-range-thumb]:bg-[#0CC0DF]"
                    style={{ accentColor: "#0CC0DF" }}
                  />
                </div>

                {/* Hidden audio element for browser compatibility */}
                <audio
                  controls
                  src={audioSrc}
                  className="hidden"
                  onPlay={() => setIsPlaying(true)}
                  onPause={() => setIsPlaying(false)}
                >
                  Your browser does not support the audio element.
                </audio>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
