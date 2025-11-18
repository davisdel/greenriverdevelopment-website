// freaky auth stuff that isnt used yet

import React, { useState, useEffect } from 'react'
import Topbar from './components/Topbar'

export default function Layout({ children, currentPageName }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    checkAuth()
  }, [])

  const checkAuth = async () => {
    try {
      const currentUser = await base44.auth.me()
      setUser(currentUser)
    } catch (error) {
      setUser(null)
    } finally {
      setLoading(false)
    }
  }

  const handleLogout = () => {
    base44.auth.logout()
  }

  const handleLogin = () => {
    base44.auth.redirectToLogin()
  }

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-slate-100'>
      <Topbar
        currentPageName={currentPageName}
        user={user}
        loading={loading}
        onLogout={handleLogout}
        onLogin={handleLogin}
      />
      <main>{children}</main>
      <footer className='bg-white border-t border-slate-200 mt-16'>
        <div className='max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6'>
          <p className='text-center text-slate-600 text-sm'>
            © 2024 TaskPro. General Contractor Task Management System.
          </p>
        </div>
      </footer>
    </div>
  )
}
