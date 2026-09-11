import { Link } from "react-router-dom"
import { EmptyState } from "../components/ui/Feedback.jsx"
import "./pages.css"

export default function NotFound() {
  return (
    <div className="page fade-in">
      <EmptyState
        icon="disc"
        title="Page not found"
        message="The page you're looking for doesn't exist or has moved."
        action={
          <Link to="/" className="btn btn-primary">
            Back to home
          </Link>
        }
      />
    </div>
  )
}
