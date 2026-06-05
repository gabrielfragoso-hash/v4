/**
 * Envia notificação WhatsApp via CallMeBot (gratuito)
 *
 * Setup (1x, 2 minutos):
 * 1. Salve o número +34 644 44 33 45 como "CallMeBot" nos seus contatos
 * 2. Mande "I allow callmebot to send me messages" via WhatsApp para esse número
 * 3. Você receberá sua API key
 * 4. Adicione no Vercel:
 *    CALLMEBOT_PHONE = 5522XXXXXXXXX  (seu número sem +)
 *    CALLMEBOT_APIKEY = xxxxxxx
 */

export async function sendWhatsApp(message: string): Promise<boolean> {
  const phone = process.env.CALLMEBOT_PHONE;
  const apiKey = process.env.CALLMEBOT_APIKEY;

  if (!phone || !apiKey) {
    console.warn("WhatsApp não configurado — defina CALLMEBOT_PHONE e CALLMEBOT_APIKEY no Vercel");
    return false;
  }

  const encoded = encodeURIComponent(message);
  const url = `https://api.callmebot.com/whatsapp.php?phone=${phone}&text=${encoded}&apikey=${apiKey}`;

  try {
    const res = await fetch(url);
    return res.ok;
  } catch (err) {
    console.error("Erro ao enviar WhatsApp:", err);
    return false;
  }
}
