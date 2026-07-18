'use client'

import styles from './hero.module.css'
import { useState, useEffect, useRef } from 'react'
import Image from 'next/image'
import gsap from 'gsap'

const STICKERS = [
  { id: 1, src: '/Card-Sticker SVG/sticker-camera.svg', top: '85%', left: '85%', rotate: 15, width: 140 },
  { id: 2, src: '/Card-Sticker SVG/sticker-hand.svg', top: '80%', left: '12%', rotate: -25, width: 110 },
  { id: 3, src: '/Card-Sticker SVG/sticker-heart.svg', top: '18%', left: '82%', rotate: -22, width: 130 },
  { id: 4, src: '/Card-Sticker SVG/sticker-phone.svg', top: '12%', left: '15%', rotate: -15, width: 130 },
  { id: 5, src: '/Card-Sticker SVG/sticker-smiley.svg', top: '45%', left: '8%', rotate: -10, width: 125 }
]

export default function Hero() {
  const [windowWidth, setWindowWidth] = useState(0)

  const stickerRefs = useRef<(HTMLDivElement | null)[]>([])

  useEffect(() => {
    setWindowWidth(window.innerWidth)

    const resize = () => setWindowWidth(window.innerWidth)

    window.addEventListener('resize', resize)

    return () => window.removeEventListener('resize', resize)
  }, [])

  useEffect(() => {
    const listeners: (() => void)[] = []

    stickerRefs.current.forEach((sticker) => {
      if (!sticker) return

      const move = (e: MouseEvent) => {
        const rect = sticker.getBoundingClientRect()

        const x = e.clientX - rect.left - rect.width / 2
        const y = e.clientY - rect.top - rect.height / 2

        gsap.to(sticker, {
          x: x * 0.28,
          y: y * 0.28,
          scale: 1.08,
          duration: 0.35,
          ease: 'power3.out'
        })
      }

      const leave = () => {
        gsap.to(sticker, {
          x: 0,
          y: 0,
          scale: 1,
          duration: 1,
          ease: 'elastic.out(1,0.35)'
        })
      }

      sticker.addEventListener('mousemove', move)
      sticker.addEventListener('mouseleave', leave)

      listeners.push(() => {
        sticker.removeEventListener('mousemove', move)
        sticker.removeEventListener('mouseleave', leave)
      })
    })

    return () => {
      listeners.forEach((remove) => remove())
    }
  }, [])

  const colorize = (el: HTMLElement) => {
    el.style.backgroundColor = 'black'

    setTimeout(() => {
      el.style.backgroundColor = 'transparent'
    }, 300)
  }

  const getBlocks = () => {
    const blockSize = windowWidth * 0.05
    const nbOfBlocks = Math.ceil(window.innerHeight / blockSize)

    return [...Array(nbOfBlocks).keys()].map((_, index) => (
      <div
        key={index}
        onMouseEnter={(e) => colorize(e.target as HTMLElement)}
      />
    ))
  }

  return (
    <section className={styles.container}>
      {STICKERS.map((s, index) => (
        <div
          key={s.id}
          ref={(el) => {
            stickerRefs.current[index] = el
          }}
          className={styles.sticker}
          style={{
            top: s.top,
            left: s.left,
            width: `${s.width}px`,
            height: `${s.width}px`,
            transform: `translate(-50%, -50%) rotate(${s.rotate}deg)`
          }}
        >
          <Image
            src={s.src}
            alt="sticker"
            fill
            priority
            style={{ objectFit: 'contain' }}
          />
        </div>
      ))}

      <div className={styles.body}>
        <p>
          Hi, I am Harshit,{' '}
          <span className={styles.keepTogether}>
            a Full-Stack Engineer
          </span>{' '}
          building scalable web applications.
        </p>
      </div>

      <div className={styles.grid}>
        {windowWidth > 0 &&
          [...Array(20).keys()].map((_, index) => (
            <div key={index} className={styles.column}>
              {getBlocks()}
            </div>
          ))}
      </div>
    </section>
  )
}