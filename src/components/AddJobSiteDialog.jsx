import React, { useState } from 'react'
import { Upload, Loader2 } from 'lucide-react'

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
        const { file_url } = await base44.integrations.Core.UploadFile({ file: imageFile })
        imageUrl = file_url
      }
      await base44.entities.JobSite.create({ name, image_url: imageUrl })
      setName('')
      setImageFile(null)
      onSuccess()
      onOpenChange(false)
    } catch (error) {
      console.error('Error creating job site:', error)
    } finally {
      setUploading(false)
    }
  }

  return (
    <dialog className={`modal ${open ? 'modal-open' : ''}`}>
      <form method='dialog' className='modal-box' onSubmit={handleSubmit}>
        <h3 className='font-bold text-lg mb-4'>Add New Job Site</h3>
        <div className='space-y-4'>
          <div>
            <label htmlFor='name' className='block mb-1 font-medium'>Site Name</label>
            <input
              id='name'
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder='Enter job site name'
              required
              className='input input-bordered w-full'
            />
          </div>
          <div>
            <label htmlFor='image' className='block mb-1 font-medium'>Site Image (Optional)</label>
            <label className='flex items-center justify-center gap-2 px-4 py-8 border-2 border-dashed border-base-300 rounded-lg cursor-pointer hover:border-primary hover:bg-primary/10 transition-colors mt-2'>
              <Upload className='h-5 w-5 text-base-content/40' />
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
          <button type='button' className='btn' onClick={() => onOpenChange(false)}>
            Cancel
          </button>
          <button type='submit' className='btn btn-primary' disabled={uploading}>
            {uploading ? <Loader2 className='animate-spin h-4 w-4 mr-2' /> : 'Add Site'}
          </button>
        </div>
      </form>
    </dialog>
  )
}
