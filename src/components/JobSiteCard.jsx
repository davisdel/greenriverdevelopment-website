import React from 'react'
import { Building2, CheckCircle2, AlertCircle } from 'lucide-react'
import { motion } from 'framer-motion'

export default function JobSiteCard({ site, taskCounts, onClick }) {
  const header =
    import.meta.env.DEV
      ? 'http://localhost:4000'
      : 'https://taskpro.davisdel.com'

  const totalTasks = Object.values(taskCounts).reduce(
    (sum, count) => sum + count.total,
    0
  )
  const completedTasks = Object.values(taskCounts).reduce(
    (sum, count) => sum + count.completed,
    0
  )
  const progress = totalTasks > 0 ? (completedTasks / totalTasks) * 100 : 0

  return (
    <div
      className='card bg-base-100 shadow-lg cursor-pointer hover:shadow-xl transition-all border-primary border-2'
      onClick={onClick}>
      <div className='relative h-48 bg-gradient-to-br from-primary/10 to-base-300 overflow-hidden'>
        {site.image_url ? (
          <img
            src={header + site.image_url}
            alt={site.name}
            className='w-full h-full object-cover'
          />
        ) : (
          <div className='w-full h-full flex items-center justify-center'>
            <Building2 className='h-16 w-16 text-secondary' />
          </div>
        )}
        {totalTasks > 0 && (
          <div className='absolute top-3 right-3 bg-primary/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-lg'>
            <span className='text-sm font-semibold text-white'>
              {completedTasks}/{totalTasks}
            </span>
          </div>
        )}
      </div>
      <div className='card-body p-5'>
        <h3 className='text-xl font-bold text-primary mb-3'>{site.name}</h3>
        {totalTasks > 0 ? (
          <>
            <div className='mb-3'>
              <div className='flex justify-between text-xs text-secondary mb-1'>
                <span>Progress</span>
                <span>{Math.round(progress)}%</span>
              </div>
              <div className='h-2 bg-base-200 rounded-full overflow-hidden'>
                <div
                  className='h-full bg-gradient-to-r from-primary to-primary-focus transition-all duration-500'
                  style={{ width: `${progress}%` }}
                />
              </div>
            </div>
            <div className='space-y-2'>
              {Object.entries(taskCounts).map(([categoryName, counts]) => (
                <div
                  key={categoryName}
                  className='flex items-center justify-between text-sm'>
                  <span className='text-secondary'>{categoryName}</span>
                  <div className='flex items-center gap-2'>
                    <span
                      className={`badge badge-outline gap-1 ${counts.completed === counts.total ? 'badge-success' : 'badge-warning'}`}>
                      {counts.completed === counts.total ? (
                        <CheckCircle2 className='h-3 w-3 text-success' />
                      ) : (
                        <AlertCircle className='h-3 w-3 text-warning' />
                      )}
                      {counts.completed}/{counts.total}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </>
        ) : (
          <p className='text-base-content/50 text-sm'>No tasks yet</p>
        )}
      </div>
    </div>
  )
}
