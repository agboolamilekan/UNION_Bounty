// This script helps initialize Farcaster client
;(() => {
  if (typeof window !== "undefined" && !window.farcaster) {
    console.log("Farcaster client not detected. This app works best in Warpcast.")
  }
})()
