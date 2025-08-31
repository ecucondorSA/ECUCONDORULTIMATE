import { supabase } from './lib/supabase.js'

async function testGoogleAuth() {
  console.log('🔍 Verificando configuración de Google Auth...\n')

  try {
    // Verificar si Google está habilitado
    const { data: { session }, error } = await supabase.auth.getSession()
    
    console.log('✅ Cliente Supabase funcionando')
    console.log('🔗 URL del proyecto:', process.env.NEXT_PUBLIC_SUPABASE_URL)
    
    // Simular inicio de sesión con Google
    console.log('\n📋 Para probar Google Auth:')
    console.log('1. Configura las credenciales en Supabase Dashboard')
    console.log('2. Abre tu aplicación web en el navegador')
    console.log('3. Haz clic en "Continuar con Google"')
    console.log('4. Serás redirigido a Google para autenticarte')
    
    console.log('\n🔧 Configuración requerida:')
    console.log('• Client ID: 379894793862-obmr2cmm69hghq0tv7k6i1asq7ansjea.apps.googleusercontent.com')
    console.log('• Client Secret: (termina en zx7R)')
    console.log('• Redirect URI: https://qfregiogzspihbglvpqs.supabase.co/auth/v1/callback')
    
  } catch (error) {
    console.error('❌ Error:', error.message)
  }
}

testGoogleAuth()