/**
 * Report Service
 *  • Lê eventos da fila  "report"
 *  • Atualiza um relatório em memória
 *  • Imprime as informações básicas de cada venda
 */
const fs = require('fs');
const path = require('path');
const RabbitMQService = require('../../rabbitmq/RabbitMQService'); // mesma classe dos demais serviços

/* ---------- Estado do relatório ---------- */
let totalOrders   = 0;
let totalRevenue  = 0;
let lastGenerated = null;

/* ---------- Funções utilitárias ---------- */
function formatBRL(value) {
  return Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' })
    .format(Number(value));
}

function updateReport(order) {
  totalOrders  += 1;
  totalRevenue += order.products.reduce((sum, p) => sum + Number(p.value), 0);
  lastGenerated = new Date().toISOString();
}

function printSale(order) {
  console.log('\n================  NOVA VENDA  ================\n');
  console.log(`Cliente : ${order.name}  <${order.email}>`);
  console.log('Itens   :');
  order.products.forEach(p =>
    console.log(`  – ${p.name}  (${formatBRL(p.value)})`)
  );
  console.log(`Endereço: ${order.address.street}, ${order.address.number} – ` +
              `${order.address.neighborhood}, ${order.address.city}/${order.address.state}`);
  console.log('\n----------------------------------------------');
  console.log(`Vendas processadas : ${totalOrders}`);
  console.log(`Faturamento total  : ${formatBRL(totalRevenue)}`);
  console.log(`Última atualização : ${lastGenerated}`);
  console.log('==============================================\n');
}

async function processMessage(msg) {
  const order = JSON.parse(msg.content.toString());
  try {
    updateReport(order);
    printSale(order);
    console.log('✔ REPORT UPDATED');
  } catch (err) {
    console.error('X ERROR WHILE GENERATING REPORT:', err.message);
  }
}

/* ---------- Bootstrap ---------- */
(async () => {
  const rabbit = await RabbitMQService.getInstance();
  await rabbit.consume('report', processMessage);
  console.log('📊  Report Service ON – listening queue "report"...');
})();
