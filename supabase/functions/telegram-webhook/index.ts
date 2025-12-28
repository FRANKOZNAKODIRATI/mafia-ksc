import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const body = await req.json();
    console.log('Received Telegram webhook:', JSON.stringify(body, null, 2));

    // Check if this is a message
    if (!body.message) {
      console.log('No message in webhook payload');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const message = body.message;
    const text = message.text || '';
    const from = message.from;

    // Check if this is a review command (starts with /review)
    if (text.startsWith('/review ')) {
      const reviewText = text.replace('/review ', '').trim();
      
      if (!reviewText) {
        console.log('Empty review text');
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const supabase = createClient(
        Deno.env.get('SUPABASE_URL') ?? '',
        Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
      );

      // Get username or first name
      const reviewerName = from.username || from.first_name || 'Anonymous';

      // Insert review (auto-approved since it's from Telegram admin)
      const { data, error } = await supabase
        .from('reviews')
        .insert({
          name: reviewerName,
          text: reviewText,
          rating: 5,
          is_approved: true,
        })
        .select()
        .single();

      if (error) {
        console.error('Error inserting review:', error);
        
        // Send error message to Telegram
        await sendTelegramMessage(
          `❌ Failed to add review: ${error.message}`
        );
      } else {
        console.log('Review inserted:', data);
        
        // Send confirmation to Telegram
        await sendTelegramMessage(
          `✅ Review added!\n\nFrom: ${reviewerName}\nText: ${reviewText}`
        );
      }
    } else {
      console.log('Message is not a review command');
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Telegram webhook error:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});

async function sendTelegramMessage(text: string) {
  const botToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
  const chatId = Deno.env.get('TELEGRAM_CHAT_ID');
  
  if (!botToken || !chatId) {
    console.error('Missing Telegram credentials');
    return;
  }

  try {
    const response = await fetch(
      `https://api.telegram.org/bot${botToken}/sendMessage`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          chat_id: chatId,
          text: text,
        }),
      }
    );
    
    const result = await response.json();
    console.log('Telegram response:', result);
  } catch (error) {
    console.error('Error sending Telegram message:', error);
  }
}
