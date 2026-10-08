/* ===================================================================
   CATÁLOGO DA LOJA CSI — FONTE ÚNICA DE DADOS
   Este arquivo é lido pelo site (index.html) E pelo servidor que fala
   com o Mercado Pago (api/checkout.js). Por isso o preço cobrado é
   SEMPRE o que está aqui, mesmo que alguém mexa na página.
   >>> Para mudar preço, frete ou texto: edite SÓ este arquivo no GitHub
       (github.com/PeritoCriminalHenriqueTabosa/loja-csi) e salve.
       O Vercel republica sozinho em ~1 minuto. <<<

   Campos de cada produto:
   cat     : "camisas" | "livros" | "acessorios"
   nome    : nome que aparece no site e no Mercado Pago
   preco   : preço atual (texto "59,90")   precoDe: preço riscado ("" oculta)
   badge   : "hot" | "new" | "limitada" | "kit" | ""
   img     : foto principal. imgs: várias fotos => carrossel (a 1ª é a capa)
   checkout: link da Hotmart (usado só quando PAGAMENTO = "hotmart")
   slug    : opcional; se não tiver, vale o nome do arquivo da foto
   peso    : gramas, usado só para o Mercado Pago saber o volume (opcional)
   =================================================================== */

/* -------- COMO O CLIENTE PAGA --------
   "mercadopago" => carrinho do site + pagamento no Mercado Pago (produtos + frete numa cobrança só)
   "hotmart"     => botões abrem o checkout da Hotmart (como era antes) */
const PAGAMENTO = "hotmart";

/* -------- CUPOM DO POP-UP DE SAÍDA --------
   Mercado Pago: o desconto é aplicado pelo servidor na hora de montar o pedido.
   Hotmart: o cupom precisa existir lá também (criado em 30/09 nos 22 produtos físicos). */
const CUPOM = {codigo:"VOLTA10", pct:10, ativo:true};

/* -------- DADOS DA EMPRESA (aparecem no rodapé, nas políticas e no Mercado Pago) -------- */
const EMPRESA = {
  nome: "Loja CSI — Cena de Crime",
  cnpj: "30.605.812/0001-21",
  endereco: "[ENDEREÇO COMPLETO — PREENCHER: rua, número, bairro, cidade/UF, CEP]",
  email: "contato@peritohenriquetabosa.com.br",
  whatsapp: "5581991016004",            // só números, com 55
  whatsappBonito: "(81) 99101-6004",
  descricaoFatura: "LOJA CSI"           // como aparece na fatura do cartão (máx. 22 letras)
};

const KIT_LEITOR_CHECKOUT = "https://pay.hotmart.com/H107815220Q";  // Kit Leitor (Hotmart ID 8619957)

const PRODUTOS = [
  /* ------------- CAMISAS (11) — todas De 79,90 Por 59,90 ------------- */
  {cat:"camisas", nome:"Camisa Criminal (babylook)",  precoDe:"79,90", preco:"59,90", badge:"hot", img:"img/camisa-criminal-babylook.webp", imgs:["img/foto-criminal-babylook-1.webp","img/foto-criminal-babylook-2.webp","img/camisa-criminal-babylook.webp","img/estampa-criminal-babylook.webp"], checkout:"https://pay.hotmart.com/N100131638T"},
  {cat:"camisas", nome:"Camisa Criminal (normal)",    precoDe:"79,90", preco:"59,90", badge:"",    img:"img/camisa-criminal-normal.webp", imgs:["img/foto-criminal-normal-1.webp","img/foto-criminal-normal-2.webp","img/camisa-criminal-normal.webp","img/estampa-criminal-normal.webp"], checkout:"https://pay.hotmart.com/D100131643C"},
  {cat:"camisas", nome:"Camisa Forense (babylook)",   precoDe:"79,90", preco:"59,90", badge:"",    img:"img/camisa-forense-babylook.webp", imgs:["img/foto-forense-babylook-1.webp","img/foto-forense-babylook-2.webp","img/camisa-forense-babylook.webp","img/estampa-forense-babylook.webp"], checkout:"https://pay.hotmart.com/A100131618K"},
  {cat:"camisas", nome:"Camisa Forense (normal)",     precoDe:"79,90", preco:"59,90", badge:"",    img:"img/camisa-forense-normal.webp", imgs:["img/foto-forense-normal-1.webp","img/foto-forense-normal-2.webp","img/camisa-forense-normal.webp","img/estampa-forense-normal.webp"], checkout:"https://pay.hotmart.com/T100232782E"},
  {cat:"camisas", nome:"Camisa Elementos (babylook)", precoDe:"79,90", preco:"59,90", badge:"",    img:"img/camisa-elementos-babylook.webp", imgs:["img/foto-elementos-babylook-1.webp","img/foto-elementos-babylook-2.webp","img/camisa-elementos-babylook.webp","img/estampa-elementos-babylook.webp"], checkout:"https://pay.hotmart.com/M100131589H"},
  {cat:"camisas", nome:"Camisa Elementos (normal)",   precoDe:"79,90", preco:"59,90", badge:"",    img:"img/camisa-elementos-normal.webp", imgs:["img/foto-elementos-normal-1.webp","img/foto-elementos-normal-2.webp","img/camisa-elementos-normal.webp","img/estampa-elementos-normal.webp"], checkout:"https://pay.hotmart.com/Q100131648O"},
  {cat:"camisas", nome:"Camisa Perícia& (babylook)",  precoDe:"79,90", preco:"59,90", badge:"",    img:"img/camisa-pericia-babylook.webp", imgs:["img/foto-pericia-babylook-1.webp","img/foto-pericia-babylook-2.webp","img/camisa-pericia-babylook.webp","img/estampa-pericia-babylook.webp"], checkout:"https://pay.hotmart.com/M100131605O"},
  {cat:"camisas", nome:"Camisa Perícia& (normal)",    precoDe:"79,90", preco:"59,90", badge:"",    img:"img/camisa-pericia-normal.webp", imgs:["img/foto-pericia-normal-1.webp","img/foto-pericia-normal-2.webp","img/camisa-pericia-normal.webp","img/estampa-pericia-normal.webp"], checkout:"https://pay.hotmart.com/V100131770O"},
  {cat:"camisas", nome:"Camisa Brasão (normal)",      precoDe:"79,90", preco:"59,90", badge:"",    img:"img/camisa-brasao-normal.webp", imgs:["img/foto-brasao-normal-1.webp","img/foto-brasao-normal-2.webp","img/foto-brasao-normal-3.webp","img/camisa-brasao-normal.webp","img/estampa-brasao-normal.webp"], checkout:"https://pay.hotmart.com/U100131655I"},
  {cat:"camisas", nome:"Camisa Crime Scene (normal)", precoDe:"79,90", preco:"59,90", badge:"limitada", img:"img/camisa-crime-scene-normal.webp", imgs:["img/foto-crime-scene-normal-1.webp","img/foto-crime-scene-normal-2.webp","img/foto-crime-scene-normal-3.webp","img/camisa-crime-scene-normal.webp","img/estampa-crime-scene-normal.webp"], checkout:"https://pay.hotmart.com/H100131793V"},
  {cat:"camisas", nome:"Camisa Vintage (normal)",     precoDe:"79,90", preco:"59,90", badge:"limitada",    img:"img/camisa-vintage-normal.webp", imgs:["img/foto-vintage-normal-1.webp","img/foto-vintage-normal-2.webp","img/camisa-vintage-normal.webp","img/estampa-vintage-normal.webp"], checkout:"https://pay.hotmart.com/V100131872J"},

  /* ------------- LIVROS (2) ------------- */
  {cat:"livros", nome:"O Caso dos Canibais de Pernambuco", precoDe:"99,90", preco:"64,90", badge:"hot", img:"img/livro-canibais-pernambuco.webp", checkout:"https://pay.hotmart.com/A98478536U"},
  {cat:"livros", nome:"O Caso do Marchante Suicida",       precoDe:"89,90", preco:"59,90", badge:"",    img:"img/livro-marchante-suicida.webp", checkout:"https://pay.hotmart.com/R98459917C"},
  {cat:"livros", nome:"Kit Leitor — os 2 livros", precoDe:"124,80", preco:"99,90", badge:"kit", slug:"kit-leitor", img:"img/kit-leitor.webp", checkout:KIT_LEITOR_CHECKOUT,
   detalhes:["Canibais de Pernambuco + Marchante Suicida","Economia de R$ 24,90 em relação a comprar separado","Um envio só, com rastreio"]},

  /* ------------- ACESSÓRIOS (8) ------------- */
  {cat:"acessorios", nome:"Calça CSI",                 precoDe:"79,90", preco:"59,90", badge:"",    img:"img/calca-csi.webp", imgs:["img/foto-calca-csi-1.webp","img/foto-calca-csi-2.webp","img/foto-calca-csi-3.webp","img/foto-calca-csi-4.webp","img/calca-csi.webp","img/calca-csi-detalhe.webp"], checkout:"https://pay.hotmart.com/G100131782A"},
  {cat:"acessorios", nome:"Carteira CSI — Faixas",     precoDe:"24,90", preco:"19,90", badge:"",    img:"img/carteira-csi-faixas.webp", checkout:"https://pay.hotmart.com/M100814965J"},
  {cat:"acessorios", nome:"Carteira CSI — Sangue",     precoDe:"24,90", preco:"19,90", badge:"",    img:"img/carteira-csi-sangue.webp", checkout:"https://pay.hotmart.com/A100814990C"},
  {cat:"acessorios", nome:"Estojo de Evidências",      precoDe:"37,90", preco:"29,90", badge:"hot", img:"img/estojo-evidencias.webp", checkout:"https://pay.hotmart.com/H100814875S"},
  {cat:"acessorios", nome:"Cordão Perícia",            precoDe:"24,90", preco:"19,90", badge:"",    img:"img/cordao-pericia.webp", checkout:"https://pay.hotmart.com/P100815122S"},
  {cat:"acessorios", nome:"Bottons Perícia Criminal",  precoDe:"9,90",  preco:"6,90",  badge:"new", img:"img/bottons-pericia-criminal.webp", checkout:"https://pay.hotmart.com/T100815045V"},
  {cat:"acessorios", nome:"Brincos CSI",               precoDe:"36,70", preco:"26,90", badge:"",    img:"img/brincos-csi.webp", checkout:"https://pay.hotmart.com/T100814601J"},
  {cat:"acessorios", nome:"Pulseira Perícia",          precoDe:"19,90", preco:"14,90", badge:"",    img:"img/pulseira-pericia.webp", checkout:"https://pay.hotmart.com/M100131610M"}
];

/* -------- FRETE POR REGIÃO (valor cobrado de verdade no Mercado Pago) --------
   O site descobre a UF pelo CEP (ViaCEP) e usa a tabela abaixo.
   FRETE_GRATIS_ACIMA: pedido com produtos a partir deste valor não paga frete (0 = nunca). */
const FRETE_GRATIS_ACIMA = 0;
const TABELA_FRETE = {
  "PE": {valor: 12.90, prazo: "2 a 4 dias úteis"},
  "NE": {valor: 16.90, prazo: "3 a 6 dias úteis"},   // demais estados do Nordeste
  "SE": {valor: 19.90, prazo: "4 a 7 dias úteis"},   // Sudeste
  "S":  {valor: 21.90, prazo: "5 a 8 dias úteis"},   // Sul
  "CO": {valor: 22.90, prazo: "5 a 9 dias úteis"},   // Centro-Oeste
  "N":  {valor: 26.90, prazo: "6 a 12 dias úteis"}   // Norte
};
const REGIOES = {PE:"PE",AL:"NE",BA:"NE",CE:"NE",MA:"NE",PB:"NE",PI:"NE",RN:"NE",SE:"NE",
  ES:"SE",MG:"SE",RJ:"SE",SP:"SE",PR:"S",RS:"S",SC:"S",DF:"CO",GO:"CO",MT:"CO",MS:"CO",
  AC:"N",AP:"N",AM:"N",PA:"N",RO:"N",RR:"N",TO:"N"};

/* -------- ORDER BUMP DA HOTMART (usado só quando PAGAMENTO = "hotmart") --------
   Cada produto tem a sua lista de "compre junto" configurada em
   custom-checkout.hotmart.com/<id do produto>. Esta cópia diz ao site
   quais itens cabem no mesmo pagamento. Se mudar lá, mude aqui. */
/* códigos: CRIMINAL n D100131643C · CRIMINAL bl N100131638T · FORENSE n T100232782E · FORENSE bl A100131618K
   ELEMENTOS n Q100131648O · ELEMENTOS bl M100131589H · PERÍCIA& n V100131770O · PERÍCIA& bl M100131605O
   BRASÃO U100131655I · Canibais A98478536U · Marchante R98459917C · Kit Leitor H107815220Q · Calça G100131782A
   Carteira Faixas M100814965J · Carteira Sangue A100814990C · Estojo H100814875S · Cordão P100815122S
   Bottons T100815045V · Brincos T100814601J · Pulseira M100131610M */
const BUMPS = {
  /* Camisa Criminal (normal) */
  "D100131643C": ["G100131782A","H107815220Q","U100131655I","T100232782E","V100131770O","Q100131648O","M100814965J","P100815122S","T100815045V"],
  /* Camisa Criminal (babylook) */
  "N100131638T": ["D100131643C","A100131618K","M100131589H","M100131605O","H107815220Q","G100131782A","H100814875S","P100815122S","T100815045V"],
  /* Camisa Forense (babylook) */
  "A100131618K": ["N100131638T","D100131643C","T100232782E","M100131589H","M100131605O","H107815220Q","H100814875S","P100815122S","T100815045V"],
  /* Camisa Forense (normal) */
  "T100232782E": ["D100131643C","N100131638T","A100131618K","U100131655I","Q100131648O","H107815220Q","G100131782A","P100815122S","T100815045V"],
  /* Camisa Brasão (normal) */
  "U100131655I": ["D100131643C","N100131638T","A100131618K","T100232782E","H107815220Q","G100131782A","H100814875S","P100815122S","T100815045V"],
  /* Camisa Elementos (normal) */
  "Q100131648O": ["D100131643C","N100131638T","A100131618K","T100232782E","U100131655I","H107815220Q","G100131782A","P100815122S","T100815045V"],
  /* Camisa Elementos (babylook) */
  "M100131589H": ["N100131638T","D100131643C","A100131618K","M100131605O","H107815220Q","G100131782A","H100814875S","P100815122S","T100815045V"],
  /* Camisa Perícia& (normal) */
  "V100131770O": ["D100131643C","N100131638T","A100131618K","T100232782E","U100131655I","H107815220Q","G100131782A","P100815122S","T100815045V"],
  /* Camisa Perícia& (babylook) */
  "M100131605O": ["N100131638T","D100131643C","A100131618K","M100131589H","H107815220Q","G100131782A","H100814875S","P100815122S","T100815045V"],
  /* Kit Leitor */
  "H107815220Q": ["T100815045V","U100131655I","D100131643C","N100131638T","A100131618K","H100814875S","G100131782A","P100815122S","M100814965J"],
  /* Livro Canibais */
  "A98478536U": ["R98459917C","D100131643C","N100131638T","A100131618K","U100131655I","G100131782A","H100814875S","P100815122S","T100815045V"],
  /* Livro Marchante */
  "R98459917C": ["A98478536U","D100131643C","N100131638T","A100131618K","U100131655I","G100131782A","H100814875S","P100815122S","T100815045V"],
  /* Calça CSI */
  "G100131782A": ["D100131643C","N100131638T","A100131618K","T100232782E","U100131655I","H107815220Q","H100814875S","P100815122S","T100815045V"],
  /* Estojo de Evidências */
  "H100814875S": ["D100131643C","N100131638T","A100131618K","T100232782E","U100131655I","H107815220Q","G100131782A","P100815122S","T100815045V"],
  /* Carteira Faixas */
  "M100814965J": ["D100131643C","N100131638T","A100131618K","T100232782E","U100131655I","H107815220Q","G100131782A","H100814875S","A100814990C"],
  /* Carteira Sangue */
  "A100814990C": ["D100131643C","N100131638T","A100131618K","T100232782E","U100131655I","H107815220Q","G100131782A","H100814875S","M100814965J"],
  /* Cordão */
  "P100815122S": ["D100131643C","N100131638T","A100131618K","T100232782E","U100131655I","H107815220Q","G100131782A","H100814875S","T100815045V"],
  /* Bottons */
  "T100815045V": ["D100131643C","N100131638T","A100131618K","T100232782E","U100131655I","H107815220Q","G100131782A","H100814875S","P100815122S"]
};
const WHATS_LOJA = "5581991016004";

/* não mexer: deixa o servidor (api/) ler este mesmo arquivo */
if (typeof module !== 'undefined') module.exports = { PAGAMENTO, EMPRESA, CUPOM, PRODUTOS, KIT_LEITOR_CHECKOUT, TABELA_FRETE, REGIOES, FRETE_GRATIS_ACIMA, BUMPS, WHATS_LOJA };
