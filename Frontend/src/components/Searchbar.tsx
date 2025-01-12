"use client"

import React, { useState, useRef, useEffect } from 'react'
import { Search } from 'lucide-react'
import { useTypewriter } from '@/components/hooks/useTypewriter'

const examplePrompts = [
  "Who is able to work with React?",
  "What are the best practices for responsive design?",
  "How to optimize React performance?",
  "Explain the concept of server-side rendering",
]

export function Searchbar() {
  const [query, setQuery] = useState('')
  const [isFocused, setIsFocused] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)
  const currentPrompt = useTypewriter(examplePrompts, 50, 30, 2000)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log('Searching for:', query)
    // Implement your search logic here
  }

  return (
    <div className="w-full max-w-3xl mx-auto">
      <form onSubmit={handleSubmit} className="relative">
        <div className="relative">
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onFocus={() => setIsFocused(true)}
            onBlur={() => setIsFocused(false)}
            placeholder={isFocused ? '' : currentPrompt}
            className="w-full px-4 py-3 pr-12 text-gray-200 bg-gray-800 border-2 border-gray-700 rounded-full outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500 transition-all duration-300 ease-in-out placeholder-gray-500"
          />
          <button
            type="submit"
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-blue-500 transition-colors duration-300"
          >
            <Search size={20} />
          </button>
        </div>
      </form>
    </div>
  )
}