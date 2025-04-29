import { Injectable } from '@nestjs/common';
import { GetOperationDREValuesResponse } from './dtos/get-operation-dre-values-response.dto';
import { GetOperationDREValuesRequest } from './dtos/get-operation-dre-values-request.dto';

@Injectable()
export class OperationDREService {
  constructor() {}

  getValues(dto: GetOperationDREValuesRequest): GetOperationDREValuesResponse {
    const { companyId, baseDate, endDate, startDate } = dto;
    // Receitas

    // Custos

    // Despesas
    // Pegar por grupo
    // a label sempre vai cada conta contabel
    // o value vai ser a soma dos registros agrupados por conta contabil

    const incomes = [];
    const costs = [
      {
        label: 'Compra Gado',
        value: 4229573.99,
      },
      { label: 'Serviços de terceiros - Compra Gado', value: 90483.87 },
      { label: 'Frete Gado', value: 13482.94 },
      { label: 'Frete Insumos', value: 26453.01 },
      { label: 'Embalagens', value: 1361100.55 },
    ];

    const expenses = [
      { label: 'Viagens e hosp.', value: 20560.83 },
      { label: 'Monitoramento', value: 499.8 },
      { label: 'Fretes M.I', value: 17415.46 },
      { label: 'Prest. serviços PJ', value: 28401.68 },
      { label: 'Despesas aduaneiras', value: 8956.18 },
      { label: 'Hrs. Advocaticios', value: 16654.17 },
      { label: 'Dev vendas', value: 262.52 },
      { label: 'IPTU', value: 1140.87 },
      { label: 'Material de uso e consumo', value: 12176.5 },
      { label: 'Internet', value: 50.97 },
      { label: 'Patio', value: 15000 },
      { label: 'Taxa Licença', value: 308.19 },
      { label: 'Salarios', value: 24006.16 },
    ];

    const relationIncomesCostsExpensesItems = [
      {
        itemLabel: 'Estoque Suprimentos',
        item: [
          {
            label: 'Estoque Suprimentos',
            value: 1099178.07,
          },
        ],
      },
      {
        itemLabel: 'Estoque Carnes',
        item: [
          {
            label: 'Bon Mart',
            value: 24171,
          },
          {
            label: 'Serbon',
            value: 650115.73,
          },
        ],
      },
      {
        itemLabel: 'Vendas a efetivar',
        item: [
          {
            label: 'RAMAX LLC',
            value: 681811.56,
          },
          {
            label: 'RAMAX LLC',
            value: 749105.76,
          },
        ],
      },
    ];
    const relationIncomesCostsExpenses = relationIncomesCostsExpensesItems.map(
      (item) => ({
        ...item,
        itemTotal: item.item.reduce((acc, i) => acc + i.value, 0),
      }),
    );

    // RECEITAS TOTAIS
    // CUSTOS TOTAIS
    // DESPESAS TOTAIS
    const incomesTotal = incomes.reduce((acc, item) => acc + item.value, 0);
    const costsTotal = costs.reduce((acc, item) => acc + item.value, 0);
    const expensesTotal = expenses.reduce((acc, item) => acc + item.value, 0);

    // RECEITAS/CUSTO/DESPESA
    const relationIncomesCostsExpensesTotal = 0 - costsTotal - expensesTotal;

    // TOTAL ESTOQUE/VENDAS PENDENTES
    const relationStockPendingSales =
      relationIncomesCostsExpenses.find(
        (item) => item.itemLabel === 'Estoque Suprimentos',
      ).itemTotal +
      relationIncomesCostsExpenses.find(
        (item) => item.itemLabel === 'Vendas a efetivar',
      ).itemTotal;

    // RECEITAS/CUSTO/DESPESA + TOTAL ESTOQUE/VENDAS PENDENTES
    const total = relationIncomesCostsExpensesTotal + relationStockPendingSales;

    return {
      costs,
      costsTotal,
      expenses,
      expensesTotal,
      incomes,
      incomesTotal,
      relationIncomesCostsExpenses,
      relationIncomesCostsExpensesTotal,
      relationStockPendingSales,
      total,
    };
  }
}
