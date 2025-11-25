import React, { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  FileExclamationPoint,
  LucideFileExclamationPoint,
  Plus,
  Settings,
  Trash2
} from 'lucide-react'
import JobSiteCard from '../components/JobSiteCard'
import AddJobSiteDialog from '../components/AddJobSiteDialog'
import Topbar from '../components/Topbar'

const header =
    import.meta.env.DEV
      ? 'http://localhost:4000'
      : 'https://taskpro.davisdel.com'


// Helper to get current admin user from session
async function fetchAdminUser() {
  try {
    const res = await fetch(`${header}/api/admin/me`, {
      method: 'GET',
      credentials: 'include'
    })
    if (!res.ok) return null
    return await res.json()
  } catch {
    return null
  }
}

export default function Home() {
  const navigate = useNavigate()
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [sites, setSites] = useState([])
  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [siteToDelete, setSiteToDelete] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [sitesLoading, setSitesLoading] = useState(false)
  const [adminError, setAdminError] = useState('')

  // Fetch job sites, tasks, categories from backend
  useEffect(() => {
    setSitesLoading(true)
    fetch(`${header}/api/job-sites`)
      .then((res) => res.json())
      .then((data) => {
        setSites(data)
        setSitesLoading(false)
      })
      .catch(() => setSitesLoading(false))
    fetch(`${header}/api/tasks`)
      .then((res) => res.json())
      .then(setTasks)
      .catch(() => setTasks([]))
    fetch(`${header}/api/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]))
    // Check admin session and set user info from /admin/me
    fetchAdminUser().then((u) => {
      if (u && u.username) {
        setUser({ ...u, email: u.username })
        setIsAdmin(u.role === 'admin')
      } else {
        setUser(null)
        setIsAdmin(false)
      }
    })
  }, [])

  // Handle login/register from Topbar
  function handleLogin(type, data) {
    setUser(data)
    setIsAdmin(!!data && data.role === 'admin')
  }

  // Handle logout from Topbar
  async function handleLogout() {
    await fetch(`${header}/api/admin/logout`, {
      method: 'POST',
      credentials: 'include'
    })
    setUser(null)
    setIsAdmin(false)
  }

  const getTaskCountsForSite = (siteId) => {
    const siteTasks = tasks.filter((t) => t.site_id === siteId)
    const counts = {}

    categories.forEach((cat) => {
      const catTasks = siteTasks.filter((t) => t.category_id === cat.id)
      if (catTasks.length > 0) {
        counts[cat.name] = {
          total: catTasks.length,
          completed: catTasks.filter((t) => t.completed).length
        }
      }
    })

    return counts
  }

  const handleDeleteSite = async (site, e) => {
    e.stopPropagation()
    setAdminError('')
    const u = await fetchAdminUser()
    if (!u || u.role !== 'admin') {
      setAdminError('You must be logged in as admin to delete job sites.')
      return
    }
    setSiteToDelete(site)
    setDeleteDialogOpen(true)
  }
  const confirmDelete = async () => {
    setAdminError('')
    const u = await fetchAdminUser()
    if (!u || u.role !== 'admin') {
      setAdminError('You must be logged in as admin to delete job sites.')
      return
    }
    if (siteToDelete) {
      await fetch(`${header}/api/job-sites/${siteToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      setSites(sites.filter((s) => s.id !== siteToDelete.id))
      setTasks(tasks.filter((t) => t.site_id !== siteToDelete.id))
      setDeleteDialogOpen(false)
      setSiteToDelete(null)
    }
  }

  return (
    <>
      <Topbar user={user} onLogin={handleLogin} onLogout={handleLogout} />
      <div className='min-h-screen py-8 px-4 sm:px-6 lg:px-8 bg-base-200'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
            <div>
              <h1 className='text-4xl font-bold text-primary mb-2'>
                Job Sites
              </h1>
              <p className='text-secondary'>
                Manage and track all your construction projects
              </p>
            </div>
            {isAdmin && (
              <div className='flex gap-2'>
                <button
                  type='button'
                  className='btn btn-outline btn-secondary flex gap-2'
                  onClick={async () => {
                    setAdminError('')
                    const u = await fetchAdminUser()
                    if (!u || u.role !== 'admin') {
                      setAdminError(
                        'You must be logged in as admin to manage categories.'
                      )
                      return
                    }
                    setCategoriesDialogOpen(true)
                  }}>
                  <Settings className='h-4 w-4' />
                  Categories
                </button>
                <button
                  type='button'
                  className='btn btn-primary flex gap-2'
                  onClick={async () => {
                    setAdminError('')
                    const u = await fetchAdminUser()
                    if (!u || u.role !== 'admin') {
                      setAdminError(
                        'You must be logged in as admin to add job sites.'
                      )
                      return
                    }
                    setAddDialogOpen(true)
                  }}>
                  <Plus className='h-4 w-4' />
                  Add Job Site
                </button>
              </div>
            )}
          </div>
          {sitesLoading ? (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {[1, 2, 3].map((i) => (
                <div
                  key={i}
                  className='h-96 bg-base-100 rounded-xl animate-pulse'
                />
              ))}
            </div>
          ) : sites.length === 0 ? (
            <div className='flex flex-col items-center justify-center py-24'>
              <LucideFileExclamationPoint className='h-16 w-16 text-secondary mb-4' />
              <h2 className='text-2xl font-bold text-base-content mb-2'>
                No Job Sites
              </h2>
              <p className='text-base-content/60 mb-6'>
                Get started by adding your first job site.
              </p>
              {isAdmin && (
                <button
                  type='button'
                  className='btn btn-primary flex gap-2'
                  onClick={async () => {
                    setAdminError('')
                    const u = await fetchAdminUser()
                    if (!u || u.role !== 'admin') {
                      setAdminError(
                        'You must be logged in as admin to add job sites.'
                      )
                      return
                    }
                    setAddDialogOpen(true)
                  }}>
                  <Plus className='h-4 w-4' /> Add Job Site
                </button>
              )}
            </div>
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {sites.map((site) => (
                <div key={site.id} className='relative group'>
                  <JobSiteCard
                    site={site}
                    taskCounts={getTaskCountsForSite(site.id)}
                    onClick={() => navigate('/tasks/' + site.id)}
                  />
                  {isAdmin && (
                    <button
                      type='button'
                      className='btn btn-error btn-sm absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity shadow-lg flex gap-1'
                      onClick={(e) => handleDeleteSite(site, e)}>
                      <Trash2 className='h-4 w-4' />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
        <AddJobSiteDialog
          open={addDialogOpen}
          onOpenChange={setAddDialogOpen}
          onSuccess={(createdSite) => {
            setSites((prev) => [...prev, createdSite])
          }}
        />
        {adminError && (
          <div className='alert alert-error my-4'>{adminError}</div>
        )}
        {/* Category Dialog */}
        <dialog className={`modal ${categoriesDialogOpen ? 'modal-open' : ''}`}>
          <form method='dialog' className='modal-box bg-base-100'>
            <h3 className='font-bold text-lg mb-4 text-primary'>
              Manage Categories
            </h3>
            <div className='space-y-4'>
              <div className='flex gap-2'>
                <input
                  type='text'
                  className='input input-bordered input-secondary w-full'
                  placeholder='New category name'
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={async (e) => {
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      const u = await fetchAdminUser()
                      if (!u || u.role !== 'admin') {
                        setAdminError(
                          'You must be logged in as admin to add categories.'
                        )
                        return
                      }
                      const res = await fetch(`${header}/api/categories`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: newCategoryName.trim() }),
                        credentials: 'include'
                      })
                      const created = await res.json()
                      setCategories([...categories, created])
                      setNewCategoryName('')
                    }
                  }}
                />
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={async () => {
                    if (newCategoryName.trim()) {
                      const u = await fetchAdminUser()
                      if (!u || u.role !== 'admin') {
                        setAdminError(
                          'You must be logged in as admin to add categories.'
                        )
                        return
                      }
                      const res = await fetch(`${header}/api/categories`, {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({ name: newCategoryName.trim() }),
                        credentials: 'include'
                      })
                      const created = await res.json()
                      setCategories([...categories, created])
                      setNewCategoryName('')
                    }
                  }}
                  disabled={!newCategoryName.trim()}>
                  Add
                </button>
              </div>
              <div className='space-y-2 max-h-96 overflow-y-auto'>
                {categories.map((cat) => (
                  <div
                    key={cat.id}
                    className='flex items-center justify-between p-3 bg-base-200 rounded-lg'>
                    <span className='font-medium text-base-content'>
                      {cat.name}
                    </span>
                    <button
                      type='button'
                      className='btn btn-ghost btn-sm hover:bg-error/10 flex gap-1'
                      onClick={async () => {
                        const u = await fetchAdminUser()
                        if (!u || u.role !== 'admin') {
                          setAdminError(
                            'You must be logged in as admin to delete categories.'
                          )
                          return
                        }
                        await fetch(`${header}/api/categories/${cat.id}`, {
                          method: 'DELETE',
                          credentials: 'include'
                        })
                        setCategories(categories.filter((c) => c.id !== cat.id))
                      }}>
                      <Trash2 className='h-4 w-4 text-error' />
                    </button>
                  </div>
                ))}
                {categories.length === 0 && (
                  <p className='text-center text-base-content/50 py-8'>
                    No categories yet
                  </p>
                )}
              </div>
            </div>
            <div className='modal-action'>
              <button
                type='button'
                className='btn btn-secondary'
                onClick={() => setCategoriesDialogOpen(false)}>
                Close
              </button>
            </div>
          </form>
        </dialog>
        {/* Delete Site Dialog */}
        <dialog className={`modal ${deleteDialogOpen ? 'modal-open' : ''}`}>
          <form method='dialog' className='modal-box bg-base-100'>
            <h3 className='font-bold text-lg text-error'>Delete Job Site?</h3>
            <p className='py-4 text-base-content'>
              This will permanently delete "{siteToDelete?.name}" and all its
              tasks. This action cannot be undone.
            </p>
            <div className='modal-action flex gap-2'>
              <button
                type='button'
                className='btn btn-secondary'
                onClick={() => setDeleteDialogOpen(false)}>
                Cancel
              </button>
              <button
                type='button'
                className='btn btn-error'
                onClick={confirmDelete}>
                Delete
              </button>
            </div>
          </form>
        </dialog>
      </div>
    </>
  )
}
