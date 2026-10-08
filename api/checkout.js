/* ===================================================================
   /api/checkout — recebe o carrinho do site, recalcula tudo pelo
   catalogo.js e cria a "preferência" no Mercado Pago (Checkout Pro).
   Devolve o link para onde o comprador é levado para pagar.

   Variáveis de ambiente (Vercel > Settings > Environment Variables):
   MP_ACCESS_TOKEN  (obrigatória) credencial de produção do Mercado Pago
                    (ou a de teste, enquanto estiver testando)
   SITE_URL         (opcional) ex.: https://loja.peritohenriquetabosa.com.br
   =================================================================== */
const cat = require('../catalogo.js');
const { montarPedido } = require('../lib/pedido.js');

const SITE = (process.env.SITE_URL || 'https://loja.peritohenriquetabosa.com.br').replace(/\/$/, '');

function lerCorpo(req) {
  if (req.body && typeof req.body === 'object') return req.body;
  try { return JSON.parse(req.body || '{}'); } catch (e) { return {}; }
}
function ref() { return 'CSI-' + Date.now().toString(36).toUpperCase() + '-' + Math.random().toString(36).slice(2, 6).toUpperCase(); }

module.exports = async (req, res) => {
  res.setHeader('Content-Type', 'application/json; charset=utf-8');
  if (req.method !== 'POST') return res.status(405).end(JSON.stringify({ erro: 'Use POST.' }));
  const token = process.env.MP_ACCESS_TOKEN;
  if (!token) return res.status(503).end(JSON.stringify({ erro: 'Pagamento online ainda não configurado. Fale com a gente no WhatsApp.' }));

  let pedido;
  try { pedido = montarPedido(lerCorpo(req)); }
  catch (e) { return res.status(400).end(JSON.stringify({ erro: e.message })); }

  const referencia = ref();
  const partesNome = pedido.comprador.nome.split(' ');
  const tel = pedido.comprador.telefone;
  const end = pedido.endereco;

  const preferencia = {
    items: pedido.itens.map(l => ({
      id: l.slug + (l.tam ? '-' + l.tam : ''),
      title: l.nome.slice(0, 256),
      description: (l.produto.cat === 'camisas' ? 'Camisa 100% algodão, estampa Loja CSI' : l.produto.cat === 'livros' ? 'Livro do Perito Henrique Tabosa' : 'Acessório Loja CSI').slice(0, 256),
      picture_url: SITE + '/' + l.img,
      category_id: l.produto.cat === 'livros' ? 'books' : 'fashion',
      quantity: l.q,
      currency_id: 'BRL',
      unit_price: l.unit
    })),
    shipments: {
      cost: pedido.frete.valor,
      mode: 'not_specified',
      receiver_address: {
        zip_code: end.cep,
        street_name: end.logradouro,
        street_number: end.numero,
        floor: '',
        apartment: end.complemento,
        city_name: end.cidade,
        state_name: end.uf,
        country_name: 'Brasil'
      }
    },
    payer: {
      name: partesNome[0],
      surname: partesNome.slice(1).join(' '),
      email: pedido.comprador.email,
      phone: { area_code: tel.slice(0, 2), number: tel.slice(2) },
      identification: { type: 'CPF', number: pedido.comprador.cpf },
      address: { zip_code: end.cep, street_name: end.logradouro, street_number: end.numero }
    },
    back_urls: {
      success: SITE + '/pedido.html?s=ok',
      pending: SITE + '/pedido.html?s=pendente',
      failure: SITE + '/pedido.html?s=erro'
    },
    auto_return: 'approved',
    notification_url: SITE + '/api/webhook',
    external_reference: referencia,
    statement_descriptor: (cat.EMPRESA.descricaoFatura || 'LOJA CSI').slice(0, 22),
    payment_methods: { installments: 12 },
    expires: false,
    /* tudo que a gente precisa para separar e enviar o pedido vai aqui e volta no webhook */
    metadata: {
      ref: referencia,
      itens: pedido.itens.map(l => ({ slug: l.slug, nome: l.nome, tam: l.tam, q: l.q, unit: l.unit, total: l.total })),
      comprador: { nome: pedido.comprador.nome, email: pedido.comprador.email, telefone: tel, cpf: pedido.comprador.cpf },
      endereco: end,
      frete: pedido.frete,
      subtotal: pedido.subtotal,
      desconto: pedido.desconto,
      cupom: pedido.cupom,
      total: pedido.total
    }
  };

  try {
    const r = await fetch('https://api.mercadopago.com/checkout/preferences', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': 'Bearer ' + token, 'X-Idempotency-Key': referencia },
      body: JSON.stringify(preferencia)
    });
    const j = await r.json();
    if (!r.ok || !j.init_point) {
      console.error('MP erro', r.status, JSON.stringify(j).slice(0, 500));
      return res.status(502).end(JSON.stringify({ erro: 'O Mercado Pago não aceitou o pedido agora. Tente de novo em instantes ou fale no WhatsApp.' }));
    }
    const teste = /^TEST-/.test(token);
    return res.status(200).end(JSON.stringify({
      ref: referencia,
      url: teste && j.sandbox_init_point ? j.sandbox_init_point : j.init_point,
      resumo: { subtotal: pedido.subtotal, desconto: pedido.desconto, frete: pedido.frete, total: pedido.total }
    }));
  } catch (e) {
    console.error('MP falha', e);
    return res.status(502).end(JSON.stringify({ erro: 'Não consegui falar com o Mercado Pago. Tente de novo.' }));
  }
};
