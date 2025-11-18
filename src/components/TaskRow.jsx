import React, { useState } from 'react'
import { Pencil, Trash2, Image as ImageIcon } from 'lucide-react'

export default function TaskRow({
  task,
  category,
  isAdmin,
  onToggleComplete,
  onEdit,
  onDelete
}) {
  return (
    <tr className={task.completed ? 'bg-success/10' : ''}>
      <td className='w-12'>
        <input
          type='checkbox'
          className='checkbox checkbox-success'
          checked={task.completed}
          onChange={() => onToggleComplete(task)}
        />
      </td>
      <td>
        {task.image_url ? (
          <div className='w-16 h-16 rounded-lg overflow-hidden border border-base-200'>
            <img
              src={task.image_url}
              alt='Task'
              className='w-full h-full object-cover'
            />
          </div>
        ) : (
          <div className='w-16 h-16 rounded-lg border-2 border-dashed border-base-300 flex items-center justify-center'>
            <ImageIcon className='h-6 w-6 text-base-content/40' />
          </div>
        )}
      </td>
      <td>
        <span
          className={`font-medium ${task.completed ? 'line-through text-base-content/50' : 'text-base-content'}`}>
          {task.name}
        </span>
      </td>
      <td>
        <span className='text-base-content/60 text-sm'>
          {task.description || '\u2014'}
        </span>
      </td>
      <td>
        {category && (
          <span className='badge badge-outline badge-info'>
            {category.name}
          </span>
        )}
      </td>
      {isAdmin && (
        <td>
          <div className='flex items-center gap-2'>
            <button
              className='btn btn-sm btn-ghost'
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
  )
}
