"use client"

import { MouseEvent, useEffect, useRef, useState } from "react"
import { clsx } from "clsx"
import { motion } from "framer-motion"
import { songs } from "@/lib/data"
import { Collapse, More, Next, Pause, PauseCircle, Play, PlayCircle, Previous, Share } from "@/components/icons"
import Image from "next/image"

const containerVariants = {
 hidden: {
  opacity: 0,
  y: 20
 },
 visible: {
  opacity: 1,
  y: 0,
  transition: {
   duration: 1,
   ease: "easeInOut"
  }
 }
}

export default function Home() {
 const [currentSongIndex, setCurrentSongIndex] = useState<number>(0)
 const [isPlaying, setIsPlaying] = useState<boolean>(false)
 const [isSeeking, setIsSeeking] = useState<boolean>(false)
 const [expanded, setExpanded] = useState<boolean>(false)
 const [currentTime, setCurrentTime] = useState<number>(0)
 const [duration, setDuration] = useState<number>(0)

 const audioRef = useRef<HTMLAudioElement | null>(null)
 const seekBarRef = useRef<HTMLDivElement | null>(null)

 const currentSong = songs[currentSongIndex]

 useEffect(() => {
  if (audioRef.current) {
   audioRef.current.pause()
   audioRef.current.load()
   if (isPlaying) audioRef.current.play()
  }
 }, [currentSongIndex])

 useEffect(() => {
  const audio = audioRef.current

  if (!audio) return

  const updateTime = () => {
   if (!isSeeking) setCurrentTime(audio.currentTime)
  }

  const setAudioDuration = () => {
   setDuration(audio.duration || 0)
  }

  audio.addEventListener("timeupdate", updateTime)
  audio.addEventListener("loadedmetadata", setAudioDuration)

  return () => {
   audio.removeEventListener("timeupdate", updateTime)
   audio.removeEventListener("loadedmetadata", setAudioDuration)
  }
 }, [isSeeking])

 useEffect(() => {
  if (expanded) {
   document.body.classList.add("overflow-hidden")
  } else {
   document.body.classList.remove("overflow-hidden")
  }
 }, [expanded])

 const togglePlay = () => {
  if (audioRef.current) {
   if (audioRef.current.paused) {
    audioRef.current.play()
    setIsPlaying(true)
   } else {
    audioRef.current.pause()
    setIsPlaying(false)
   }
  }
 }

 const skipNext = () => {
  setCurrentSongIndex((i) => (i + 1) % songs.length)
  setIsPlaying(true)
 }

 const skipPrev = () => {
  setCurrentSongIndex((i) => (i - 1 + songs.length) % songs.length)
  setIsPlaying(true)
 }

 const handleTimeUpdate = () => {
  if (audioRef.current) {
   setCurrentTime(audioRef.current.currentTime)
  }
 }

 const handleLoadedMetadata = () => {
  if (audioRef.current) {
   setDuration(audioRef.current.duration)
  }
 }

 const handleSeek = (e: MouseEvent<HTMLDivElement>) => {
  const bar = seekBarRef.current
  const audio = audioRef.current

  if (!bar || !audio) return

  const rect = bar.getBoundingClientRect()
  const offsetX = e.clientX - rect.left
  const percent = Math.min(Math.max(offsetX / rect.width, 0), 1)

  const newTime = percent * duration

  setCurrentTime(newTime)
  audio.currentTime = newTime
 }

 const shareApp = () => {
  navigator.clipboard.writeText(window.location.href)
  alert("URL copied to clipboard")
 }

 const formatTime = (seconds: number): string => {
  const mins = Math.floor(seconds / 60)
   .toString()
   .padStart(1, "0")
  const secs = Math.floor(seconds % 60)
   .toString()
   .padStart(2, "0")
  return `${mins}:${secs}`
 }

 return (
  <main className="min-h-screen flex flex-col">
   <motion.ul
    initial="hidden"
    animate="visible"
    variants={containerVariants}
    className="flex-1 overflow-y-auto py-1 pb-20"
   >
    {songs.map((song, i) => (
     <li
      key={song.id}
      onClick={() => {
       setCurrentSongIndex(i)
       setIsPlaying(true)
      }}
      className="flex items-center gap-2 cursor-pointer p-1.5"
     >
      <Image
       src={song.image}
       alt={song.title}
       width={55}
       height={55}
       className="rounded"
      />
      <div className="flex flex-col flex-1">
       <h2
        className={clsx(
         "text-lg font-medium line-clamp-1",
         i === currentSongIndex ? "text-green-600" : "text-slate-50"
        )}
       >
        {song.title}
       </h2>
       <h3 className="text-slate-300 line-clamp-1">
        {song.artist}
       </h3>
      </div>
      <button aria-label="More" className="text-slate-50 p-2 rounded-full transition cursor-pointer">
       <More />
      </button>
     </li>
    ))}
   </motion.ul>
   <div
    style={{ backgroundImage: `url(${currentSong.image})`, backgroundSize: "cover", backgroundPosition: "center" }}
    className={clsx(
     "fixed bottom-0 left-0 right-0 transition-all duration-300",
     expanded ? "h-full" : "h-18 cursor-pointer"
    )}
   >
    <div className="backdrop-blur-xs w-full h-full" style={{ background: "linear-gradient(rgba(69, 71, 85, 0.71) 0%, rgba(28, 28, 31, 0.824) 100%)" }}>
     {expanded ? (
      <div className="flex flex-col justify-between h-full max-w-5xl mx-auto p-4">
       <div className="flex flex-col text-center">
        <h4 className="text-slate-300 font-light uppercase">Playing from album</h4>
        <h3 className="text-slate-50 text-lg font-medium">{currentSong.album}</h3>
       </div>
       <Image
        src={currentSong.image}
        alt={currentSong.title}
        width={325}
        height={325}
        className={clsx(
         "rounded-full border-4 border-white/70 object-cover mx-auto",
         { "animate-spin-slow": isPlaying }
        )}
       />
       <div className="flex flex-col">
        <h1 className="text-slate-50 font-medium text-xl text-start line-clamp-1">{currentSong.title}</h1>
        <h2 className="text-slate-50/60 text-lg line-clamp-1">{currentSong.artist}</h2>
       </div>
       <div className="flex flex-col gap-2 w-full">
        <div
         ref={seekBarRef}
         className="relative h-1 bg-white/15 rounded-full cursor-pointer"
         onMouseDown={(e) => {
          setIsSeeking(true)
          handleSeek(e)
         }}
         onMouseMove={(e) => {
          if (isSeeking) handleSeek(e)
         }}
        onMouseUp={() => {
         setIsSeeking(false)
        }}
        onMouseLeave={() => {
         if (isSeeking) setIsSeeking(false)
        }}
        >
         <div className="absolute top-0 left-0 h-full bg-slate-50 rounded-full" style={{ width: `${(currentTime / duration) * 100 || 0}%` }} />
         <div className="absolute top-1/2 transform -translate-y-1/2 w-4 h-4 bg-slate-50 rounded-full shadow-md" style={{ left: `calc(${(currentTime / duration) * 100 || 0}% - 0.5rem)` }} />
        </div>
        <div className="flex items-center justify-between">
         <span className="text-slate-50 text-sm">{formatTime(currentTime)}</span>
         <span className="text-slate-50 text-sm">{formatTime(duration)}</span>
        </div>
       </div>
       <div className="flex items-center justify-center gap-6">
        <button
         onClick={skipPrev}
         aria-label="Previous song"
         className="text-slate-50 p-1 rounded-full cursor-pointer"
        >
         <Previous className="w-14 h-14" />
        </button>
        <button
         onClick={togglePlay}
         aria-label="Toggle play"
         className="text-slate-50 rounded-full cursor-pointer hover:text-slate-200"
        >
         {isPlaying ? <PauseCircle className="w-22 h-22" /> : <PlayCircle className="w-22 h-22" />}
        </button>
        <button
         onClick={skipNext}
         aria-label="Next song"
         className="text-slate-50 p-1 rounded-full cursor-pointer"
        >
         <Next className="w-14 h-14" />
        </button>
       </div>
       <div className="flex items-center justify-between">
        <button
         onClick={shareApp}
         aria-label="Share app"
         className="text-slate-200 rounded-full p-2 cursor-pointer"
        >
         <Share />
        </button>
        <button
         onClick={() => setExpanded(!expanded)}
         aria-label="Collapse player"
         className="text-slate-200 rounded-full p-2 cursor-pointer"
        >
         <Collapse className="w-10 h-10" />
        </button>
       </div>
      </div>
     ) : (
      <div className="flex items-center gap-4 h-full px-2">
       <Image
        src={currentSong.image}
        alt={currentSong.title}
        width={50}
        height={50}
        className={clsx(
         "rounded-full border-2 border-white object-cover",
         { "animate-spin-slow": isPlaying }
        )}
       />
       <div
        onClick={() => !expanded && setExpanded(true)}
        className="flex flex-col justify-center flex-1 h-full"
       >
        <h1 className="text-slate-50 font-medium text-lg line-clamp-1">{currentSong.title}</h1>
        <h2 className="text-slate-200 line-clamp-1">{currentSong.artist}</h2>
       </div>
       <button
        onClick={togglePlay}
        aria-label="Toggle play"
        className="text-slate-50 cursor-pointer"
       >
        {isPlaying ? <Pause className="w-12 h-12" /> : <Play className="w-12 h-12" />}
       </button>
      </div>
     )}
    </div>
   </div>
   <audio
    ref={audioRef}
    src={currentSong.song}
    onTimeUpdate={handleTimeUpdate}
    onLoadedMetadata={handleLoadedMetadata}
    onEnded={skipNext}
   />
  </main>
 )
}