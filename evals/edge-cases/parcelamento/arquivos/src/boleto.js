export function proximoVencimentoDoBoleto(vencimento) {
  const data = new Date(vencimento);
  data.setMonth(data.getMonth() + 1);
  return data;
}
