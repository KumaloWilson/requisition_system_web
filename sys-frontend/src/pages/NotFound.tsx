import { Link } from "react-router-dom"
import { Home, AlertTriangle } from "react-feather"

const NotFound = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-secondary-50 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full text-center">
        <div className="flex justify-center">
          <div className="h-24 w-24 rounded-full bg-warning-100 flex items-center justify-center text-warning-600">
            <AlertTriangle className="h-12 w-12" />
          </div>
        </div>
        <h1 className="mt-6 text-4xl font-extrabold text-secondary-900 tracking-tight">404</h1>
        <p className="mt-2 text-2xl font-semibold text-secondary-700">Page not found</p>
        <p className="mt-4 text-base text-secondary-500">Sorry, we couldn't find the page you're looking for.</p>
        <div className="mt-8">
          <Link
            to="/"
            className="inline-flex items-center px-4 py-2 border border-transparent text-base font-medium rounded-md shadow-sm text-white bg-primary-600 hover:bg-primary-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary-500 transition-colors"
          >
            <Home className="mr-2 h-5 w-5" />
            Back to Dashboard
          </Link>
        </div>
      </div>
    </div>
  )
}

export default NotFound
