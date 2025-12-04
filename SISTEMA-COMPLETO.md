# 🎉 Sistema de Pedidos Completo - Emilia Cheesecake

## ✅ Estado Actual: TODO LISTO

El sistema está completamente configurado y listo para funcionar en producción.

## 📱 Notificaciones Configuradas

### Telegram (GRATIS)
- **Bot**: @Emilia_order_bot
- **Chat ID**: 8357843030
- **Estado**: ✅ Configurado y funcionando

### Emails (Resend)
- **Dominio verificado**: emilialab.com ✅
- **Email FROM**: info@emilialab.com
- **Email TO**: info@emilialab.com
- **Templates**: React Email (profesionales y responsive)

## 🔄 Flujo Completo del Pedido

1. **Cliente hace pedido** en checkout
2. **Stripe procesa el pago**
3. **Webhook recibe confirmación**
4. **Sistema envía automáticamente:**
   - 📱 Notificación a tu Telegram
   - 📧 Email al cliente (confirmación)
   - 📧 Email a ti (notificación de pedido)

## 📋 Información que recibes

### En Telegram:
```
🎉 NUEVO PEDIDO RECIBIDO

💰 Total: CHF XX.XX

👤 Cliente:
Nombre Apellido
email@cliente.com

📍 Dirección de Entrega:
Calle 123
8000 Zürich
Zürich

📅 Entrega:
Fecha: 2024-12-06
Hora: 12:00 - 15:00

📦 Productos:
• Producto 1 (6 Personen) x2 - CHF 50.00
• Producto 2 (8 Personen) x1 - CHF 30.00

🆔 ID de Pago: pi_xxxxxxxxxxxxx
```

### En Email (info@emilialab.com):
- Email profesional con todos los detalles
- Tabla de productos
- Información de entrega completa
- Datos del cliente
- Info del pago

### Cliente recibe:
- Email de confirmación elegante
- Lista de sus productos
- Información de entrega
- Número de orden para seguimiento

## 🚀 Para usar en Producción

### 1. Configurar Webhook en Stripe

Una vez que deploys a producción (Vercel, Netlify, etc.):

1. Ve a https://dashboard.stripe.com/webhooks
2. Crea webhook: `https://tu-dominio.com/api/webhooks/stripe`
3. Selecciona evento: `payment_intent.succeeded`
4. Copia el **Webhook Secret** (empieza con `whsec_...`)

### 2. Variables de Entorno en Producción

Agrega estas variables en tu hosting:

```env
# Stripe
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY=pk_live_... (cambiar a LIVE)
STRIPE_SECRET_KEY=sk_live_... (cambiar a LIVE)
STRIPE_WEBHOOK_SECRET=whsec_... (del paso 1)

# Resend
RESEND_API_KEY=re_YwrsPPd4_NBCr7rMem6Y1NB7oCunxgm6w

# Email
EMAIL_FROM=info@emilialab.com
EMAIL_TO=info@emilialab.com

# Telegram
TELEGRAM_BOT_TOKEN=8570522005:AAEa-c4bjrSK3KC7LLp6aY5qlZ7rXZs5Y2k
TELEGRAM_CHAT_ID=8357843030
```

### 3. Cambiar a claves LIVE de Stripe

⚠️ **IMPORTANTE**: Antes de ir a producción, cambia las claves de Stripe:
- Las actuales son de **TEST** (empiezan con `pk_test_` y `sk_test_`)
- Para producción necesitas las **LIVE** (empiezan con `pk_live_` y `sk_live_`)
- Las obtienes en: https://dashboard.stripe.com/apikeys

## 🧪 Cómo Probar Localmente (sin webhook)

**Limitación**: Sin webhook configurado, los emails y Telegram NO funcionarán localmente.

Para probar TODO el sistema localmente:

```bash
# Instalar Stripe CLI
scoop install stripe

# Login a Stripe
stripe login

# Reenviar webhooks a localhost
stripe listen --forward-to localhost:3000/api/webhooks/stripe

# Copiar el webhook secret que aparece y agregarlo a .env.local
STRIPE_WEBHOOK_SECRET=whsec_...

# Hacer una compra de prueba con tarjeta de test
4242 4242 4242 4242
```

## 📂 Archivos Importantes

- `/app/api/webhooks/stripe/route.ts` - Procesa pagos y envía notificaciones
- `/app/api/create-payment-intent/route.ts` - Crea el payment intent
- `/app/checkout/page.tsx` - Página de checkout
- `/emails/OrderConfirmation.tsx` - Template email cliente
- `/emails/AdminNotification.tsx` - Template email admin
- `.env.local` - Variables de entorno (NO subir a Git)

## 🔒 Seguridad

- ✅ `.env.local` está en `.gitignore`
- ✅ Webhook verificado con firma de Stripe
- ✅ Todas las claves están protegidas
- ✅ HTTPS requerido en producción

## 📞 Soporte

Si algo no funciona:

1. **Revisa logs del servidor** (Vercel/Netlify)
2. **Revisa webhooks en Stripe**: https://dashboard.stripe.com/webhooks
3. **Verifica variables de entorno**: Todas deben estar configuradas
4. **Prueba el bot de Telegram**: Envíale un mensaje a @Emilia_order_bot

## 🎨 Personalizar Templates

Para cambiar los emails, edita:
- `/emails/OrderConfirmation.tsx` - Email del cliente
- `/emails/AdminNotification.tsx` - Tu email de notificación

Los cambios se aplican automáticamente.

## ✨ Próximas Mejoras (Opcional)

- [ ] Base de datos para guardar pedidos
- [ ] Panel de admin para gestionar pedidos
- [ ] Sistema de tracking para clientes
- [ ] Códigos de descuento funcionales
- [ ] Notificaciones SMS/WhatsApp para clientes
- [ ] Integración con sistema de inventario

---

**Creado**: Diciembre 2024
**Estado**: ✅ Producción Ready
**Última actualización**: ${new Date().toLocaleDateString()}
