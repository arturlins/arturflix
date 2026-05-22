import { useEffect, useRef } from 'react'

interface YTPlayer {
    seekTo: (seconds: number, allowSeekAhead: boolean) => void
    getCurrentTime: () => number
    getDuration: () => number
    destroy: () => void
}

interface UseYouTubePlayerOptions {
    videoId: string
    startSeconds: number
    onTick: (currentSeconds: number, durationSeconds: number) => void
    onEnded: () => void
}

declare global {
    interface Window {
        YT?: {
            Player: new (el: HTMLElement, config: Record<string, unknown>) => YTPlayer
            PlayerState: { PLAYING: number; PAUSED: number; ENDED: number }
        }
        onYouTubeIframeAPIReady?: () => void
    }
}

let apiPromise: Promise<void> | null = null

function loadYouTubeIframeApi(): Promise<void> {
    if (apiPromise) return apiPromise
    apiPromise = new Promise((resolve) => {
        if (window.YT && window.YT.Player) {
            resolve()
            return
        }
        const previous = window.onYouTubeIframeAPIReady
        window.onYouTubeIframeAPIReady = () => {
            previous?.()
            resolve()
        }
        const tag = document.createElement('script')
        tag.src = 'https://www.youtube.com/iframe_api'
        document.head.appendChild(tag)
    })
    return apiPromise
}

export function useYouTubePlayer(
    containerRef: React.RefObject<HTMLDivElement | null>,
    { videoId, startSeconds, onTick, onEnded }: UseYouTubePlayerOptions,
): void {
    const playerRef = useRef<YTPlayer | null>(null)
    const intervalRef = useRef<number | null>(null)

    useEffect(() => {
        let cancelled = false

        loadYouTubeIframeApi().then(() => {
            if (cancelled || !containerRef.current || !window.YT) return

            playerRef.current = new window.YT.Player(containerRef.current, {
                videoId,
                playerVars: { rel: 0, modestbranding: 1, start: Math.max(0, Math.floor(startSeconds)) },
                events: {
                    onReady: () => {
                        if (startSeconds > 5) {
                            playerRef.current?.seekTo(startSeconds, true)
                        }
                    },
                    onStateChange: (e: { data: number }) => {
                        const yt = window.YT!
                        const player = playerRef.current
                        if (!player) return

                        if (e.data === yt.PlayerState.PLAYING) {
                            if (intervalRef.current) window.clearInterval(intervalRef.current)
                            intervalRef.current = window.setInterval(() => {
                                onTick(player.getCurrentTime(), player.getDuration())
                            }, 10000)
                        } else {
                            if (intervalRef.current) {
                                window.clearInterval(intervalRef.current)
                                intervalRef.current = null
                            }
                            onTick(player.getCurrentTime(), player.getDuration())
                            if (e.data === yt.PlayerState.ENDED) onEnded()
                        }
                    },
                },
            })
        })

        return () => {
            cancelled = true
            if (intervalRef.current) window.clearInterval(intervalRef.current)
            playerRef.current?.destroy()
            playerRef.current = null
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [videoId])
}
