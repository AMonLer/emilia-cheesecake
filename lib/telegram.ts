// Mensajes al chat de la tienda (pedidos, avisos For You).
export async function sendTelegramMessage(message: string) {
  const botToken = process.env.TELEGRAM_BOT_TOKEN
  const chatId = process.env.TELEGRAM_CHAT_ID

  if (!botToken || !chatId) {
    console.warn('Telegram no configurado')
    return
  }

  try {
    const response = await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        chat_id: chatId,
        text: message,
        parse_mode: 'HTML',
      }),
    })

    if (!response.ok) {
      console.error('Error enviando mensaje de Telegram:', await response.text())
    } else {
      console.log('✅ Mensaje de Telegram enviado')
    }
  } catch (error) {
    console.error('Error al enviar mensaje de Telegram:', error)
  }
}
