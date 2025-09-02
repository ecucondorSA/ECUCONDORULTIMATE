#!/bin/bash

# Lista de archivos que necesitan el import de logger
files=(
  "src/app/api/contact/route.ts"
  "src/app/api/health/route.ts"
  "src/app/api/newsletter/subscribe/route.ts"
  "src/app/api/price-locks/[lockId]/route.ts"
  "src/app/api/rates/[pair]/route.ts"
  "src/app/api/rates/[pair]/stream/route.ts"
  "src/app/api/rates/route.ts"
  "src/app/api/rates/stream/route.ts"
  "src/app/api/transactions/execute/route.ts"
  "src/app/api/users/[userId]/limits/route.ts"
  "src/app/api/users/[userId]/price-locks/route.ts"
  "src/components/common/ContactForm.tsx"
  "src/components/common/ErrorBoundary.tsx"
  "src/components/common/Header.tsx"
  "src/components/example/ModalExample/DefaultModal.tsx"
  "src/components/example/ModalExample/FormInModal.tsx"
  "src/components/example/ModalExample/FullScreenModal.tsx"
  "src/components/example/ModalExample/VerticallyCenteredModal.tsx"
  "src/components/form/form-elements/DefaultInputs.tsx"
  "src/components/form/form-elements/DropZone.tsx"
  "src/components/form/form-elements/FileInputExample.tsx"
  "src/components/form/form-elements/InputGroup.tsx"
  "src/components/form/form-elements/SelectInputs.tsx"
  "src/components/form/form-elements/ToggleSwitch.tsx"
  "src/components/landing/InlineCalculator.tsx"
  "src/components/user-profile/UserAddressCard.tsx"
  "src/components/user-profile/UserInfoCard.tsx"
  "src/components/user-profile/UserMetaCard.tsx"
  "src/hooks/useExchangeRates.ts"
  "src/lib/config/company.ts"
  "src/lib/examples/api-usage.ts"
  "src/lib/services/binance.ts"
  "src/lib/services/exchange-rates.ts"
  "src/lib/services/price-lock.ts"
  "src/lib/services/transaction-limits.ts"
  "src/services/exchangeRatesApi.ts"
  "src/services/newsletterApi.ts"
)

# Para cada archivo, agregar el import de logger si no existe
for file in "${files[@]}"; do
  if [ -f "$file" ]; then
    # Verificar si el archivo ya tiene el import
    if ! grep -q "import.*logger" "$file"; then
      echo "Adding logger import to $file"
      
      # Determinar la ruta relativa correcta para el import
      depth=$(echo "$file" | tr -cd '/' | wc -c)
      import_path=""
      
      case $depth in
        2) import_path="@/lib/utils/logger" ;;
        3) import_path="@/lib/utils/logger" ;;
        4) import_path="@/lib/utils/logger" ;;
        *) import_path="@/lib/utils/logger" ;;
      esac
      
      # Agregar el import al principio del archivo después de 'use client' o al inicio
      if grep -q "^'use client'" "$file"; then
        sed -i "/^'use client'/a\\
import { logger } from '$import_path';" "$file"
      else
        sed -i "1i\\
import { logger } from '$import_path';" "$file"
      fi
    fi
  else
    echo "File not found: $file"
  fi
done

echo "✅ Logger imports fixed!"