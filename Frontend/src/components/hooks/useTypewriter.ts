import { useState, useEffect } from 'react'

export function useTypewriter(texts: string[], typingSpeed: number = 50, deletingSpeed: number = 30, pauseTime: number = 2000) {
  const [currentTextIndex, setCurrentTextIndex] = useState(0)
  const [currentText, setCurrentText] = useState('')
  const [isTyping, setIsTyping] = useState(true)

  useEffect(() => {
    let timeout: NodeJS.Timeout

    if (isTyping) {
      if (currentText.length < texts[currentTextIndex].length) {
        timeout = setTimeout(() => {
          setCurrentText(texts[currentTextIndex].slice(0, currentText.length + 1))
        }, typingSpeed)
      } else {
        timeout = setTimeout(() => setIsTyping(false), pauseTime)
      }
    } else {
      if (currentText.length > 0) {
        timeout = setTimeout(() => {
          setCurrentText(currentText.slice(0, -1))
        }, deletingSpeed)
      } else {
        setCurrentTextIndex((prevIndex) => (prevIndex + 1) % texts.length)
        setIsTyping(true)
      }
    }

    return () => clearTimeout(timeout)
  }, [currentText, currentTextIndex, isTyping, texts, typingSpeed, deletingSpeed, pauseTime])

  return currentText
}

