# 🚀 Deploy en Vercel - Guía Completa

## Paso 1: Crear Repositorio en GitHub

1. Ve a https://github.com/new
2. **Repository name**: `emilia-cheesecake`
3. **Description**: "E-commerce de cheesecakes artesanales con sistema de pedidos"
4. **Visibility**: Private (recomendado) o Public
5. **NO** marques "Initialize this repository with README" (ya tienes uno)
6. Click **"Create repository"**

## Paso 2: Conectar tu código local a GitHub

GitHub te mostrará comandos. Usa estos:

```bash
git remote add origin https://github.com/TU-USUARIO/emilia-cheesecake.git
git branch -M main
git push -u origin main
```

O copia y pega exactamente lo que GitHub te muestre.

## Paso 3: Deploy en Vercel

### 3.1 Crear cuenta / Login

1. Ve a https://vercel.com
2. Click **"Sign Up"** o **"Login"**
3. Elige **"Continue with GitHub"**
4. Autoriza Vercel a acceder a tus repos

### 3.2 Importar Proyecto

1. En el dashboard de Vercel, click **"Add New Project"**
2. Click **"Import"** en tu repo `emilia-cheesecake`
3. Vercel detectará automáticamente que es Next.js

### 3.3 Configurar Deploy

**Framework Preset**: Next.js (auto-detectado)
**Root Directory**: `./` (dejar como está)
**Build Command**: `next build` (auto-detectado)
**Output Directory**: `.next` (auto-detectado)

### 3.4 Variables de Entorno

Click en **"Environment Variables"** y agrega:

#### Stripe (IMPORTANTE: Usa claves LIVE para producción)

```
NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY
pk_live_... (cambiar de test a live)

STRIPE_SECRET_KEY
sk_live_... (cambiar de test a live)

STRIPE_WEBHOOK_SECRET
(dejarlo vacío por ahora, lo configuramos después)
```

#### Resend (Emails)

```
RESEND_API_KEY
re_YwrsPPd4_NBCr7rMem6Y1NB7oCunxgm6w
```

#### Email Configuration

```
EMAIL_FROM
info@emilialab.com

EMAIL_TO
info@emilialab.com
```

#### Telegram

```
TELEGRAM_BOT_TOKEN
8570522005:AAEa-c4bjrSK3KC7LLp6aY5qlZ7rXZs5Y2k

TELEGRAM_CHAT_ID
8357843030
```

### 3.5 Deploy

1. Click **"Deploy"**
2. Espera 2-3 minutos
3. ¡Listo! Vercel te dará una URL como: `https://emilia-cheesecake.vercel.app`

## Paso 4: Configurar Webhook de Stripe

### 4.1 Copiar tu URL de Vercel

Ejemplo: `https://emilia-cheesecake.vercel.app`

### 4.2 Crear Webhook en Stripe

1. Ve a https://dashboard.stripe.com/webhooks
2. Activa **"View live mode"** (toggle arriba a la derecha)
3. Click **"Add endpoint"**
4. **Endpoint URL**: `https://emilia-cheesecake.vercel.app/api/webhooks/stripe`
5. **Description**: "Emilia Cheesecake - Production"
6. Click **"Select events"**
7. Busca y selecciona: `payment_intent.succeeded`
8. Click **"Add endpoint"**

### 4.3 Copiar Webhook Secret

1. Click en el webhook que acabas de crear
2. En la sección **"Signing secret"**, click **"Reveal"**
3. Copia el secret (empieza con `whsec_...`)

### 4.4 Agregar Webhook Secret a Vercel

1. Ve a tu proyecto en Vercel
2. Click en **"Settings"** → **"Environment Variables"**
3. Agrega:
   - **Name**: `STRIPE_WEBHOOK_SECRET`
   - **Value**: `whsec_...` (el que copiaste)
4. **Importante**: Marca las 3 opciones (Production, Preview, Development)
5. Click **"Save"**

### 4.5 Redeploy

1. Ve a **"Deployments"**
2. Click en los 3 puntos del último deployment
3. Click **"Redeploy"**
4. Espera 1-2 minutos

## ✅ Verificación Final

### Probar el Sistema Completo

1. **Visita tu sitio**: `https://emilia-cheesecake.vercel.app`
2. **Agrega productos** al carrito
3. **Haz un pedido de prueba**:
   - Tarjeta de prueba: `4242 4242 4242 4242`
   - Fecha: cualquier futura
   - CVC: cualquier 3 números
   - Código postal: cualquiera

4. **Verifica que recibes**:
   - ✅ Notificación en Telegram
   - ✅ Email en info@emilialab.com
   - ✅ El "cliente" recibe email de confirmación

### Si algo no funciona:

1. **Revisa logs en Vercel**:
   - Ve a "Deployments" → último deployment → "Building" / "Runtime Logs"

2. **Revisa webhook en Stripe**:
   - https://dashboard.stripe.com/webhooks
   - Click en tu webhook
   - Ve la sección "Recent deliveries"
   - Si hay errores, te mostrará qué falló

3. **Verifica variables de entorno**:
   - Settings → Environment Variables
   - Todas deben estar presentes

## 🌐 Dominio Personalizado (Opcional)

### Conectar emilialab.com a Vercel

1. En Vercel, ve a **"Settings"** → **"Domains"**
2. Agrega: `emilialab.com` y `www.emilialab.com`
3. Vercel te dará registros DNS
4. En Namecheap:
   - **Advanced DNS**
   - Agrega los registros que Vercel te indica
5. Espera 5-30 minutos para propagación
6. ¡Listo! Tu sitio estará en emilialab.com

## 🔄 Auto-Deploy

Cada vez que hagas `git push` a tu repo:
- Vercel automáticamente detecta el cambio
- Hace build
- Deploya la nueva versión
- Todo en 2-3 minutos

## 💰 Costos

**Vercel Hobby (FREE)**:
- ✅ Totalmente gratis para este proyecto
- ✅ 100 GB bandwidth/mes
- ✅ Certificado SSL incluido
- ✅ Deploy automático
- ✅ Sin cold starts
- ✅ CDN global

**Límites generosos** - Suficiente para miles de visitas/mes

## 🔐 Cambiar a Claves LIVE de Stripe

⚠️ **IMPORTANTE antes de recibir pagos reales**:

1. Ve a https://dashboard.stripe.com/apikeys
2. Activa **"View live mode"**
3. Copia las claves LIVE:
   - `pk_live_...`
   - `sk_live_...`
4. En Vercel → Settings → Environment Variables
5. Actualiza:
   - `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY`
   - `STRIPE_SECRET_KEY`
6. Redeploy

## 📞 Soporte

- **Vercel Docs**: https://vercel.com/docs
- **Vercel Community**: https://github.com/vercel/vercel/discussions
- **Support**: support@vercel.com

---

**Tiempo total de deploy**: 10-15 minutos
**Costo**: $0/mes
**Creado**: ${new Date().toLocaleDateString()}
