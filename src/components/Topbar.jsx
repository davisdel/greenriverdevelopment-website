import React from 'react'
import { Link } from 'react-router-dom'
import {
  Building2,
  ClipboardList,
  Home as HomeIcon,
  LogOut,
  User
} from 'lucide-react'

export default function Topbar({
  currentPageName,
  user,
  loading,
  onLogout,
  onLogin
}) {
  const isAdmin = user?.role === 'admin'

  return (
    <nav className='bg-base-100 border-b border-base-200 shadow-sm sticky top-0 z-50'>
      <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8'>
        <div className='flex justify-between items-center h-16'>
          <div className='flex items-center gap-8'>
            <Link to='/' className='flex items-center gap-2 group'>
              <div className='bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-lg shadow-md group-hover:shadow-lg transition-shadow'>
                <Building2 className='h-5 w-5' />
              </div>
              <span className='text-xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent'>
                TaskPro
              </span>
            </Link>

            <div className='hidden md:flex items-center gap-1'>
              <Link to='/'>
                <button
                  className={`btn btn-sm ${currentPageName === 'Home' ? 'btn-primary' : 'btn-ghost'} gap-2`}>
                  <HomeIcon className='h-4 w-4' />
                  Job Sites
                </button>
              </Link>

              {isAdmin && (
                <Link to='/lots'>
                  <button
                    className={`btn btn-sm ${currentPageName === 'Lots' ? 'btn-primary' : 'btn-ghost'} gap-2`}>
                    <ClipboardList className='h-4 w-4' />
                    Lots for Sale
                  </button>
                </Link>
              )}
            </div>
          </div>

          <div className='flex items-center gap-2'>
            {loading ? (
              <div className='h-9 w-20 bg-slate-200 animate-pulse rounded-md' />
            ) : user ? (
              <>
                <div className='hidden sm:flex items-center gap-2 px-3 py-1.5 bg-slate-100 rounded-lg'>
                  <User className='h-4 w-4 text-slate-600' />
                  <span className='text-sm font-medium text-slate-700'>
                    {user.email}
                  </span>
                  {isAdmin && (
                    <span className='ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full'>
                      Admin
                    </span>
                  )}
                </div>
                <button
                  onClick={onLogout}
                  className='btn btn-outline btn-sm gap-2'>
                  <LogOut className='h-4 w-4' />
                  <span className='hidden sm:inline'>Logout</span>
                </button>
              </>
            ) : (
              <button onClick={onLogin} className='btn btn-primary btn-sm'>
                Admin Login
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
