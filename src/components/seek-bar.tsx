"use client"

import { MouseEvent as ReactMouseEvent, TouchEvent as ReactTouchEvent, useEffect, useRef } from "react"

interface SeekBarProps {
 currentTime: number
 duration: number
 onSeek: (time: number) => void
}

export default function SeekBar({ currentTime, duration, onSeek }: SeekBarProps) {
 const barRef = useRef<HTMLDivElement>(null)
 const isDraggingRef = useRef<boolean>(false)

 const progress = duration > 0 ? (currentTime / duration) * 100 : 0

 const getSeekTime = (clientX: number): number => {
  const bar = barRef.current

  if (!bar || duration === 0) return 0

  const rect = bar.getBoundingClientRect()
  const percent = Math.min(Math.max((clientX - rect.left) / rect.width, 0), 1)

  return percent * duration
 }

 const handleSeekClick = (e: ReactMouseEvent<HTMLDivElement>) => {
  const time = getSeekTime(e.clientX)
  onSeek(time)
 }

 const handleMouseMove = (e: globalThis.MouseEvent) => {
  if (!isDraggingRef.current) return
  const time = getSeekTime(e.clientX)
  onSeek(time)
 }

 const startDrag = (e: ReactMouseEvent<HTMLDivElement>) => {
  e.preventDefault()
  isDraggingRef.current = true

  window.addEventListener("mousemove", handleMouseMove)
  window.addEventListener("mouseup", stopDrag)
 }

 const stopDrag = () => {
  isDraggingRef.current = false

  window.removeEventListener("mousemove", handleMouseMove)
  window.removeEventListener("mouseup", stopDrag)
 }

 const handleTouchMove = (e: globalThis.TouchEvent) => {
  if (!isDraggingRef.current) return

  const touch = e.touches[0]
  const time = getSeekTime(touch.clientX)

  onSeek(time)
 }

 const stopTouch = () => {
  isDraggingRef.current = false

  window.removeEventListener("touchmove", handleTouchMove)
  window.removeEventListener("touchend", stopTouch)
 }

 const startTouch = (e: ReactTouchEvent<HTMLDivElement>) => {
  e.preventDefault()
  isDraggingRef.current = true

  window.addEventListener("touchmove", handleTouchMove)
  window.addEventListener("touchend", stopTouch)
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

 useEffect(() => {
  return () => {
   stopDrag()
   stopTouch()
  }
 })

 return (
  <div className="flex flex-col gap-2 w-full">
   <div
    ref={barRef}
    onClick={handleSeekClick}
    className="relative h-1 bg-white/15 rounded-full cursor-pointer"
   >
    <div className="absolute top-0 left-0 h-full bg-slate-50 rounded-full" style={{ width: `${progress}%` }} />
    <div
     onMouseDown={startDrag}
     onTouchStart={startTouch}
     className="absolute top-1/2 w-4 h-4 bg-slate-50 border border-gray-400 rounded-full"
     style={{ left: `${progress}%`, transform: "translate(-50%, -50%)" }}
    />
   </div>
   <div className="flex items-center justify-between">
    <span className="text-slate-50 text-sm">{formatTime(currentTime)}</span>
    <span className="text-slate-50 text-sm">{formatTime(duration)}</span>
   </div>
  </div>
 )
}