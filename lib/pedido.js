/* ===================================================================
   Regras do pedido — usadas pelo api/checkout.js (fica em lib/ para não virar um endereço público) (e testáveis sozinhas).
   Tudo que envolve dinheiro é recalculado AQUI, a partir do catalogo.js,
   nunca a partir do que o navegador mandou.
   =================================================================== */
const cat = require('../catalogo.js');

const TAMANHOS = ['PP', 'P', 'M', 'G', 'GG'];

function slugDe(p) { return p.slug || (p.img || '').split('/').pop().replace(/\.\w+$/, ''); }
function precoNum(s) { return Number(String(s || '0').replace(/\./g, '').replace(',', '.')) || 0; }
function arred(n) { return Math.round(n * 100) / 100; }
function soDigitos(s) { return String(s || '').replace(/\D/g, ''); }

function cpfValido(cpf) {
  cpf = soDigitos(cpf);
  if (cpf.length !== 11 || /^(\d)\1+$/.test(cpf)) return false;
  for (const t of [9, 10]) {
    let soma = 0;
    for (let i = 0; i < t; i++) soma += Number(cpf[i]) * (t + 1 - i);
    const d = ((soma * 10) % 11) % 10;
    if (d !== Number(cpf[t])) return false;
  }
  return true;
}

/* valida e normaliza os itens vindos do site -> [{slug, tam, q, produto}] */
function validarItens(itens) {
  if (!Array.isArray(itens) || !itens.length) throw new Error('Carrinho vazio.');
  if (itens.length > 20) throw new Error('Muitos itens no carrinho.');
  const porSlug = {};
  cat.PRODUTOS.forEach(p => { porSlug[slugDe(p)] = p; });
  return itens.map(i => {
    const p = porSlug[String(i.slug || '')];
    if (!p) throw new Error('Produto não encontrado: ' + i.slug);
    if (!p.preco) throw new Error(p.nome + ' ainda não está à venda.');
    const q = Math.floor(Number(i.q));
    if (!(q >= 1 && q <= 10)) throw new Error('Quantidade inválida em ' + p.nome);
    let tam = null;
    if (p.cat === 'camisas') {
      tam = String(i.tam || '').toUpperCase();
      if (!TAMANHOS.includes(tam)) throw new Error('Escolha o tamanho da ' + p.nome);
    }
    return { slug: slugDe(p), tam, q, produto: p };
  });
}

function validarComprador(c) {
  c = c || {};
  const nome = String(c.nome || '').trim().replace(/\s+/g, ' ');
  if (nome.length < 5 || !nome.includes(' ')) throw new Error('Informe o nome completo.');
  const email = String(c.email || '').trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) throw new Error('E-mail inválido.');
  const cpf = soDigitos(c.cpf);
  if (!cpfValido(cpf)) throw new Error('CPF inválido.');
  const tel = soDigitos(c.telefone);
  if (tel.length < 10 || tel.length > 11) throw new Error('Celular inválido (DDD + número).');
  return { nome, email, cpf, telefone: tel };
}

function validarEndereco(e) {
  e = e || {};
  const cep = soDigitos(e.cep);
  if (cep.length !== 8) throw new Error('CEP inválido.');
  const campo = (k, min, max, rot) => {
    const v = String(e[k] || '').trim();
    if (v.length < min) throw new Error('Informe ' + rot + '.');
    return v.slice(0, max);
  };
  return {
    cep,
    logradouro: campo('logradouro', 2, 120, 'a rua/avenida'),
    numero: campo('numero', 1, 20, 'o número'),
    complemento: String(e.complemento || '').trim().slice(0, 60),
    bairro: campo('bairro', 2, 80, 'o bairro'),
    cidade: campo('cidade', 2, 80, 'a cidade'),
    uf: campo('uf', 2, 2, 'a UF').toUpperCase()
  };
}

function freteParaUF(uf, subtotal) {
  if (cat.FRETE_GRATIS_ACIMA > 0 && subtotal >= cat.FRETE_GRATIS_ACIMA) return { valor: 0, prazo: cat.TABELA_FRETE[cat.REGIOES[uf] || 'N'].prazo, gratis: true };
  const reg = cat.REGIOES[uf] || 'N';
  const f = cat.TABELA_FRETE[reg];
  return { valor: arred(f.valor), prazo: f.prazo, gratis: false };
}

/* monta o pedido completo com valores recalculados */
function montarPedido({ itens, comprador, endereco, cupom }) {
  const its = validarItens(itens);
  const comp = validarComprador(comprador);
  const end = validarEndereco(endereco);
  const cupomOk = !!(cat.CUPOM && cat.CUPOM.ativo && String(cupom || '').trim().toUpperCase() === cat.CUPOM.codigo);
  const pct = cupomOk ? cat.CUPOM.pct : 0;
  const linhas = its.map(i => {
    const cheio = precoNum(i.produto.preco);
    const unit = arred(cheio * (1 - pct / 100));
    return { ...i, nome: i.produto.nome + (i.tam ? ' — Tam. ' + i.tam : ''), precoCheio: cheio, unit, total: arred(unit * i.q), img: i.produto.img };
  });
  const subtotalCheio = arred(linhas.reduce((a, l) => a + l.precoCheio * l.q, 0));
  const subtotal = arred(linhas.reduce((a, l) => a + l.total, 0));
  const frete = freteParaUF(end.uf, subtotal);
  const total = arred(subtotal + frete.valor);
  return { itens: linhas, comprador: comp, endereco: end, cupom: cupomOk ? cat.CUPOM.codigo : null, pct, subtotalCheio, desconto: arred(subtotalCheio - subtotal), subtotal, frete, total };
}

module.exports = { montarPedido, freteParaUF, cpfValido, slugDe, precoNum, arred, soDigitos, TAMANHOS };
