import React, { useState } from 'react'
import { Pencil, Trash2, Image as ImageIcon } from 'lucide-react'

export default function TaskRow({
  task,
  category,
  isAdmin,
  onToggleComplete,
  onEdit,
  onDelete,
  onImageClick
}) {
  const [descModalOpen, setDescModalOpen] = useState(false)
  const header = import.meta.env.DEV
    ? 'http://localhost:4000'
    : 'https://taskpro.davisdel.com'

  // Truncate description if too long
  const MAX_DESC = 80
  const desc = task.description || ''
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
            title={task.name}>
            {task.name}
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
        {isAdmin && (
          <td>
            <div className='flex items-center gap-2'>
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
            </div>
          </td>
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
