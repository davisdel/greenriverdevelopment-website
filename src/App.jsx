import './index.css'
import { createBrowserRouter, RouterProvider } from 'react-router-dom'

// Pages
import Home from './pages/Home.jsx'
import Lots from './pages/Lots.jsx'
import Tasks from './pages/Tasks.jsx'

function App() {

  const router = createBrowserRouter([
    {
      path: '/', // default page on load
      element: <Home />
    },
    {
      path: '/lots',
      element: <Lots />
    },
    {
      path: '/tasks/:id',
      element: <Tasks />
    },
    {
      path: '*',
      children: [
        {
          path: '*',
          element: <Home />
        }
      ]
    },
  ])

  return (
    <RouterProvider router={router} />
  )
}

export default App
