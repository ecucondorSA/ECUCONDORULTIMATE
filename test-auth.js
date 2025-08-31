import dotenv from 'dotenv'
dotenv.config({ path: '.env.local' })

import { supabase, signUp, signIn, getUser } from './lib/supabase.js'

async function testSupabaseConnection() {
  console.log('🧪 Probando conexión con Supabase...')
  
  // Debug: mostrar variables de entorno
  console.log('URL:', process.env.NEXT_PUBLIC_SUPABASE_URL)
  console.log('Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Cargada' : 'No cargada')
  
  try {
    // Test 1: Conexión básica
    console.log('\n1. Probando conexión básica...')
    const { data, error } = await supabase.from('profiles').select('count')
    if (error && !error.message.includes('relation "public.profiles" does not exist')) {
      console.log('❌ Error de conexión:', error.message)
      return
    }
    console.log('✅ Conexión establecida correctamente')

    // Test 2: Verificar usuario actual
    console.log('\n2. Verificando usuario actual...')
    const { user } = await getUser()
    if (user) {
      console.log('✅ Usuario logueado:', user.email)
    } else {
      console.log('ℹ️  No hay usuario logueado (normal)')
    }

    // Test 3: Verificar configuración
    console.log('\n3. Verificando configuración...')
    console.log('📍 URL:', process.env.NEXT_PUBLIC_SUPABASE_URL?.substring(0, 30) + '...')
    console.log('🔑 Anon Key:', process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'Configurada' : 'No configurada')
    console.log('🔐 Service Key:', process.env.SUPABASE_SERVICE_ROLE_KEY ? 'Configurada' : 'No configurada')

    console.log('\n✅ ¡Configuración de Supabase completada!')
    console.log('\n📝 Próximos pasos:')
    console.log('1. Ejecutar el SQL schema en el editor de Supabase')
    console.log('2. Configurar las URLs de redirect en Authentication > Settings')
    console.log('3. Probar el registro de usuarios')

  } catch (error) {
    console.log('❌ Error:', error.message)
  }
}

// Ejecutar si el archivo se llama directamente
if (import.meta.url === `file://${process.argv[1]}`) {
  testSupabaseConnection()
}

export { testSupabaseConnection }