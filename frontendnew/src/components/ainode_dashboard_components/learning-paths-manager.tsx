import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { useDashboardService } from "@/lib/dashboard-service"

export function LearningPathsManager() {
  const { actions } = useDashboardService()
  const [paths, setPaths] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [creating, setCreating] = useState(false)
  const [newName, setNewName] = useState("")
  const [error, setError] = useState<string | null>(null)

  const load = async () => {
    try {
      setLoading(true)
      setError(null)
      const list = await actions.listLearningPaths()
      setPaths(Array.isArray(list) ? list : [])
    } catch (e: any) {
      setError(e?.message || 'Failed to load paths')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    load()
  }, [])

  const handleCreate = async () => {
    const name = newName.trim()
    if (!name) return
    try {
      setCreating(true)
      await actions.createLearningPath({ name })
      setNewName("")
      await load()
    } catch (e: any) {
      alert(e?.message || 'Failed to create path')
    } finally {
      setCreating(false)
    }
  }

  const handleRename = async (path: any) => {
    const name = prompt('New name', path.name)
    if (!name) return
    try {
      await actions.updateLearningPath(path.id || path.path_id, { name })
      await load()
    } catch (e: any) {
      alert(e?.message || 'Failed to update path')
    }
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm shadow-lg border-0 rounded-2xl">
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>Learning Paths</span>
          <div className="flex gap-2">
            <Input value={newName} onChange={(e) => setNewName(e.target.value)} placeholder="New path name" className="w-48" />
            <Button onClick={handleCreate} disabled={creating}>{creating ? 'Creating...' : 'Create'}</Button>
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading && <div className="text-sm text-gray-500">Loading...</div>}
        {error && <div className="text-sm text-red-600">{error}</div>}
        {!loading && paths.length === 0 && (
          <div className="text-sm text-gray-500">No learning paths.</div>
        )}
        {paths.map((p) => (
          <div key={p.id || p.path_id} className="flex items-center justify-between p-3 border border-gray-100 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="font-medium text-gray-900">{p.name || p.title || 'Untitled Path'}</span>
              {p.status && (
                <Badge variant="secondary" className="text-xs bg-blue-100 text-blue-800">{p.status}</Badge>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={() => handleRename(p)}>Rename</Button>
            </div>
          </div>
        ))}
      </CardContent>
    </Card>
  )
}


