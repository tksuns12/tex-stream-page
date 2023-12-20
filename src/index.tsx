import ReactDOM from 'react-dom/client'
import React from 'react'
import App from './App'
import './input.css'
import {
  createBrowserRouter,
  Link,
  Outlet,
  RouterProvider,
} from 'react-router-dom'
import TestPage from './TestPage'

const router = createBrowserRouter([
  {
    path: '/',
    element: <App />,
    errorElement: <>error</>,
  },
  {
    path: 'test',
    element: <TestPage />,
  },
])
const root = ReactDOM.createRoot(document.getElementById('root')!)
root.render(<RouterProvider router={router} />)
