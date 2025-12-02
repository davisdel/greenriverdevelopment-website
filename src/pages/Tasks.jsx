import React, { useState, useEffect } from 'react'
import { Plus, ArrowLeft, Filter } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import TaskRow from '../components/TaskRow'
import TaskDialog from '../components/TaskDialog'
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

export default function Tasks() {
  const [user, setUser] = useState(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [adminError, setAdminError] = useState('')
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [modalImageUrl, setModalImageUrl] = useState('')
  const navigate = useNavigate()
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')

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

  // Get siteId from route params (pattern: /tasks/:id)
  const { id: siteId } = useParams()

  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])

  const header =
    import.meta.env.DEV
      ? 'http://localhost:4000'
      : 'https://taskpro.davisdel.com'

  // Fetch site, tasks, categories from backend
  useEffect(() => {
    fetch(`${header}/api/tasks/${siteId}`)
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
  }, [siteId])

  // Image pop-out logic
  const handleImageClick = (imageUrl) => {
    setModalImageUrl(imageUrl)
    setImageModalOpen(true)
  }

  // CRUD logic
  const handleToggleComplete = async (task) => {
    const res = await fetch(`${header}/api/tasks/${task.id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ ...task, completed: !task.completed })
    })
    // The backend returns { updated: 1 }, so we need to update the local task manually
    if (res.ok) {
      setTasks(
        tasks.map((t) =>
          t.id === task.id ? { ...task, completed: !task.completed } : t
        )
      )
    }
  }
  const handleEdit = (task) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }
  const handleDelete = async (task) => {
    setAdminError('')
    const u = await fetchAdminUser()
    if (!u || u.role !== 'admin') {
      setAdminError('You must be logged in as admin to delete tasks.')
      return
    }
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }
  const confirmDelete = async () => {
    setAdminError('')
    const u = await fetchAdminUser()
    if (!u || u.role !== 'admin') {
      setAdminError('You must be logged in as admin to delete tasks.')
      return
    }
    if (taskToDelete) {
      await fetch(`${header}/api/tasks/${taskToDelete.id}`, {
        method: 'DELETE',
        credentials: 'include'
      })
      setTasks(tasks.filter((t) => t.id !== taskToDelete.id))
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    }
  }

  // Clear all completed tasks (delete from DB and remove images)
  const handleClearCompleted = async () => {
    setAdminError('')
    const u = await fetchAdminUser()
    if (!u || u.role !== 'admin') {
      setAdminError('You must be logged in as admin to clear completed tasks.')
      return
    }
    const completedTasks = tasks.filter((t) => t.completed)
    await Promise.all(
      completedTasks.map((task) =>
        fetch(`${header}/api/tasks/${task.id}`, {
          method: 'DELETE',
          credentials: 'include'
        })
      )
    )
    // Refresh tasks after deletion
    refreshTasks()
  }

  // Refresh tasks after add/edit
  const refreshTasks = () => {
    fetch(`${header}/api/tasks/${siteId}`)
      .then((res) => res.json())
      .then(setTasks)
      .catch(() => setTasks([]))
    setTaskDialogOpen(false)
    setEditingTask(null)
  }

  // Filtered tasks and completed count
  const filteredTasks = (
    filterCategory === 'all'
      ? tasks
      : tasks.filter((t) => t.category_id === filterCategory)
  ).sort((a, b) => {
    // Sort: incomplete first, then completed
    if (a.completed === b.completed) return 0
    return a.completed ? 1 : -1
  })
  const completedCount = filteredTasks.filter((t) => t.completed).length

  return (
    <>
      <Topbar user={user} onLogin={handleLogin} onLogout={handleLogout} />
      {adminError && <div className='alert alert-error my-4'>{adminError}</div>}
      <div className='min-h-screen py-8 px-4 sm:px-6 lg:px-8'>
        <div className='max-w-7xl mx-auto'>
          <div className='mb-6'>
            <button
              type='button'
              className='btn btn-ghost gap-2 mb-4'
              onClick={() => navigate('/')}>
              <span className='inline-flex items-center'>
                <ArrowLeft className='h-4 w-4' />
                Back to Job Sites
              </span>
            </button>
            <div className='flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4'>
              <div>
                <p className='text-slate-600'>
                  {completedCount} of {filteredTasks.length} tasks completed
                </p>
              </div>
              {isAdmin && (
                <div className='flex gap-2'>
                  <button
                    type='button'
                    className='btn btn-primary gap-2'
                    onClick={() => {
                      setEditingTask(null)
                      setTaskDialogOpen(true)
                    }}>
                    <Plus className='h-4 w-4' /> Add Task
                  </button>
                  <button
                    type='button'
                    className='btn btn-error gap-2'
                    disabled={tasks.filter((t) => t.completed).length === 0}
                    onClick={handleClearCompleted}>
                    Clear Completed
                  </button>
                </div>
              )}
            </div>
          </div>
          <div className='card bg-base-100 shadow mb-8'>
            <div className='card-body'>
              <h2 className='card-title'>Tasks</h2>
              <div className='mb-4'>
                <div className='flex gap-2'>
                  <button
                    type='button'
                    className={`btn btn-outline ${filterCategory === 'all' ? 'btn-active' : ''}`}
                    onClick={() => setFilterCategory('all')}>
                    All
                  </button>
                  {categories.map((cat) => (
                    <button
                      key={cat.id}
                      type='button'
                      className={`btn btn-outline ${filterCategory === cat.id ? 'btn-active' : ''}`}
                      onClick={() => setFilterCategory(cat.id)}>
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>
              {filteredTasks.length === 0 ? (
                <div className='text-center py-16'>
                  <p className='text-slate-600 mb-4'>
                    {filterCategory === 'all'
                      ? 'No tasks yet for this job site'
                      : 'No tasks in this category'}
                  </p>
                  {isAdmin && filterCategory === 'all' && (
                    <button
                      type='button'
                      className='btn btn-outline'
                      onClick={() => setTaskDialogOpen(true)}>
                      Add Your First Task
                    </button>
                  )}
                </div>
              ) : (
                <div className='overflow-x-auto'>
                  <table className='table table-zebra w-full'>
                    <thead>
                      <tr>
                        <th></th>
                        <th>Image</th>
                        <th>Task Name</th>
                        <th>Description</th>
                        <th>Category</th>
                        {isAdmin && <th>Actions</th>}
                      </tr>
                    </thead>
                    <tbody>
                      {filteredTasks.map((task) => (
                        <TaskRow
                          key={task.id}
                          task={task}
                          category={categories.find(
                            (c) => c.id === task.category_id
                          )}
                          isAdmin={isAdmin}
                          onToggleComplete={handleToggleComplete}
                          onEdit={handleEdit}
                          onDelete={handleDelete}
                          onImageClick={
                            header + task.image_url
                              ? () => handleImageClick(header + task.image_url)
                              : undefined
                          }
                        />
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
          <TaskDialog
            open={taskDialogOpen}
            onOpenChange={(open) => {
              setTaskDialogOpen(open)
              if (!open) setEditingTask(null)
            }}
            task={editingTask}
            siteId={siteId}
            categories={categories}
            onSuccess={refreshTasks}
          />
          {/* Delete confirmation dialog */}
          {deleteDialogOpen && (
            <div className='modal modal-open'>
              <div className='modal-box'>
                <h3 className='font-bold text-lg'>Delete Task?</h3>
                <p className='py-4'>
                  This will permanently delete "{taskToDelete?.name}". This
                  action cannot be undone.
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
              </div>
            </div>
          )}
          {/* Image pop-out modal */}
          {imageModalOpen && (
            <dialog
              className='modal modal-open'
              onClick={() => setImageModalOpen(false)}>
              <div
                className='modal-box max-w-2xl bg-base-100 flex flex-col items-center'
                onClick={(e) => e.stopPropagation()}>
                <img
                  src={modalImageUrl}
                  alt='Task'
                  className='w-full h-auto rounded-lg mb-4'
                />
                <button
                  className='btn btn-secondary'
                  onClick={() => setImageModalOpen(false)}>
                  Close
                </button>
              </div>
            </dialog>
          )}
        </div>
      </div>
    </>
  )
}
