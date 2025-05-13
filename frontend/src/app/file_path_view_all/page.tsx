"use client"

import { useEffect, useState, useRef } from "react"
import { API_HOST_BASE_URL } from "@/lib/constants"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, Trash2, FileAudio, Calendar, Play, Pause, Volume2 } from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Slider } from "@/components/ui/slider"
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/AuthContext"

type AudioRecord = {
  track_id: number
  user_id: number
  audio_name: string
  created_at: string
  file_path: string
}

export default function ViewFilePaths() {
  const [audioData, setAudioData] = useState<AudioRecord[]>([])
  const [searchTerm, setSearchTerm] = useState("")
  const [selectedTrackId, setSelectedTrackId] = useState<number | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [currentlyPlaying, setCurrentlyPlaying] = useState<number | null>(null)
  const [isPlaying, setIsPlaying] = useState(false)
  const [volume, setVolume] = useState(0.7)
  const [duration, setDuration] = useState(0)
  const [currentTime, setCurrentTime] = useState(0)

  const tableRef = useRef<HTMLDivElement | null>(null)
  const deleteButtonRef = useRef<HTMLButtonElement | null>(null)
  const audioRef = useRef<HTMLAudioElement | null>(null)
  const animationRef = useRef<number | null>(null)
  const { logout } = useAuth()
  const router = useRouter()

  useEffect(() => {
    const fetchAudio = async () => {
      setIsLoading(true)
      try {
        const token = localStorage.getItem("accessToken")
        if (!token) {
          logout() // Clear context and token
          router.push("/sign_in_sign_up/sign-in") // Redirect to sign-in
          return
        }

        const res = await fetch(`${API_HOST_BASE_URL}/auth/audio/get_audios`, {
          headers: {
            token: token,
          },
        })
        if (!res.ok) {
          logout() // Clear context and token
          router.push("/sign_in_sign_up/sign-in") // Redirect to sign-in
          return
        }

        const data = await res.json()
        setAudioData(data)
      } catch (err) {
        console.error("Error fetching audio data:", err)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAudio()
  }, [])

  const filteredData = audioData.filter((audio) => audio.audio_name.toLowerCase().includes(searchTerm.toLowerCase()))

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Node

      if (
        tableRef.current &&
        !tableRef.current.contains(target) &&
        deleteButtonRef.current &&
        !deleteButtonRef.current.contains(target)
      ) {
        setSelectedTrackId(null)
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const handleDelete = async () => {
    if (!selectedTrackId) return

    const confirmed = window.confirm("Are you sure you want to delete this audio?")
    if (!confirmed) return

    try {
      const token = localStorage.getItem("accessToken")
      if (!token) {
        console.error("No token found")
        return
      }

      const res = await fetch(`${API_HOST_BASE_URL}/auth/audio/delete/${selectedTrackId}`, {
        method: "DELETE",
        headers: {
          token: token,
        },
      })

      const msg = await res.text()
      if (!res.ok) throw new Error(msg || "Failed to delete")

      setAudioData((prev) => prev.filter((audio) => audio.track_id !== selectedTrackId))
      setSelectedTrackId(null)

      alert(msg)
    } catch (err: any) {
      alert("Error: " + (err.message || "Unknown error deleting audio"))
      console.error("Delete failed:", err)
    }
  }

  const formatDate = (dateString: string | Date) => {
    if (!dateString || dateString === "None") return "No Date Available"

    try {
      // If it's an ISO timestamp (like 2025-05-12T00:43:31.538689+00:00)
      if (typeof dateString === "string" && dateString.includes("T")) {
        const date = new Date(dateString)

        // Check if the date is valid
        if (!isNaN(date.getTime())) {
          // Get today and yesterday for relative time
          const today = new Date()
          today.setHours(0, 0, 0, 0)

          const yesterday = new Date(today)
          yesterday.setDate(yesterday.getDate() - 1)

          const fileDate = new Date(date)
          fileDate.setHours(0, 0, 0, 0)

          // Format the time part
          const timeStr = date.toLocaleTimeString("en-US", {
            hour: "numeric",
            minute: "2-digit",
            hour12: true,
          })

          // Check if it's today or yesterday
          if (fileDate.getTime() === today.getTime()) {
            return `Today at ${timeStr}`
          } else if (fileDate.getTime() === yesterday.getTime()) {
            return `Yesterday at ${timeStr}`
          } else {
            // Format date for older files
            return date.toLocaleDateString("en-US", {
              month: "short",
              day: "numeric",
              year: "numeric",
              hour: "numeric",
              minute: "2-digit",
              hour12: true,
            })
          }
        }
      }

      // If it's just a time string (HH:MM:SS)
      const timeOnlyRegex = /^(\d{1,2}):(\d{1,2}):(\d{1,2})$/
      const timeMatch = typeof dateString === "string" ? dateString.match(timeOnlyRegex) : null

      if (timeMatch) {
        const [_, hours, minutes, seconds] = timeMatch
        return `Today at ${Number.parseInt(hours)}:${minutes.padStart(2, "0")} ${Number.parseInt(hours) >= 12 ? "PM" : "AM"}`
      }

      // If the input is already a Date object or can be parsed as a standard date
      const date = typeof dateString === "string" ? new Date(dateString) : dateString

      // Check if the date is valid
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString("en-US", {
          month: "short",
          day: "numeric",
          year: "numeric",
          hour: "numeric",
          minute: "2-digit",
          hour12: true,
        })
      }

      // If parsing fails, return the original string
      return dateString.toString()
    } catch (error) {
      // If any error occurs during parsing, return the original string
      return dateString.toString()
    }
  }

  const formatTime = (time: number) => {
    if (isNaN(time)) return "0:00"

    const minutes = Math.floor(time / 60)
    const seconds = Math.floor(time % 60)
    return `${minutes}:${seconds.toString().padStart(2, "0")}`
  }

  const playAudio = (trackId: number, filePath: string) => {
    // Stop current audio if playing
    if (audioRef.current) {
      audioRef.current.pause()
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
        animationRef.current = null
      }
    }

    // If clicking on the same track, toggle play/pause
    if (currentlyPlaying === trackId) {
      setCurrentlyPlaying(null)
      setIsPlaying(false)
      return
    }

    // Get token for authentication
    const token = localStorage.getItem("accessToken")
    if (!token) {
      alert("Authentication required")
      return
    }

    // Create new audio element
    const audio = new Audio()

    // Set up headers for fetch request
    const headers = new Headers()
    headers.append("token", token)

    // Fetch the audio file first to handle authentication properly
    fetch(`${API_HOST_BASE_URL}/auth/download-audio/${trackId}`, {
      headers: headers,
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! Status: ${response.status}`)
        }
        return response.blob()
      })
      .then((blob) => {
        // Create object URL from blob
        const audioUrl = URL.createObjectURL(blob)
        audio.src = audioUrl
        audio.volume = volume

        audio.onloadedmetadata = () => {
          setDuration(audio.duration)
        }

        audio.onended = () => {
          setIsPlaying(false)
          setCurrentlyPlaying(null)
          setCurrentTime(0)
          if (animationRef.current) {
            cancelAnimationFrame(animationRef.current)
            animationRef.current = null
          }
          // Clean up the object URL when done
          URL.revokeObjectURL(audioUrl)
        }

        return audio.play()
      })
      .then(() => {
        audioRef.current = audio
        setCurrentlyPlaying(trackId)
        setIsPlaying(true)

        // Start the progress animation
        const updateProgress = () => {
          setCurrentTime(audio.currentTime)
          animationRef.current = requestAnimationFrame(updateProgress)
        }

        animationRef.current = requestAnimationFrame(updateProgress)
      })
      .catch((err) => {
        console.error("Error playing audio:", err)
        alert("Could not play audio file. Please try again.")
      })
  }

  const handleVolumeChange = (value: number[]) => {
    const newVolume = value[0]
    setVolume(newVolume)
    if (audioRef.current) {
      audioRef.current.volume = newVolume
    }
  }

  const handleProgressChange = (value: number[]) => {
    const newTime = value[0]
    setCurrentTime(newTime)
    if (audioRef.current) {
      audioRef.current.currentTime = newTime
    }
  }

  const togglePlayPause = () => {
    if (audioRef.current) {
      if (isPlaying) {
        audioRef.current.pause()
        if (animationRef.current) {
          cancelAnimationFrame(animationRef.current)
          animationRef.current = null
        }
      } else {
        audioRef.current.play()
        const updateProgress = () => {
          setCurrentTime(audioRef.current!.currentTime)
          animationRef.current = requestAnimationFrame(updateProgress)
        }
        animationRef.current = requestAnimationFrame(updateProgress)
      }
      setIsPlaying(!isPlaying)
    }
  }

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause()
      }
      if (animationRef.current) {
        cancelAnimationFrame(animationRef.current)
      }
    }
  }, [])

  return (
    <div className="flex items-center justify-center min-h-screen bg-background">
      <Card className="w-full max-w-5xl shadow-xl border-border">
        <CardHeader className="bg-card border-b border-border pb-4">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
            <CardTitle className="text-2xl font-bold text-card-foreground flex items-center">
              <FileAudio className="mr-2 h-6 w-6 text-primary" />
              Audio Files
            </CardTitle>

            <div className="relative w-full md:w-auto flex-1 md:max-w-sm">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search audio files..."
                className="pl-10 bg-input border-border text-foreground placeholder:text-muted-foreground w-full focus-visible:ring-primary"
              />
            </div>
          </div>
        </CardHeader>

        <CardContent className="p-0">
          <div className="p-4">
            <div className="flex justify-between items-center mb-4">
              <div className="text-sm text-muted-foreground">
                {filteredData.length} {filteredData.length === 1 ? "file" : "files"} found
              </div>

              {selectedTrackId !== null && (
                <Button ref={deleteButtonRef} onClick={handleDelete} variant="destructive" size="sm" className="gap-1">
                  <Trash2 className="h-4 w-4" />
                  Delete Selected
                </Button>
              )}
            </div>

            <div ref={tableRef} className="rounded-md border border-border overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted hover:bg-muted">
                    <TableHead className="text-muted-foreground font-medium w-10"></TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      <div className="flex items-center gap-2">
                        <FileAudio className="h-4 w-4 text-primary" />
                        File Name
                      </div>
                    </TableHead>
                    <TableHead className="text-muted-foreground font-medium">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4 text-primary" />
                        Created
                      </div>
                    </TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {isLoading ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        Loading audio files...
                      </TableCell>
                    </TableRow>
                  ) : filteredData.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={4} className="h-24 text-center text-muted-foreground">
                        No audio files found
                      </TableCell>
                    </TableRow>
                  ) : (
                    <AnimatePresence>
                      {filteredData.map((audio) => (
                        <motion.tr
                          key={audio.track_id}
                          layout
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          onClick={() => setSelectedTrackId(audio.track_id)}
                          className={`cursor-pointer transition-colors ${
                            selectedTrackId === audio.track_id ? "bg-primary/10 hover:bg-primary/20" : "hover:bg-muted"
                          }`}
                        >
                          <TableCell className="w-10">
                            <TooltipProvider>
                              <Tooltip>
                                <TooltipTrigger asChild>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-foreground hover:text-primary"
                                    onClick={(e) => {
                                      e.stopPropagation()
                                      playAudio(audio.track_id, audio.file_path)
                                    }}
                                  >
                                    {currentlyPlaying === audio.track_id ? (
                                      <Pause className="h-4 w-4" />
                                    ) : (
                                      <Play className="h-4 w-4" />
                                    )}
                                  </Button>
                                </TooltipTrigger>
                                <TooltipContent>
                                  {currentlyPlaying === audio.track_id ? "Pause" : "Play"} audio
                                </TooltipContent>
                              </Tooltip>
                            </TooltipProvider>
                          </TableCell>
                          <TableCell>
                            <div className="font-medium text-foreground">{audio.audio_name}</div>
                          </TableCell>
                          <TableCell>
                            <Badge variant="outline" className="bg-muted text-foreground border-border">
                              {formatDate(audio.created_at)}
                            </Badge>
                          </TableCell>
                        </motion.tr>
                      ))}
                    </AnimatePresence>
                  )}
                </TableBody>
              </Table>
            </div>

            {/* Audio Player Controls */}
            {currentlyPlaying !== null && (
              <div className="mt-4 p-4 border border-border rounded-md bg-card">
                <div className="flex items-center gap-4">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={togglePlayPause}
                    className="text-foreground hover:text-primary"
                  >
                    {isPlaying ? <Pause className="h-5 w-5" /> : <Play className="h-5 w-5" />}
                  </Button>

                  <div className="flex-1">
                    <div className="flex justify-between text-xs text-muted-foreground mb-1">
                      <span>{formatTime(currentTime)}</span>
                      <span>{formatTime(duration)}</span>
                    </div>
                    <Slider
                      value={[currentTime]}
                      max={duration || 100}
                      step={0.1}
                      onValueChange={handleProgressChange}
                      className="w-full"
                    />
                  </div>

                  <div className="flex items-center gap-2 w-32">
                    <Volume2 className="h-4 w-4 text-muted-foreground" />
                    <Slider
                      value={[volume]}
                      max={1}
                      step={0.01}
                      onValueChange={handleVolumeChange}
                      className="w-full"
                    />
                  </div>
                </div>
                <div className="mt-2 text-sm text-muted-foreground">
                  Now playing: {audioData.find((a) => a.track_id === currentlyPlaying)?.audio_name}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
