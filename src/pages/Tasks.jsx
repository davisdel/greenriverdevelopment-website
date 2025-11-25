import React, { useState, useEffect } from 'react'
import { Plus, ArrowLeft, Filter } from 'lucide-react'
import { useNavigate, useParams } from 'react-router-dom'
import TaskRow from '../components/TaskRow'
import TaskDialog from '../components/TaskDialog'
import Topbar from '../components/Topbar'
const API_URL = 'http://localhost:4000/api'

export default function Tasks() {
  const [imageModalOpen, setImageModalOpen] = useState(false)
  const [modalImageUrl, setModalImageUrl] = useState('')
  const navigate = useNavigate()
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')

  // Get siteId from route params (pattern: /tasks/:id)
  const { id: siteId } = useParams()

  const [tasks, setTasks] = useState([])
  const [categories, setCategories] = useState([])

  const isAdmin = true

  const header =
    window.location.hostname === 'localhost'
      ? 'http://localhost:4000'
      : 'https://taskpro.davisdel.com'

  // Fetch site, tasks, categories from backend
  useEffect(() => {
    fetch(`${API_URL}/tasks/${siteId}`)
      .then((res) => res.json())
      .then(setTasks)
      .catch(() => setTasks([]))
    fetch(`${API_URL}/categories`)
      .then((res) => res.json())
      .then(setCategories)
      .catch(() => setCategories([]))
  }, [siteId])

  // Image pop-out logic
  const handleImageClick = (imageUrl) => {
    setModalImageUrl(imageUrl)
    setImageModalOpen(true)
  }

  // CRUD logic
  const handleToggleComplete = async (task) => {
    const res = await fetch(`${API_URL}/tasks/${task.id}`, {
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
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }
  const confirmDelete = async () => {
    if (taskToDelete) {
      await fetch(`${API_URL}/tasks/${taskToDelete.id}`, { method: 'DELETE' })
      setTasks(tasks.filter((t) => t.id !== taskToDelete.id))
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    }
  }
  const handleSaveTask = async (taskData) => {
    if (editingTask) {
      const res = await fetch(`${API_URL}/tasks/${editingTask.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(taskData)
      })
      const updated = await res.json()
      setTasks(tasks.map((t) => (t.id === editingTask.id ? updated : t)))
    } else {
      const res = await fetch(`${API_URL}/tasks`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...taskData, site_id: siteId })
      })
      const created = await res.json()
      setTasks([...tasks, created])
    }
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
      <Topbar />
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
                <button
                  type='button'
                  className='btn btn-primary gap-2'
                  onClick={() => {
                    setEditingTask(null)
                    setTaskDialogOpen(true)
                  }}>
                  <Plus className='h-4 w-4' /> Add Task
                </button>
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
            onSuccess={handleSaveTask}
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
