import { createContext, useContext, useState, useEffect } from "react"

const ThemeContext = createContext()

export function ThemeProvider({ children }) {
  // check if user previously set dark mode
  const [isDark, setIsDark] = useState(
    localStorage.getItem("theme") === "dark"
  )

  useEffect(() => {
    // apply or remove dark class on html element
    if (isDark) {
      document.documentElement.classList.add("dark")
      localStorage.setItem("theme", "dark")
    } else {
      document.documentElement.classList.remove("dark")
      localStorage.setItem("theme", "light")
    }
  }, [isDark])

  const toggleTheme = () => setIsDark(!isDark)

  return (
    <ThemeContext.Provider value={{ isDark, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  )
}

// custom hook to use theme anywhere
export function useTheme() {
  return useContext(ThemeContext)
}