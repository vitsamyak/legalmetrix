import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL') ?? '';
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '';
    const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

    const initialRules = [
      { rule_reference: 'Rule 6(1)(a)', act_name: 'Legal Metrology (Packaged Commodities) Rules, 2011', requirement_description: 'Name and Address of the Manufacturer, or Packer, or Importer' },
      { rule_reference: 'Rule 6(1)(b)', act_name: 'Legal Metrology (Packaged Commodities) Rules, 2011', requirement_description: 'Common or generic names of the commodity' },
      { rule_reference: 'Rule 6(1)(c)', act_name: 'Legal Metrology (Packaged Commodities) Rules, 2011', requirement_description: 'Net quantity, in terms of the standard unit of weight or measure' },
      { rule_reference: 'Rule 6(1)(d)', act_name: 'Legal Metrology (Packaged Commodities) Rules, 2011', requirement_description: 'Month and year in which the commodity is manufactured or pre-packed or imported' },
      { rule_reference: 'Rule 6(1)(e)', act_name: 'Legal Metrology (Packaged Commodities) Rules, 2011', requirement_description: 'Retail sale price of the package (MRP)' },
      { rule_reference: 'Rule 6(1)(g)', act_name: 'Legal Metrology (Packaged Commodities) Rules, 2011', requirement_description: 'Consumer Care details (Name, Address, Telephone, Email)' }
    ];

    const { data, error } = await supabaseAdmin.from('legal_rules').upsert(initialRules, { onConflict: 'rule_reference' }).select();

    if (error) throw error;

    return new Response(JSON.stringify({ success: true, count: data.length }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  } catch (error: any) {
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});
