import { useState } from "react"
import Navbar from "../components/Navbar"

function AITailor() {
  const [cvText, setCvText] = useState("")
  const [jobDescription, setJobDescription] = useState("")
  const [result, setResult] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const handleTailor = async () => {
    if (!cvText || !jobDescription) {
      setError("Please fill in both your CV and the job description")
      return
    }

    setLoading(true)
    setError("")
    setResult("")

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_GROQ_API_KEY}`
        },
        body: JSON.stringify({
          model: "llama-3.1-8b-instant",
          max_tokens: 1500,
          messages: [
            {
              role: "system",
              content: "You are a professional CV writer."
            },
            {
              role: "user",
              content: `Rewrite this CV to be fully tailored for the job description below.
Keep all real experience and skills but reword and emphasize the most relevant parts.

CV:
${cvText}

Job Description:
${jobDescription}

Output a COMPLETE rewritten CV ready to copy and use. Do not give suggestions or analysis. Just output the full rewritten CV with:
- Tailored professional summary at the top
- Reworded skills section emphasizing relevant skills first
- Reworded project descriptions highlighting relevant experience
- Same format as original CV
- Short note at the end explaining key changes made`
            }
          ]
        })
      })

      const data = await response.json()

      if (data.error) {
        setError(data.error.message)
        return
      }

      setResult(data.choices[0].message.content)
    } catch (error) {
      setError("Failed to analyze CV. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950">
      <Navbar />

      <div className="max-w-5xl mx-auto p-6">
        <p className="text-xl font-medium text-gray-800 dark:text-gray-100 mb-1">
          AI CV Tailor
        </p>
        <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">
          Paste your CV and a job description — AI will rewrite your CV for that specific role
        </p>

        {error && (
          <p className="text-red-500 text-sm mb-4">{error}</p>
        )}

        <div className="grid grid-cols-2 gap-6 mb-6">
          {/* CV input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Your CV
            </label>
            <textarea
              value={cvText}
              onChange={(e) => setCvText(e.target.value)}
              placeholder="Paste your CV text here..."
              rows={16}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>

          {/* job description input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
              Job Description
            </label>
            <textarea
              value={jobDescription}
              onChange={(e) => setJobDescription(e.target.value)}
              placeholder="Paste the job description here..."
              rows={16}
              className="w-full border border-gray-200 dark:border-gray-700 rounded-xl px-4 py-3 text-sm bg-white dark:bg-gray-900 text-gray-800 dark:text-gray-100 focus:outline-none focus:border-blue-400 resize-none"
            />
          </div>
        </div>

        {/* analyze button */}
        <button
          onClick={handleTailor}
          disabled={loading}
          className="w-full bg-gradient-to-r from-blue-500 via-purple-500 to-green-500 text-white py-3 rounded-xl font-medium hover:opacity-90 transition disabled:opacity-50 mb-6"
        >
          {loading ? "Rewriting your CV..." : "✨ Tailor My CV with AI"}
        </button>

        {/* result */}
        {result && (
          <div className="bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <p className="text-sm font-medium text-gray-700 dark:text-gray-300">
                ✅ Tailored CV
              </p>
              {/* copy button */}
              <button
                onClick={() => navigator.clipboard.writeText(result)}
                className="text-xs bg-blue-50 dark:bg-blue-900 text-blue-600 dark:text-blue-300 px-3 py-1 rounded-lg hover:opacity-80"
              >
                Copy to Clipboard
              </button>
            </div>
            <div className="text-sm text-gray-700 dark:text-gray-300 whitespace-pre-wrap leading-relaxed">
              {result}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

export default AITailor