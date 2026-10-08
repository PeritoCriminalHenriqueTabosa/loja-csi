/* ===================================================================
   /api/webhook — o Mercado Pago chama aqui quando um pagamento muda.
   A função busca o pagamento, e se estiver APROVADO repassa o pedido
   completo (itens, tamanhos, endereço, comprador) para o n8n, que
   avisa o Henrique no WhatsApp/e-mail e manda a confirmação ao cliente.

   Variáveis de ambiente:
   MP_ACCESS_TOKEN    (obrigatória)
   N8N_PEDIDO_URL     (opcional) webhook do n8n que recebe o pedido pago
   MP_WEBHOOK_SECRET  (opcional) "assinatura secreta" do painel do MP;
                      com ela a função rejeita chamadas falsas
   =================================================================== */
const crypto = require('crypto');

function assinaturaOk(req, dataId) {
  const secret = process.env.MP_WEBHOOK_SECRET;
  if (!secret) return true;                      // sem segredo configurado, não valida
  const sig = req.headers['x-signature'] || '';
  const reqId = req.headers['x-request-id'] || '';
  const partes = Object.fromEntries(sig.split(',').map(s => s.trim().split('=')));
  if (!partes.ts || !partes.v1) return false;
  const manifesto = `id:${String(dataId).toLowerCase()};request-id:${reqId};ts:${partes.ts};`;
  const esperado = crypto.createHmac('sha256', secret).update(manifesto).digest('hex');
  return esperado === partes.v1;
}

async function buscarPagamento(id, token) {
  const r = await fetch('https://api.mercadopago.com/v1/payments/' + id, { headers: { Authorization: 'Bearer ' + token } });
  if (!r.ok) throw new Error('payment ' + id + ' -> ' + r.status);
  return r.json();
}

module.exports = async (req, res) => {
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return res.status(200).end('sem token');
  let body = req.body;
  if (typeof body === 'string') { try { body = JSON.parse(body); } catch (e) { body = {}; } }
  body = body || {};
  const q = req.query || {};
  const tipo = body.type || body.topic || q.type || q.topic || '';
  const dataId = (body.data && body.data.id) || q['data.id'] || q.id || null;

  /* o MP só quer um 200 rápido; qualquer coisa fora de "payment" a gente ignora */
  if (!/payment/.test(tipo) || !dataId) return res.status(200).end('ignorado');
  if (!assinaturaOk(req, dataId)) { console.warn('webhook: assinatura inválida'); return res.status(401).end('assinatura inválida'); }

  try {
    const pg = await buscarPagamento(dataId, token);
    const md = pg.metadata || {};
    const resumo = {
      status: pg.status,                       // approved | pending | rejected | ...
      status_detalhe: pg.status_detail,
      pagamento_id: pg.id,
      ref: pg.external_reference || md.ref,
      metodo: pg.payment_method_id,            // pix | master | visa | bolbradesco ...
      parcelas: pg.installments,
      valor_pago: pg.transaction_amount,
      aprovado_em: pg.date_approved,
      pagador_email: pg.payer && pg.payer.email,
      itens: md.itens, comprador: md.comprador, endereco: md.endereco,
      frete: md.frete, subtotal: md.subtotal, desconto: md.desconto, cupom: md.cupom, total: md.total
    };
    console.log('pagamento', resumo.ref, resumo.status, resumo.metodo, resumo.valor_pago);
    const alvo = process.env.N8N_PEDIDO_URL;
    if (alvo && (pg.status === 'approved' || pg.status === 'pending' || pg.status === 'in_process')) {
      await fetch(alvo, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(resumo) }).catch(e => console.error('n8n', e));
    }
    return res.status(200).end('ok');
  } catch (e) {
    console.error('webhook erro', e);
    return res.status(200).end('erro registrado');   // 200 para o MP não ficar reenviando sem parar
  }
};
