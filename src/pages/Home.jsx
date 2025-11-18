import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Plus, Settings, Trash2 } from 'lucide-react'
import JobSiteCard from '../components/JobSiteCard'
import AddJobSiteDialog from '../components/AddJobSiteDialog'
import Topbar from '../components/Topbar'

export default function Home() {
  const navigate = useNavigate()
  const isAdmin = true
  const [sites, setSites] = useState([
    { id: '1', name: 'Site A', image_url: '', created_date: '2025-11-01' },
    { id: '2', name: 'Site B', image_url: '', created_date: '2025-11-10' }
  ])
  const [tasks, setTasks] = useState([
    {
      id: '1',
      site_id: '1',
      category_id: '1',
      name: 'Task 1',
      completed: false
    },
    {
      id: '2',
      site_id: '1',
      category_id: '2',
      name: 'Task 2',
      completed: true
    },
    {
      id: '3',
      site_id: '2',
      category_id: '1',
      name: 'Task 3',
      completed: false
    }
  ])
  const [categories, setCategories] = useState([
    { id: '1', name: 'General' },
    { id: '2', name: 'Electrical' }
  ])
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [categoriesDialogOpen, setCategoriesDialogOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [siteToDelete, setSiteToDelete] = useState(null)
  const [newCategoryName, setNewCategoryName] = useState('')
  const [sitesLoading] = useState(false)

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

  const handleDeleteSite = (site, e) => {
    e.stopPropagation()
    setSiteToDelete(site)
    setDeleteDialogOpen(true)
  }
  const confirmDelete = () => {
    if (siteToDelete) {
      setSites(sites.filter((s) => s.id !== siteToDelete.id))
      setTasks(tasks.filter((t) => t.site_id !== siteToDelete.id))
      setDeleteDialogOpen(false)
      setSiteToDelete(null)
    }
  }

  return (
    <>
      <Topbar />
      <div className='min-h-screen py-8 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8'>
            <div>
              <h1 className='text-4xl font-bold text-slate-800 mb-2'>
                Job Sites
              </h1>
              <p className='text-slate-600'>
                Manage and track all your construction projects
              </p>
            </div>
            {isAdmin && (
              <div className='flex gap-2'>
                <button
                  type='button'
                  className='btn btn-outline flex gap-2'
                  onClick={() => setCategoriesDialogOpen(true)}>
                  <Settings className='h-4 w-4' />
                  Categories
                </button>
                <button
                  type='button'
                  className='btn btn-primary flex gap-2'
                  onClick={() => setAddDialogOpen(true)}>
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
          ) : (
            <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6'>
              {sites.map((site) => (
                <div key={site.id} className='relative group'>
                  <JobSiteCard
                    site={site}
                    taskCounts={getTaskCountsForSite(site.id)}
                    onClick={() => navigate('/home')}
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
          onSuccess={() => {
            setSites([
              ...sites,
              {
                id: String(Date.now()),
                name: 'New Site',
                image_url: '',
                created_date: new Date().toISOString().slice(0, 10)
              }
            ])
          }}
        />
        {/* Category Dialog */}
        <dialog className={`modal ${categoriesDialogOpen ? 'modal-open' : ''}`}>
          <form method='dialog' className='modal-box'>
            <h3 className='font-bold text-lg mb-4'>Manage Categories</h3>
            <div className='space-y-4'>
              <div className='flex gap-2'>
                <input
                  type='text'
                  className='input input-bordered w-full'
                  placeholder='New category name'
                  value={newCategoryName}
                  onChange={(e) => setNewCategoryName(e.target.value)}
                  onKeyPress={(e) => {
                    if (e.key === 'Enter' && newCategoryName.trim()) {
                      setCategories([
                        ...categories,
                        { id: String(Date.now()), name: newCategoryName.trim() }
                      ])
                      setNewCategoryName('')
                    }
                  }}
                />
                <button
                  type='button'
                  className='btn btn-primary'
                  onClick={() => {
                    if (newCategoryName.trim()) {
                      setCategories([
                        ...categories,
                        { id: String(Date.now()), name: newCategoryName.trim() }
                      ])
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
                      className='btn btn-ghost btn-sm text-error hover:bg-error/10 flex gap-1'
                      onClick={() =>
                        setCategories(categories.filter((c) => c.id !== cat.id))
                      }>
                      <Trash2 className='h-4 w-4' />
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
                className='btn'
                onClick={() => setCategoriesDialogOpen(false)}>
                Close
              </button>
            </div>
          </form>
        </dialog>
        {/* Delete Site Dialog */}
        <dialog className={`modal ${deleteDialogOpen ? 'modal-open' : ''}`}>
          <form method='dialog' className='modal-box'>
            <h3 className='font-bold text-lg'>Delete Job Site?</h3>
            <p className='py-4'>
              This will permanently delete "{siteToDelete?.name}" and all its
              tasks. This action cannot be undone.
            </p>
            <div className='modal-action flex gap-2'>
              <button
                type='button'
                className='btn'
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
