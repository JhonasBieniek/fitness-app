'use client'

import { ArrowsOutSimple, Pause, Play, X } from '@phosphor-icons/react/dist/ssr'
import { AnimatePresence, motion } from 'motion/react'
import Image from 'next/image'
import { useEffect, useRef, useState } from 'react'

import { cn } from '@/shared/lib/cn'

type ExerciseMediaProps = {
  name: string
  cue: string | null
  start: string | null
  end: string | null
}

const FRAME_MS = 900

/**
 * Miniatura do exercício que abre a execução em tela cheia.
 *
 * O acervo tem duas fotos por movimento, início e fim. Alternadas, elas mostram
 * a execução com muito menos peso que um vídeo — o que importa numa academia
 * com sinal ruim — e ainda deixam parar em cada posição para conferir o detalhe,
 * coisa que um GIF em loop não deixa.
 */
export function ExerciseMedia({ name, cue, start, end }: ExerciseMediaProps) {
  const [isOpen, setIsOpen] = useState(false)

  if (!start) {
    return (
      <div aria-hidden className="bg-surface-2 border-line size-14 shrink-0 rounded-xl border" />
    )
  }

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        aria-label={`Ver execução de ${name}`}
        className="group border-line bg-surface-2 relative size-14 shrink-0 overflow-hidden rounded-xl border transition active:scale-95"
      >
        <Image
          src={start}
          alt=""
          width={112}
          height={112}
          // As fotos do acervo vêm de estúdios diferentes, com paredes vermelhas,
          // azuis e cinzas. Em cor, a lista vira uma colcha de retalhos; em
          // preto e branco ela lê como uma coisa só. A cor volta em tela cheia.
          className="size-full object-cover contrast-[1.08] grayscale"
          sizes="56px"
        />
        <span className="absolute right-1 bottom-1 rounded-md bg-black/55 p-0.5 text-white">
          <ArrowsOutSimple size={11} weight="bold" aria-hidden />
        </span>
      </button>

      <AnimatePresence>
        {isOpen ? (
          <MediaViewer
            name={name}
            cue={cue}
            start={start}
            end={end}
            onClose={() => setIsOpen(false)}
          />
        ) : null}
      </AnimatePresence>
    </>
  )
}

type MediaViewerProps = ExerciseMediaProps & { start: string; onClose: () => void }

function MediaViewer({ name, cue, start, end, onClose }: MediaViewerProps) {
  const frames = end ? [start, end] : [start]
  const [frame, setFrame] = useState(0)
  const [isPlaying, setIsPlaying] = useState(frames.length > 1)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    document.addEventListener('keydown', onKeyDown)
    // Sem isso a lista de exercícios rola atrás do visualizador.
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'

    return () => {
      document.removeEventListener('keydown', onKeyDown)
      document.body.style.overflow = previousOverflow
    }
  }, [onClose])

  useEffect(() => {
    if (!isPlaying || frames.length < 2) return

    const timer = window.setInterval(
      () => setFrame((current) => (current + 1) % frames.length),
      FRAME_MS,
    )
    return () => window.clearInterval(timer)
  }, [isPlaying, frames.length])

  return (
    <motion.div
      role="dialog"
      aria-modal="true"
      aria-label={`Execução de ${name}`}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.16 }}
      className="fixed inset-0 z-50 flex flex-col bg-black/92 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="flex items-start justify-between gap-3 p-4"
        style={{ paddingTop: 'max(1rem, env(safe-area-inset-top))' }}
      >
        <div className="min-w-0">
          <h2 className="truncate text-[15px] font-semibold text-white">{name}</h2>
          {cue ? <p className="mt-0.5 text-[13px] leading-snug text-white/65">{cue}</p> : null}
        </div>

        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Fechar"
          className="shrink-0 rounded-full bg-white/10 p-2 text-white transition active:scale-95"
        >
          <X size={18} weight="bold" aria-hidden />
        </button>
      </div>

      <motion.div
        initial={{ scale: 0.96, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        exit={{ scale: 0.98, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 260, damping: 26 }}
        className="flex flex-1 items-center justify-center px-4"
        onClick={(event) => event.stopPropagation()}
      >
        {/* O acervo inteiro é 3:2; usar a proporção da fonte evita a tarja
            branca que sobra ao encaixar uma foto deitada em um quadrado. */}
        <div className="relative aspect-[3/2] w-full max-w-sm overflow-hidden rounded-2xl bg-white/5">
          {frames.map((source, index) => (
            <Image
              key={source}
              src={source}
              alt={index === 0 ? `${name}: posição inicial` : `${name}: posição final`}
              fill
              sizes="(max-width: 420px) 92vw, 384px"
              priority={index === 0}
              className={cn(
                'object-cover transition-opacity duration-150',
                index === frame ? 'opacity-100' : 'opacity-0',
              )}
            />
          ))}
        </div>
      </motion.div>

      <div
        className="flex items-center justify-center gap-2 p-4"
        style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        onClick={(event) => event.stopPropagation()}
      >
        {frames.length > 1 ? (
          <>
            <button
              type="button"
              onClick={() => setIsPlaying((playing) => !playing)}
              className="flex items-center gap-2 rounded-full bg-white/10 py-2 pr-4 pl-3 text-[13px] font-medium text-white transition active:scale-95"
            >
              {isPlaying ? (
                <Pause size={15} weight="fill" aria-hidden />
              ) : (
                <Play size={15} weight="fill" aria-hidden />
              )}
              {isPlaying ? 'Pausar' : 'Animar'}
            </button>

            <div className="flex rounded-full bg-white/10 p-1">
              {['Início', 'Fim'].map((label, index) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => {
                    setIsPlaying(false)
                    setFrame(index)
                  }}
                  aria-pressed={frame === index}
                  className={cn(
                    'rounded-full px-3 py-1 text-[13px] font-medium transition',
                    frame === index ? 'bg-white text-black' : 'text-white/70',
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </>
        ) : (
          <p className="text-[13px] text-white/55">Só há uma imagem deste exercício.</p>
        )}
      </div>
    </motion.div>
  )
}
