import { useEffect } from "react"
import { useNavigate } from "react-router-dom"

export default function CommunityPage() {
  const navigate = useNavigate()

  // Redirect to frontend community page on mount
  useEffect(() => {
    navigate("/community-public", { replace: true })
  }, [navigate])

  // Return null since we're redirecting
  return null
}
