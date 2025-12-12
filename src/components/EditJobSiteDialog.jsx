import React, { useState } from 'react'
import imageCompression from 'browser-image-compression'

const header = import.meta.env.DEV
  ? 'http://localhost:4000'
  : 'https://taskpro.davisdel.com'

export default function EditJobSiteDialog({
  open,
  onOpenChange,
  site,
  onSuccess
}) {
  const [name, setName] = useState(site?.name || '')
  const [image, setImage] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  React.useEffect(() => {
    setName(site?.name || '')
    setImage(null)
    setError('')
  }, [site, open])

  const handleSubmit = async (e) => {
    e.preventDefault()
    setLoading(true)
    setError('')
    try {
      const formData = new FormData()
      formData.append('name', name)
      if (image) {
        // Compress image before upload
        const compressedFile = await imageCompression(image, {
          maxSizeMB: 1,
          maxWidthOrHeight: 1200,
          useWebWorker: true
        })
        formData.append('image', compressedFile)
      }
      const res = await fetch(`${header}/api/job-sites/${site.id}`, {
        method: 'PUT',
        body: formData,
        credentials: 'include'
      })
      if (!res.ok) {
        const data = await res.json()
        setError(data.error || 'Failed to update job site')
        setLoading(false)
        return
      }
      const updated = await res.json()
      setLoading(false)
      onSuccess(updated)
      onOpenChange(false)
    } catch (err) {
      setError('Network error')
      setLoading(false)
    }
  }

  return (
    <dialog className={`modal ${open ? 'modal-open' : ''}`}>
      <form
        method='dialog'
        className='modal-box bg-base-100'
        onSubmit={handleSubmit}>
        <h3 className='font-bold text-lg mb-4 text-primary'>Edit Job Site</h3>
        <div className='space-y-4'>
          <div className='form-control'>
            <label className='label'>
              <span className='label-text font-medium'>Name</span>
            </label>
            <input
              type='text'
              className='input input-bordered w-full'
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
            />
          </div>
          <div className='form-control'>
            <label className='label'>
              <span className='label-text font-medium'>Image</span>
            </label>
            <input
              type='file'
              className='file-input file-input-bordered w-full'
              accept='image/*'
              onChange={(e) => setImage(e.target.files[0])}
            />
            {/* Removed current image preview */}
          </div>
          {error && <div className='alert alert-error'>{error}</div>}
        </div>
        <div className='modal-action flex gap-2'>
          <button
            type='button'
            className='btn btn-secondary'
            onClick={() => onOpenChange(false)}
            disabled={loading}>
            Cancel
          </button>
          <button type='submit' className='btn btn-primary' disabled={loading}>
            Save
          </button>
        </div>
      </form>
    </dialog>
  )
}
