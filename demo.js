import { signUp, signIn, signOut, getUser } from './lib/supabase.js'

async function demoAuth() {
  console.log('🎯 Demo de Autenticación ECUCONDORULTIMATE\n')

  try {
    // 1. Registro de usuario
    console.log('1️⃣ Registrando usuario...')
    const testEmail = 'test@example.com'
    const testPassword = 'password123'
    
    const { data: signUpData, error: signUpError } = await signUp(testEmail, testPassword)
    
    if (signUpError) {
      console.log('⚠️ Error o usuario ya existe:', signUpError.message)
    } else {
      console.log('✅ Usuario registrado correctamente')
      console.log('📧 Revisa el email para confirmar la cuenta')
    }

    // 2. Intentar login
    console.log('\n2️⃣ Intentando login...')
    const { data: signInData, error: signInError } = await signIn(testEmail, testPassword)
    
    if (signInError) {
      console.log('⚠️ Error de login:', signInError.message)
      console.log('💡 Tip: Confirma tu email primero')
    } else {
      console.log('✅ Login exitoso!')
      console.log('👤 Usuario:', signInData.user.email)
    }

    // 3. Verificar usuario actual
    console.log('\n3️⃣ Verificando usuario actual...')
    const { user } = await getUser()
    if (user) {
      console.log('✅ Usuario logueado:', user.email)
      console.log('🆔 ID:', user.id)
    } else {
      console.log('ℹ️ No hay usuario logueado')
    }

  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

console.log('🚀 Ejecutando demo de autenticación...')
demoAuth()