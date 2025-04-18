"use client"

import Image from "next/image"
import clsx from "clsx"
import { More } from "./icons"

interface Song {
 id: string
 title: string
 artist: string
 image: string
}

interface SongListItemProps {
 song: Song
 index: number
 currentSongIndex: number
 onSelect: (index: number) => void
}

export default function Song({ song, index, currentSongIndex, onSelect }: SongListItemProps) {
 return (
  <li
   onClick={() => onSelect(index)}
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
      index === currentSongIndex ? "text-green-600" : "text-slate-50"
     )}
    >
     {song.title}
    </h2>
    <h3 className="text-slate-300 line-clamp-1">{song.artist}</h3>
   </div>
   <button aria-label="More" className="text-slate-50 p-2 rounded-full transition cursor-pointer">
    <More />
   </button>
  </li>
 )
}