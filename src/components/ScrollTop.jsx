import { useEffect, useState } from 'react'
import { ChevronUp } from 'lucide-react'
import React from 'react'

function ScrollTop() {
  const [isVisible, setIsVisible] = useState(false)

  const toggleVisibility = () => {
    if (window.pageYOffset > 300) {
      setIsVisible(true)
    } else {
      setIsVisible(false)
    }
  }
  useEffect(() => {
    window.addEventListener('scroll', toggleVisibility)

    return () => {
      window.removeEventListener('scroll', toggleVisibility)
    }
  }, [])

  return (
    <div className='fixed bottom-6 right-6 z-40'>
        <button 
        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} className={`bg-blue-600 hover:bg-blue-700 text-white rounded-full p-2.5 transition-all duration-300 shadow-lg focus:outline-none ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-10'}`
        }>
            <ChevronUp/>
        </button>
    </div>
  )
}

export default ScrollTop