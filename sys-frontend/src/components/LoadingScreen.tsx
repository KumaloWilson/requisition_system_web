const LoadingScreen = () => {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-gradient-to-br from-primary-50 to-secondary-100">
      <div className="relative">
        <div className="h-24 w-24 rounded-full border-t-4 border-b-4 border-primary-600 animate-spin"></div>
        <div className="absolute top-0 left-0 h-24 w-24 rounded-full border-t-4 border-b-4 border-primary-300 animate-ping opacity-75"></div>
      </div>
      <h2 className="mt-8 text-xl font-semibold text-secondary-700">Loading...</h2>
      <p className="mt-2 text-secondary-500">Please wait while we prepare your content</p>
    </div>
  )
}

export default LoadingScreen
