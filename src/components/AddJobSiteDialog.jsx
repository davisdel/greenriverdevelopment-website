import React, { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'

const API_URL = 'http://localhost:4000/api'

export default function AddJobSiteDialog({ open, onOpenChange, onSuccess }) {
  const [name, setName] = useState('')
  const [imageFile, setImageFile] = useState(null)
  const [uploading, setUploading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setUploading(true)
    try {
      let imageUrl = ''
      if (imageFile) {
        // Upload image to backend
        const formData = new FormData()
        formData.append('file', imageFile)
        const res = await fetch(`${API_URL}/upload`, {
          method: 'POST',
          body: formData
        })
        const data = await res.json()
        imageUrl = data.url
      }
      // Create job site
      const res = await fetch(`${API_URL}/job-sites`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name,
          image_url: imageUrl,
          created_date: new Date().toISOString().slice(0, 10)
        })
      })
      if (res.ok) {
        const created = await res.json()
        setName('')
        setImageFile(null)
        onSuccess(created)
        onOpenChange(false)
      }
    } catch (error) {
      console.error('Error creating job site:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <dialog className={`modal ${open ? 'modal-open' : ''}`}>
      <form
        method='dialog'
        className='modal-box bg-base-100'
        onSubmit={handleSubmit}>
        <h3 className='font-bold text-lg mb-4 text-primary'>
          Add New Job Site
        </h3>
        <div className='space-y-4'>
          <div>
            <label
              htmlFor='name'
              className='block mb-1 font-medium text-secondary'>
              Site Name
            </label>
            <input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Enter job site name'
              required
              className='input input-bordered input-primary w-full'
            />
          </div>
          <div>
            <label
              htmlFor='image'
              className='block mb-1 font-medium text-secondary'>
              Site Image (Optional)
            </label>
            <label className='flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-primary rounded-lg cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors mt-2'>
              <Upload className='h-5 w-5 text-primary/40' />
              <span className='text-sm text-base-content'>
                {imageFile ? imageFile.name : 'Choose an image'}
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
            className='btn btn-secondary'
            onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button
            type='submit'
            className='btn btn-primary'
            disabled={uploading}>
            {uploading ? (
              <Loader2 className='animate-spin h-4 w-4 mr-2' />
            ) : (
              'Add Site'
            )}
          </button>
        </div>
      </form>
    </dialog>
  )
}
