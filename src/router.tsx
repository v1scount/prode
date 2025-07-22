import { createBrowserRouter } from 'react-router'
import { AppLayout } from '@/components/layout/AppLayout'
import HomePage from './pages/home'
import Leaderboard from './pages/leaderboard'

export const router = createBrowserRouter([
  {
    path: '/',
    element: (
      <AppLayout>
        <HomePage />
      </AppLayout>
    ),
    id: 'home',
  },
  {
    path: '/leaderboard',
    element: (
      <AppLayout>
        <Leaderboard />
      </AppLayout>
    ),
    id: 'leaderboard',
  },
  // You can add more routes here later like settings
  {
    path: '/settings',
    element: (
      <AppLayout>
        <div className="p-8">
          <h1 className="text-2xl font-bold">Settings</h1>
          <p>Settings page coming soon...</p>
        </div>
      </AppLayout>
    ),
    id: 'settings',
  },
])