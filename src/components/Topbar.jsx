import React, { useState, useRef } from 'react'
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
  onLogin, // still used for parent update after login/register
  onToggle
}) {
  const isAdmin = user?.role === 'admin'
  // Language toggle state
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('taskpro_language') || 'en'
  })
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const [tab, setTab] = useState('login')
  const [loginForm, setLoginForm] = useState({ username: '', password: '' })
  const [registerForm, setRegisterForm] = useState({
    username: '',
    password: '',
    register_code: ''
  })
  const [formError, setFormError] = useState('')
  const [formLoading, setFormLoading] = useState(false)
  const dropdownRef = useRef(null)

  const header = import.meta.env.DEV
    ? 'http://localhost:4000'
    : 'https://taskpro.davisdel.com'

  // Close dropdown on outside click
  React.useEffect(() => {
    if (!dropdownOpen) return
    function handleClick(e) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false)
        setFormError('')
      }
    }
    document.addEventListener('mousedown', handleClick)
    return () => document.removeEventListener('mousedown', handleClick)
  }, [dropdownOpen])

  // Backend integration for login
  async function handleLoginSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      const res = await fetch(`${header}/api/admin/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(loginForm),
        credentials: 'include' // allow session cookie to be set
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Login failed')
      setDropdownOpen(false)
      setLoginForm({ username: '', password: '' })
      // Set user session in parent
      if (onLogin)
        onLogin('login', {
          ...data,
          role: 'admin',
          email: data.username // for display in topbar
        })
    } catch (err) {
      setFormError(err.message || 'Login failed')
    } finally {
      setFormLoading(false)
    }
  }

  // Backend integration for register
  async function handleRegisterSubmit(e) {
    e.preventDefault()
    setFormLoading(true)
    setFormError('')
    try {
      const res = await fetch(`${header}/api/admin/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(registerForm),
        credentials: 'include' // allow session cookie to be set if backend does this
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Registration failed')
      setDropdownOpen(false)
      setRegisterForm({ username: '', password: '', register_code: '' })
      // Set user session in parent
      if (onLogin)
        onLogin('register', {
          ...data,
          role: 'admin',
          email: data.username // for display in topbar
        })
    } catch (err) {
      setFormError(err.message || 'Registration failed')
    } finally {
      setFormLoading(false)
    }
  }

  // Proper toggler handler
  const handleToggle = () => {
    const newLang = lang === 'en' ? 'es' : 'en'
    setLang(newLang)
    localStorage.setItem('taskpro_language', newLang)
    if (onToggle) onToggle(newLang)
  }

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

          <div className='flex items-center gap-4'>
            {/* Language Toggle */}
            <div className='form-control flex flex-row items-center gap-2'>
              <span className='text-xs font-medium'>EN</span>
              <input
                type='checkbox'
                className='toggle toggle-primary'
                checked={lang === 'es'}
                onChange={handleToggle}
                aria-label='Toggle language'
              />
              <span className='text-xs font-medium'>ES</span>
            </div>
            {/* ...existing code for user/login/logout... */}
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
              <div className='relative' ref={dropdownRef}>
                <button
                  onClick={() => setDropdownOpen((v) => !v)}
                  className='btn btn-primary btn-sm'
                  type='button'>
                  Admin Login
                </button>
                {dropdownOpen && (
                  <div className='absolute right-0 mt-2 w-80 bg-base-100 border border-base-200 rounded-lg shadow-lg z-50 p-4'>
                    <div className='flex mb-4'>
                      <button
                        className={`flex-1 py-2 font-semibold rounded-tl-lg ${tab === 'login' ? 'bg-primary text-white' : 'bg-base-200 text-base-content'}`}
                        onClick={() => {
                          setTab('login')
                          setFormError('')
                        }}
                        type='button'>
                        Login
                      </button>
                      <button
                        className={`flex-1 py-2 font-semibold rounded-tr-lg ${tab === 'register' ? 'bg-primary text-white' : 'bg-base-200 text-base-content'}`}
                        onClick={() => {
                          setTab('register')
                          setFormError('')
                        }}
                        type='button'>
                        Register
                      </button>
                    </div>
                    {tab === 'login' ? (
                      <form className='space-y-3' onSubmit={handleLoginSubmit}>
                        <input
                          className='input input-bordered w-full'
                          placeholder='Username'
                          value={loginForm.username}
                          onChange={(e) =>
                            setLoginForm((f) => ({
                              ...f,
                              username: e.target.value
                            }))
                          }
                          required
                        />
                        <input
                          className='input input-bordered w-full'
                          placeholder='Password'
                          type='password'
                          value={loginForm.password}
                          onChange={(e) =>
                            setLoginForm((f) => ({
                              ...f,
                              password: e.target.value
                            }))
                          }
                          required
                        />
                        {formError && (
                          <div className='text-error text-sm'>{formError}</div>
                        )}
                        <button
                          className='btn btn-primary w-full mt-2'
                          type='submit'
                          disabled={formLoading}>
                          {formLoading ? 'Logging in...' : 'Login'}
                        </button>
                      </form>
                    ) : (
                      <form
                        className='space-y-3'
                        onSubmit={handleRegisterSubmit}>
                        <input
                          className='input input-bordered w-full'
                          placeholder='Username'
                          value={registerForm.username}
                          onChange={(e) =>
                            setRegisterForm((f) => ({
                              ...f,
                              username: e.target.value
                            }))
                          }
                          required
                        />
                        <input
                          className='input input-bordered w-full'
                          placeholder='Password'
                          type='password'
                          value={registerForm.password}
                          onChange={(e) =>
                            setRegisterForm((f) => ({
                              ...f,
                              password: e.target.value
                            }))
                          }
                          required
                        />
                        <input
                          className='input input-bordered w-full'
                          placeholder='Registration Code'
                          value={registerForm.register_code}
                          onChange={(e) =>
                            setRegisterForm((f) => ({
                              ...f,
                              register_code: e.target.value
                            }))
                          }
                          required
                        />
                        {formError && (
                          <div className='text-error text-sm'>{formError}</div>
                        )}
                        <button
                          className='btn btn-primary w-full mt-2'
                          type='submit'
                          disabled={formLoading}>
                          {formLoading ? 'Registering...' : 'Register'}
                        </button>
                      </form>
                    )}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  )
}
