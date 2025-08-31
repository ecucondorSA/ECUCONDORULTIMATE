import { useState } from 'react'
import LoginForm from './LoginForm'
import RegisterForm from './RegisterForm'
import PasswordResetForm from './PasswordResetForm'

export default function AuthTabs({ onAuthSuccess }) {
  const [activeTab, setActiveTab] = useState('login')

  const tabs = [
    { id: 'login', label: 'Iniciar Sesión' },
    { id: 'register', label: 'Registrarse' },
    { id: 'reset', label: 'Recuperar' }
  ]

  const renderForm = () => {
    switch (activeTab) {
      case 'login':
        return <LoginForm onSuccess={onAuthSuccess} />
      case 'register':
        return <RegisterForm onSuccess={onAuthSuccess} />
      case 'reset':
        return <PasswordResetForm onSuccess={() => setActiveTab('login')} />
      default:
        return <LoginForm onSuccess={onAuthSuccess} />
    }
  }

  return (
    <div className="w-full max-w-md mx-auto bg-white rounded-lg shadow-md p-6">
      <div className="flex mb-6 border-b">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex-1 py-2 px-4 text-sm font-medium border-b-2 transition-colors ${
              activeTab === tab.id
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {renderForm()}

      <div className="mt-4 text-center text-sm text-gray-600">
        {activeTab === 'login' && (
          <p>
            ¿No tienes cuenta?{' '}
            <button
              onClick={() => setActiveTab('register')}
              className="text-blue-600 hover:underline"
            >
              Registrarse
            </button>
          </p>
        )}
        {activeTab === 'register' && (
          <p>
            ¿Ya tienes cuenta?{' '}
            <button
              onClick={() => setActiveTab('login')}
              className="text-blue-600 hover:underline"
            >
              Iniciar Sesión
            </button>
          </p>
        )}
        {activeTab !== 'reset' && (
          <p className="mt-2">
            ¿Olvidaste tu contraseña?{' '}
            <button
              onClick={() => setActiveTab('reset')}
              className="text-purple-600 hover:underline"
            >
              Recuperar
            </button>
          </p>
        )}
        {activeTab === 'reset' && (
          <p>
            <button
              onClick={() => setActiveTab('login')}
              className="text-blue-600 hover:underline"
            >
              Volver al inicio de sesión
            </button>
          </p>
        )}
      </div>
    </div>
  )
}