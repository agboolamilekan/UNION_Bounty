import { Loader2 } from "lucide-react"

export function LoadingScreen() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gradient-to-b from-purple-50 to-white dark:from-gray-900 dark:to-gray-950">
      <div className="text-center">
        <Loader2 className="h-12 w-12 animate-spin text-purple-600 mx-auto mb-4" />
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">Loading Union Vouching Graph</h1>
        <p className="text-gray-600 dark:text-gray-400">Fetching and processing data...</p>
        <p className="text-xs text-gray-500 dark:text-gray-500 mt-4">
          This app shows ENS and Farcaster names in the interactive graph
        </p>
      </div>
    </div>
  )
}
