import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { type, description, message, email } = await req.json();

    const content = description || message;
    const reportType = type || 'bug';

    if (!content || content.trim() === '') {
      return new Response(
        JSON.stringify({ error: 'Content is required' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const telegramBotToken = Deno.env.get('TELEGRAM_BOT_TOKEN');
    const telegramChatId = Deno.env.get('TELEGRAM_CHAT_ID');

    const supabase = createClient(supabaseUrl, supabaseKey);

    // Save to appropriate table based on type
    const tableName = reportType === 'contact' ? 'contact_messages' : 'bug_reports';
    const columnName = reportType === 'contact' ? 'message' : 'description';

    const { data: report, error: dbError } = await supabase
      .from(tableName)
      .insert({
        [columnName]: content.trim(),
        email: email?.trim() || null,
      })
      .select()
      .single();

    if (dbError) {
      console.error('Database error:', dbError);
      return new Response(
        JSON.stringify({ error: 'Failed to save report' }),
        { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`${reportType} report saved:`, report.id);

    // Send Telegram message
    if (telegramBotToken && telegramChatId) {
      const emoji = reportType === 'contact' ? '💬' : '🐛';
      const title = reportType === 'contact' ? 'New Contact Message' : 'New Bug Report';
      const telegramMessage = `${emoji} *${title}*\n\n*ID:* \`${report.id}\`\n*Email:* ${email || 'Not provided'}\n*Message:*\n${content}`;

      const telegramResponse = await fetch(
        `https://api.telegram.org/bot${telegramBotToken}/sendMessage`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: telegramChatId,
            text: telegramMessage,
            parse_mode: 'Markdown',
          }),
        }
      );

      const telegramResult = await telegramResponse.json();
      
      if (!telegramResult.ok) {
        console.error('Telegram error:', telegramResult);
      } else {
        console.log('Telegram message sent successfully');
      }
    } else {
      console.warn('Telegram credentials not configured');
    }

    return new Response(
      JSON.stringify({ success: true, id: report.id }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error in send-bug-report function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});
