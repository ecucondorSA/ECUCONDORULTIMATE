#!/bin/bash

echo "🚀 Deploying EcuCondor to Railway..."

# Verificar autenticación
if ! railway whoami > /dev/null 2>&1; then
    echo "❌ No estás autenticado en Railway. Ejecuta 'railway login' primero."
    exit 1
fi

echo "✅ Autenticado en Railway"

# Verificar que estamos en el proyecto correcto
echo "📋 Estado del proyecto:"
railway status

# Intentar deployment con diferentes estrategias
echo "🔄 Intentando deployment..."

# Estrategia 1: Deployment directo
railway up --detach 2>/dev/null || {
    echo "⚠️ Deployment directo falló, intentando con servicio específico..."
    
    # Estrategia 2: Con servicio específico
    railway up --service ecucondor --detach 2>/dev/null || {
        echo "⚠️ Servicio 'ecucondor' no existe, intentando crear..."
        
        # Estrategia 3: Deploy desde GitHub
        echo "🔗 Conectando repositorio GitHub..."
        echo "Necesitarás configurar el deployment desde el dashboard web de Railway"
        echo "Repositorio: https://github.com/REINA-08/ECUCONDORULTIMATE"
        echo "Carpeta: ecucondor-app"
        
        return 1
    }
}

echo "✅ Deployment iniciado!"
echo "🌐 Puedes monitorear el progreso en: https://railway.app/dashboard"