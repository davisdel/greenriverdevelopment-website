import React, { useState } from 'react'
import { Plus, ArrowLeft, Filter } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import TaskRow from '../components/TaskRow'
import TaskDialog from '../components/TaskDialog'

export default function Tasks() {
  const navigate = useNavigate()
  const [taskDialogOpen, setTaskDialogOpen] = useState(false)
  const [editingTask, setEditingTask] = useState(null)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [taskToDelete, setTaskToDelete] = useState(null)
  const [filterCategory, setFilterCategory] = useState('all')

  // Simulate siteId from URL
  const urlParams = new URLSearchParams(window.location.search)
  const siteId = urlParams.get('siteId') || '1'

  // Local mock data
  // ...existing code...

  const [site] = useState({ id: '1', name: 'Site A' })
  const [tasks, setTasks] = useState([
    {
      id: '1',
      site_id: '1',
      category_id: '1',
      name: 'Task 1',
      completed: false,
      description: 'Do something',
      image_url: ''
    },
    {
      id: '2',
      site_id: '1',
      category_id: '2',
      name: 'Task 2',
      completed: true,
      description: 'Do something else',
      image_url: ''
    },
    {
      id: '3',
      site_id: '1',
      category_id: '1',
      name: 'Task 3',
      completed: false,
      description: 'Another thing',
      image_url: ''
    }
  ])
  const [categories] = useState([
    { id: '1', name: 'General' },
    { id: '2', name: 'Electrical' }
  ])

  const isAdmin = true

  // CRUD logic
  const handleToggleComplete = (task) => {
    setTasks(
      tasks.map((t) =>
        t.id === task.id ? { ...t, completed: !t.completed } : t
      )
    )
  }
  const handleEdit = (task) => {
    setEditingTask(task)
    setTaskDialogOpen(true)
  }
  const handleDelete = (task) => {
    setTaskToDelete(task)
    setDeleteDialogOpen(true)
  }
  const confirmDelete = () => {
    if (taskToDelete) {
      setTasks(tasks.filter((t) => t.id !== taskToDelete.id))
      setDeleteDialogOpen(false)
      setTaskToDelete(null)
    }
  }
  const handleSaveTask = (taskData) => {
    if (editingTask) {
      setTasks(
        tasks.map((t) =>
          t.id === editingTask.id ? { ...editingTask, ...taskData } : t
        )
      )
    } else {
      setTasks([
        ...tasks,
        { ...taskData, id: String(Date.now()), site_id: siteId }
      ])
    }
    setTaskDialogOpen(false)
    setEditingTask(null)
  }

  // Filtered tasks and completed count
  const filteredTasks =
    filterCategory === 'all'
      ? tasks.filter((t) => t.site_id === siteId)
      : tasks.filter(
          (t) => t.site_id === siteId && t.category_id === filterCategory
        )
  const completedCount = filteredTasks.filter((t) => t.completed).length

  return (
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
              <h1 className='text-4xl font-bold text-slate-800 mb-2'>
                {site?.name || 'Loading...'}
              </h1>
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
          onSave={handleSaveTask}
        />
        {/* Delete confirmation dialog */}
        {deleteDialogOpen && (
          <div className='modal modal-open'>
            <div className='modal-box'>
              <h3 className='font-bold text-lg'>Delete Task?</h3>
              <p className='py-4'>
                This will permanently delete "{taskToDelete?.name}". This action
                cannot be undone.
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
      </div>
    </div>
  )
}
