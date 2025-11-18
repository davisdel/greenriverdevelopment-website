import React, { useState, useEffect } from 'react'
import { Upload, Loader2 } from 'lucide-react'

export default function TaskDialog({
  open,
  onOpenChange,
  task,
  siteId,
  categories,
  onSuccess
}) {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    category_id: '',
    image_url: ''
  })
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  useEffect(() => {
    if (task) {
      setFormData({
        name: task.name || '',
        description: task.description || '',
        category_id: task.category_id || '',
        image_url: task.image_url || ''
      })
    } else {
      setFormData({
        name: '',
        description: '',
        category_id: '',
        image_url: ''
      })
    }
    setImageFile(null)
  }, [task, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)

    try {
      let imageUrl = formData.image_url
      if (imageFile) {
        const { file_url } = await base44.integrations.Core.UploadFile({
          file: imageFile
        })
        imageUrl = file_url
      }

      const data = {
        ...formData,
        site_id: siteId,
        image_url: imageUrl,
        completed: task?.completed || false
      }

      if (task) {
        await base44.entities.Task.update(task.id, data)
      } else {
        await base44.entities.Task.create(data)
      }

      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error saving task:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <dialog className={`modal ${open ? 'modal-open' : ''}`}>
      <form
        method='dialog'
        className='modal-box max-w-2xl'
        onSubmit={handleSubmit}>
        <h3 className='font-bold text-lg mb-4'>
          {task ? 'Edit Task' : 'Add New Task'}
        </h3>
        <div className='space-y-4'>
          <div>
            <label htmlFor='name' className='block mb-1 font-medium'>
              Task Name
            </label>
            <input
              id='name'
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              placeholder='Enter task name'
              required
              className='input input-bordered w-full'
            />
          </div>
          <div>
            <label htmlFor='description' className='block mb-1 font-medium'>
              Description
            </label>
            <textarea
              id='description'
              value={formData.description}
              onChange={(e) =>
                setFormData({ ...formData, description: e.target.value })
              }
              placeholder='Enter task description'
              rows={3}
              className='textarea textarea-bordered w-full'
            />
          </div>
          <div>
            <label htmlFor='category' className='block mb-1 font-medium'>
              Category
            </label>
            <select
              id='category'
              value={formData.category_id}
              onChange={(e) =>
                setFormData({ ...formData, category_id: e.target.value })
              }
              required
              className='select select-bordered w-full'>
              <option value='' disabled>
                Select a category
              </option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor='image' className='block mb-1 font-medium'>
              Task Image (Optional)
            </label>
            <label className='flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-base-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors mt-2'>
              <Upload className='h-5 w-5 text-base-content/40' />
              <span className='text-sm text-base-content'>
                {imageFile
                  ? imageFile.name
                  : formData.image_url
                    ? 'Change image'
                    : 'Choose an image'}
              </span>
              <input
                id='image'
                type='file'
                accept='image/*'
                className='hidden'
                onChange={(e) => setImageFile(e.target.files[0])}
              />
            </label>
          </div>
        </div>
        <div className='modal-action flex gap-2 mt-6'>
          <button
            type='button'
            className='btn'
            onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button
            type='submit'
            className='btn btn-primary'
            disabled={uploading || !formData.name}>
            {uploading && <Loader2 className='h-4 w-4 mr-2 animate-spin' />}
            {task ? 'Update Task' : 'Create Task'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
