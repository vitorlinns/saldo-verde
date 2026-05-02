export interface CategoryRule {
  name: string;
  keywords: string[];
}

export const categoryRules: CategoryRule[] = [
  { name: 'Salário', keywords: ['salario', 'salário', 'salario', 'pagamento', 'quinzena', 'din din'] },
  { name: 'Venda', keywords: ['venda', 'fatura', 'pedido', 'boleto', 'mercado livre', 'Mercado Livre', 'mercado livre', 'shopee', 'Shopee', 'shein', 'Shein'] },
  { name: 'Reembolso', keywords: ['reembolso', 'devolução'] },
  { name: 'Pix', keywords: ['pix', 'pagar', 'recebido'] },
  { name: 'Honorários', keywords: ['honorario', 'honorários', 'consultoria', 'freelance', 'freela'] },
  { name: 'Comissão', keywords: ['comissao', 'comissão', 'parceria'] },
  { name: 'Investimentos', keywords: ['investimento', 'juros', 'rentabilidade', 'rendimentos'] },
  { name: 'Aluguel', keywords: ['aluguel', 'aluguer', 'locacao', 'locação'] },
  { name: 'Outros', keywords: [] },
];

export function inferCategoryFromTitle(title: string) {
  const normalizedTitle = title
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{Diacritic}/gu, '');

  for (const rule of categoryRules) {
    if (rule.keywords.some((keyword) => normalizedTitle.includes(keyword))) {
      return rule.name;
    }
  }

  return 'Outros';
}
