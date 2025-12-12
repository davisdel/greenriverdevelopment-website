import React, { useState, useEffect } from 'react'
import {
  Pencil,
  Trash2,
  Image as ImageIcon,
  MessageSquareText
} from 'lucide-react'
import imageCompression from 'browser-image-compression'

export default function TaskRow({
  task,
  category,
  isAdmin,
  onToggleComplete,
  onEdit,
  onDelete,
  onImageClick,
  language
}) {
  const [descModalOpen, setDescModalOpen] = useState(false)
  const [commentModalOpen, setCommentModalOpen] = useState(false)
  const [commentName, setCommentName] = useState('')
  const [commentText, setCommentText] = useState('')
  const [commentImage, setCommentImage] = useState(null)
  const [commentSubmitting, setCommentSubmitting] = useState(false)
  const [commentError, setCommentError] = useState('')
  const [commentSuccess, setCommentSuccess] = useState('')
  const [comments, setComments] = useState([])
  const [commentsLoading, setCommentsLoading] = useState(false)
  const [commentCount, setCommentCount] = useState(0)
  // Fetch comment count on mount and after submit
  useEffect(() => {
    let ignore = false
    async function fetchCount() {
      try {
        const res = await fetch(`${header}/api/tasks/${task.id}/comments`)
        const data = await res.json()
        if (!ignore) setCommentCount(Array.isArray(data) ? data.length : 0)
      } catch {
        if (!ignore) setCommentCount(0)
      }
    }
    fetchCount()
    return () => {
      ignore = true
    }
  }, [task.id])

  const header = import.meta.env.DEV
    ? 'http://localhost:4000'
    : 'https://taskpro.davisdel.com'

  // Truncate description if too long, use language prop
  const MAX_DESC = 80
  const name = language === 'es' && task.name_es ? task.name_es : task.name
  const desc =
    language === 'es' && task.description_es
      ? task.description_es
      : task.description || ''
  const truncatedDesc =
    desc.length > MAX_DESC ? (
      <>
        {desc.slice(0, MAX_DESC)}…<span className='font-bold'>(See More)</span>
      </>
    ) : (
      desc
    )

  return (
    <>
      <tr className={task.completed ? 'bg-success/10' : 'bg-base-100'}>
        <td className='w-12'>
          <input
            type='checkbox'
            className='checkbox checkbox-primary'
            checked={task.completed}
            onChange={() => onToggleComplete(task)}
          />
        </td>
        <td>
          {task.image_url ? (
            <div
              className='w-16 h-16 rounded-lg overflow-hidden border border-primary'
              onClick={onImageClick}
              style={{ cursor: 'pointer' }}>
              <img
                src={header + task.image_url}
                alt='Task'
                className='w-full h-full object-cover'
              />
            </div>
          ) : (
            <div className='w-16 h-16 rounded-lg border-2 border-dashed border-secondary flex items-center justify-center'>
              <ImageIcon className='h-6 w-6 text-secondary/40' />
            </div>
          )}
        </td>
        <td className='break-words whitespace-pre-line align-middle'>
          <span
            className={`font-medium text-lg ${task.completed ? 'line-through text-secondary' : 'text-primary'}`}
            title={name}>
            {name}
          </span>
        </td>
        <td className='break-words whitespace-pre-line align-middle max-w-xs'>
          {desc.length > 0 ? (
            <span
              className='cursor-pointer underline decoration-dotted'
              onClick={() => setDescModalOpen(true)}
              tabIndex={0}
              role='button'
              title='View full description'>
              {truncatedDesc}
            </span>
          ) : (
            <span className='text-base-content/50'>&mdash;</span>
          )}
        </td>
        <td>
          {category && (
            <span className='badge badge-outline badge-secondary'>
              {category.name}
            </span>
          )}
        </td>
        <td>
          <div className='flex items-center gap-2'>
            {isAdmin && (
              <>
                <button
                  className='btn btn-sm btn-ghost text-primary hover:bg-primary/10'
                  onClick={() => onEdit(task)}>
                  <Pencil className='h-4 w-4' />
                </button>
                <button
                  className='btn btn-sm btn-ghost text-error hover:bg-error/10'
                  onClick={() => onDelete(task)}>
                  <Trash2 className='h-4 w-4' />
                </button>
              </>
            )}
            {/* Comment button for all users */}
            <button
              className='btn btn-sm btn-ghost hover:bg-primary/10 text-info relative'
              onClick={async () => {
                setCommentModalOpen(true)
                setCommentsLoading(true)
                try {
                  const res = await fetch(
                    `${header}/api/tasks/${task.id}/comments`
                  )
                  const data = await res.json()
                  setComments(Array.isArray(data) ? data : [])
                } catch {
                  setComments([])
                } finally {
                  setCommentsLoading(false)
                }
              }}
              title='Comment on this task'>
              <MessageSquareText className='h-4 w-4' />
              {commentCount > 0 && (
                <span className='badge badge-info badge-sm absolute -top-2 -right-1 p-1'>
                  {commentCount}
                </span>
              )}
            </button>
          </div>
        </td>
        {/* Comment Modal */}
        {commentModalOpen && (
          <dialog
            className='modal modal-open'
            onClick={() => setCommentModalOpen(false)}>
            <div
              className='modal-box max-w-lg bg-base-100 p-6 flex flex-col'
              style={{ maxHeight: '90vh' }}
              onClick={(e) => e.stopPropagation()}>
              <h3 className='font-bold text-lg mb-2'>Comments</h3>
              <div
                className='flex-1 overflow-y-auto mb-4'
                style={{ maxHeight: '40vh' }}>
                {commentsLoading ? (
                  <div className='text-center text-base-content/60'>
                    Loading...
                  </div>
                ) : comments.length === 0 ? (
                  <div className='text-center text-base-content/60'>
                    No comments yet.
                  </div>
                ) : (
                  <ul className='space-y-4'>
                    {comments.map((c) => (
                      <li key={c.id} className='border-b pb-2'>
                        <div className='flex items-center gap-2 mb-1'>
                          <span className='font-semibold text-primary'>
                            {c.name}
                          </span>
                          <span className='text-xs text-base-content/50'>
                            {c.created_at
                              ? new Date(c.created_at).toLocaleString()
                              : ''}
                          </span>
                        </div>
                        <div className='whitespace-pre-line text-base-content'>
                          {language === 'es' && c.comment_es
                            ? c.comment_es
                            : c.comment}
                        </div>
                        {c.image_url && (
                          <div className='mt-2'>
                            <img
                              src={header + c.image_url}
                              alt='Comment attachment'
                              className='max-h-32 rounded border'
                            />
                          </div>
                        )}
                      </li>
                    ))}
                  </ul>
                )}
              </div>
              {/* Input bar at bottom */}
              <form
                className='flex flex-col gap-2 border-t pt-4'
                onSubmit={async (e) => {
                  e.preventDefault()
                  setCommentSubmitting(true)
                  setCommentError('')
                  setCommentSuccess('')
                  try {
                    let imageUrl = ''
                    if (commentImage) {
                      // Compress image before upload
                      const compressedFile = await imageCompression(
                        commentImage,
                        {
                          maxSizeMB: 1,
                          maxWidthOrHeight: 1200,
                          useWebWorker: true
                        }
                      )
                      // Upload image to backend
                      const formData = new FormData()
                      formData.append('file', compressedFile)
                      const res = await fetch(`${header}/api/upload`, {
                        method: 'POST',
                        body: formData
                      })
                      const data = await res.json()
                      imageUrl = data.url
                    }

                    const res = await fetch(
                      `${header}/api/tasks/${task.id}/comments`,
                      {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                          name: commentName,
                          comment: commentText,
                          image_url: imageUrl
                        })
                      }
                    )
                    if (!res.ok) {
                      const data = await res.json()
                      throw new Error(data.error || 'Failed to submit comment')
                    }
                    setCommentSuccess('Comment submitted!')
                    setCommentName('')
                    setCommentText('')
                    setCommentImage(null)
                    // Reload comments
                    setCommentsLoading(true)
                    const res2 = await fetch(
                      `${header}/api/tasks/${task.id}/comments`
                    )
                    const data2 = await res2.json()
                    setComments(Array.isArray(data2) ? data2 : [])
                    setCommentsLoading(false)
                  } catch (err) {
                    setCommentError(err.message || 'Failed to submit comment')
                  } finally {
                    setCommentSubmitting(false)
                    // Update comment count after submit
                    try {
                      const res = await fetch(
                        `${header}/api/tasks/${task.id}/comments`
                      )
                      const data = await res.json()
                      setCommentCount(Array.isArray(data) ? data.length : 0)
                    } catch {
                      setCommentCount(0)
                    }
                  }
                }}>
                <div className='flex gap-2'>
                  <input
                    className='input input-bordered flex-1'
                    placeholder='Your name'
                    value={commentName}
                    onChange={(e) => setCommentName(e.target.value)}
                    required
                  />
                  <input
                    type='file'
                    accept='image/*'
                    className='file-input file-input-bordered max-w-xs'
                    onChange={(e) => setCommentImage(e.target.files[0])}
                  />
                </div>
                <textarea
                  className='textarea textarea-bordered w-full'
                  placeholder='Your comment'
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  required
                  rows={2}
                />
                {commentError && (
                  <div className='text-error'>{commentError}</div>
                )}
                {commentSuccess && (
                  <div className='text-success'>{commentSuccess}</div>
                )}
                <div className='modal-action flex gap-2'>
                  <button
                    type='button'
                    className='btn btn-secondary'
                    onClick={() => setCommentModalOpen(false)}>
                    Close
                  </button>
                  <button
                    type='submit'
                    className='btn btn-info'
                    disabled={commentSubmitting}>
                    {commentSubmitting ? 'Submitting...' : 'Submit'}
                  </button>
                </div>
              </form>
            </div>
          </dialog>
        )}
      </tr>
      {/* Description Modal */}
      {descModalOpen && (
        <dialog
          className='modal modal-open'
          onClick={() => setDescModalOpen(false)}>
          <div
            className='modal-box max-w-lg bg-base-100 p-6'
            onClick={(e) => e.stopPropagation()}>
            <h3 className='font-bold text-lg mb-2'>Description</h3>
            <div className='mb-4 whitespace-pre-line text-base-content'>
              {desc}
            </div>
            <div className='modal-action'>
              <button
                className='btn btn-secondary'
                onClick={() => setDescModalOpen(false)}>
                Close
              </button>
            </div>
          </div>
        </dialog>
      )}
    </>
  )
}
