#!/usr/bin/env node

/**
 * Script de verificación de configuración del Frontend
 * Verifica que todas las variables de entorno estén correctamente configuradas
 */

import { readFileSync, existsSync } from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

// Colores para la consola
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
};

const print = (message, color = 'reset') => {
  console.log(`${colors[color]}${message}${colors.reset}`);
};

const printHeader = (title) => {
  console.log('\n' + '='.repeat(60));
  print(`  ${title}`, 'blue');
  console.log('='.repeat(60) + '\n');
};

// Variables requeridas
const requiredVars = [
  'VITE_API_BASE',
  'VITE_FIREBASE_API_KEY',
  'VITE_FIREBASE_AUTH_DOMAIN',
  'VITE_FIREBASE_PROJECT_ID',
  'VITE_FIREBASE_APP_ID',
];

// Valores placeholder que indican que no se ha configurado
const placeholders = [
  'tu-servicio',
  'tu-api-key',
  'tu-proyecto',
  'tu-app-id',
];

const checkEnvFile = () => {
  const envPath = join(__dirname, '.env');
  
  if (!existsSync(envPath)) {
    print('❌ El archivo .env no existe', 'red');
    print('   Ejecuta: cp .env.example .env', 'yellow');
    return false;
  }
  
  print('✅ El archivo .env existe', 'green');
  return true;
};

const parseEnvFile = () => {
  const envPath = join(__dirname, '.env');
  const envContent = readFileSync(envPath, 'utf-8');
  const env = {};
  
  envContent.split('\n').forEach(line => {
    line = line.trim();
    if (line && !line.startsWith('#')) {
      const [key, ...valueParts] = line.split('=');
      if (key && valueParts.length > 0) {
        env[key.trim()] = valueParts.join('=').trim();
      }
    }
  });
  
  return env;
};

const checkVariables = (env) => {
  let allConfigured = true;
  let hasErrors = false;
  
  print('\n📋 Verificando variables de entorno:\n');
  
  requiredVars.forEach(varName => {
    const value = env[varName];
    
    if (!value) {
      print(`❌ ${varName}: NO CONFIGURADA`, 'red');
      hasErrors = true;
      allConfigured = false;
    } else {
      // Verificar si es un placeholder
      const isPlaceholder = placeholders.some(placeholder => 
        value.toLowerCase().includes(placeholder)
      );
      
      if (isPlaceholder) {
        print(`⚠️  ${varName}: PLACEHOLDER (necesita configuración real)`, 'yellow');
        print(`   Valor actual: ${value}`, 'yellow');
        allConfigured = false;
      } else {
        print(`✅ ${varName}: CONFIGURADA`, 'green');
      }
    }
  });
  
  return { allConfigured, hasErrors };
};

const checkFirebaseConfig = (env) => {
  print('\n🔥 Verificando configuración de Firebase:\n');
  
  const firebaseVars = [
    'VITE_FIREBASE_API_KEY',
    'VITE_FIREBASE_AUTH_DOMAIN',
    'VITE_FIREBASE_PROJECT_ID',
    'VITE_FIREBASE_APP_ID',
  ];
  
  let allValid = true;
  
  firebaseVars.forEach(varName => {
    const value = env[varName];
    
    if (!value || placeholders.some(p => value.toLowerCase().includes(p))) {
      print(`❌ ${varName}: Necesita configuración`, 'red');
      allValid = false;
    }
  });
  
  if (allValid) {
    print('✅ Configuración de Firebase parece correcta', 'green');
  } else {
    print('\n⚠️  Para obtener las credenciales de Firebase:', 'yellow');
    print('   1. Ve a https://console.firebase.google.com/', 'yellow');
    print('   2. Selecciona tu proyecto', 'yellow');
    print('   3. Ve a Configuración del proyecto (⚙️)', 'yellow');
    print('   4. En "Tus aplicaciones", copia los valores de configuración', 'yellow');
  }
  
  return allValid;
};

const checkBackendUrl = (env) => {
  print('\n🌐 Verificando URL del Backend:\n');
  
  const apiBase = env.VITE_API_BASE;
  
  if (!apiBase) {
    print('❌ VITE_API_BASE no está configurada', 'red');
    return false;
  }
  
  if (placeholders.some(p => apiBase.toLowerCase().includes(p))) {
    print('❌ VITE_API_BASE contiene un placeholder', 'red');
    print(`   Valor actual: ${apiBase}`, 'yellow');
    print('\n⚠️  Para configurar la URL del backend:', 'yellow');
    print('   1. Ve a https://console.cloud.google.com/', 'yellow');
    print('   2. Navega a Cloud Run', 'yellow');
    print('   3. Selecciona tu servicio', 'yellow');
    print('   4. Copia la URL (sin barra final "/")', 'yellow');
    return false;
  }
  
  if (!apiBase.startsWith('http://') && !apiBase.startsWith('https://')) {
    print('⚠️  La URL del backend debería comenzar con http:// o https://', 'yellow');
    print(`   Valor actual: ${apiBase}`, 'yellow');
    return false;
  }
  
  if (apiBase.endsWith('/')) {
    print('⚠️  La URL del backend no debería terminar con "/"', 'yellow');
    print(`   Valor actual: ${apiBase}`, 'yellow');
    print('   Remueve la barra final', 'yellow');
    return false;
  }
  
  print(`✅ URL del backend configurada: ${apiBase}`, 'green');
  return true;
};

const checkDependencies = () => {
  print('\n📦 Verificando dependencias:\n');
  
  const nodeModulesPath = join(__dirname, 'node_modules');
  
  if (!existsSync(nodeModulesPath)) {
    print('❌ node_modules no existe', 'red');
    print('   Ejecuta: npm install', 'yellow');
    return false;
  }
  
  print('✅ Dependencias instaladas', 'green');
  return true;
};

const printNextSteps = (allConfigured, hasErrors) => {
  print('\n\n' + '='.repeat(60));
  print('  PRÓXIMOS PASOS', 'magenta');
  print('='.repeat(60) + '\n');
  
  if (hasErrors || !allConfigured) {
    print('⚠️  Configuración incompleta. Acciones requeridas:\n', 'yellow');
    
    if (hasErrors) {
      print('1. Edita el archivo .env y configura todas las variables', 'yellow');
    } else if (!allConfigured) {
      print('1. Reemplaza los valores placeholder en .env con tus credenciales reales', 'yellow');
    }
    
    print('2. Ejecuta este script nuevamente: node verificar-config.js', 'yellow');
    print('3. Una vez configurado, ejecuta: npm run dev\n', 'yellow');
  } else {
    print('✅ ¡Configuración completa!\n', 'green');
    print('Puedes iniciar el servidor de desarrollo:', 'green');
    print('  npm run dev\n', 'green');
    print('El servidor se iniciará en: http://localhost:8080\n', 'green');
  }
  
  print('📚 Para más información, consulta:', 'blue');
  print('   - CONFIGURACION.md', 'blue');
  print('   - DIAGNOSTICO_Y_SOLUCIONES.md\n', 'blue');
};

// Función principal
const main = () => {
  printHeader('VERIFICADOR DE CONFIGURACIÓN - FRONTEND');
  
  print('Este script verifica que todas las variables de entorno', 'blue');
  print('estén correctamente configuradas para el proyecto.\n', 'blue');
  
  // 1. Verificar que existe .env
  const envExists = checkEnvFile();
  if (!envExists) {
    printNextSteps(false, true);
    process.exit(1);
  }
  
  // 2. Leer variables
  let env;
  try {
    env = parseEnvFile();
  } catch (error) {
    print(`❌ Error al leer .env: ${error.message}`, 'red');
    process.exit(1);
  }
  
  // 3. Verificar variables
  const { allConfigured, hasErrors } = checkVariables(env);
  
  // 4. Verificar Firebase
  const firebaseOk = checkFirebaseConfig(env);
  
  // 5. Verificar Backend URL
  const backendOk = checkBackendUrl(env);
  
  // 6. Verificar dependencias
  const depsOk = checkDependencies();
  
  // 7. Resultado final
  const allOk = allConfigured && firebaseOk && backendOk && depsOk;
  
  printNextSteps(allOk, hasErrors);
  
  process.exit(allOk ? 0 : 1);
};

// Ejecutar
main();

