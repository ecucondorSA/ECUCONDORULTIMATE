// Script para activar/desactivar el modo de mantenimiento
// Uso: node maintenance-toggle.js [on|off]

const fs = require('fs');
const path = require('path');

const maintenanceFile = path.join(__dirname, '.maintenance');
const publicMaintenanceFile = path.join(__dirname, 'public', 'maintenance.html');
const sourceMaintenanceFile = path.join(__dirname, 'maintenance.html');

function enableMaintenance() {
  try {
    // Crear archivo de estado de mantenimiento
    fs.writeFileSync(maintenanceFile, new Date().toISOString());
    
    // Copiar la página de mantenimiento a public
    if (fs.existsSync(sourceMaintenanceFile)) {
      fs.copyFileSync(sourceMaintenanceFile, publicMaintenanceFile);
    }
    
    console.log('✅ Modo de mantenimiento ACTIVADO');
    console.log('📄 Página disponible en: /maintenance.html');
    console.log('🔧 Para desactivar: node maintenance-toggle.js off');
  } catch (error) {
    console.error('❌ Error activando mantenimiento:', error.message);
  }
}

function disableMaintenance() {
  try {
    // Eliminar archivo de estado
    if (fs.existsSync(maintenanceFile)) {
      fs.unlinkSync(maintenanceFile);
    }
    
    // Eliminar página de mantenimiento de public
    if (fs.existsSync(publicMaintenanceFile)) {
      fs.unlinkSync(publicMaintenanceFile);
    }
    
    console.log('✅ Modo de mantenimiento DESACTIVADO');
    console.log('🚀 Aplicación funcionando normalmente');
  } catch (error) {
    console.error('❌ Error desactivando mantenimiento:', error.message);
  }
}

function checkStatus() {
  const isMaintenanceMode = fs.existsSync(maintenanceFile);
  
  if (isMaintenanceMode) {
    const timestamp = fs.readFileSync(maintenanceFile, 'utf8');
    console.log('🔧 Modo de mantenimiento ACTIVO');
    console.log(`📅 Activado desde: ${new Date(timestamp).toLocaleString()}`);
  } else {
    console.log('✅ Aplicación funcionando normalmente');
  }
  
  return isMaintenanceMode;
}

// Main logic
const command = process.argv[2];

switch (command) {
  case 'on':
  case 'enable':
    enableMaintenance();
    break;
    
  case 'off':
  case 'disable':
    disableMaintenance();
    break;
    
  case 'status':
  case 'check':
    checkStatus();
    break;
    
  default:
    console.log('🔧 EcuCondor - Control de Mantenimiento');
    console.log('');
    console.log('Uso:');
    console.log('  node maintenance-toggle.js on     - Activar mantenimiento');
    console.log('  node maintenance-toggle.js off    - Desactivar mantenimiento');
    console.log('  node maintenance-toggle.js status - Ver estado actual');
    console.log('');
    checkStatus();
}