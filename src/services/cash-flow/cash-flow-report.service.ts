import { Injectable } from '@nestjs/common';
import { CashFlowSimulateResponseDto } from './dtos/cash-flow-simulate-response.dto';
import { ExcelReaderService } from '../../common/services/excel-reader.service';
import { CommonDto } from './dtos/common/common.dto';

type CashFlowExportReportDto = {
  request: CommonDto;
  results: Omit<CashFlowSimulateResponseDto, 'toJSON'>;
};

@Injectable()
export class CashFlowReportService {
  constructor(private excelReader: ExcelReaderService) {}

  // SHEET DE CONTROLS
  getControlsHeaders(): [string, any][] {
    const headers: [string, any][] = [];

    // 1. Cabeçalhos de blocos de dados (linhas 1)
    headers.push(['A1', 'Controles gerais']);
    headers.push(['D1', 'Precos ME (USD)']);
    headers.push(['G1', 'Rendimentos ME (%)']);
    headers.push(['J1', 'Precos MI (R$)']);
    headers.push(['M1', 'Rendimentos MI (%)']);

    // 2. Dados das colunas A,D, G, J, M
    const controlesA = [
      'Dias Projeção',
      'Cbs ME',
      'Cbs MI',
      'Peso @',
      'Dias PGT CMP',
      'Frete KG',
      'R$/@ ME',
      'R$/@ MI',
      '% DT',
      '% TR',
      '% PA',
      'Arrend',
      'Tipo Arrend',
      'Dias PGT OP.',
      'Embalagem',
      'Mão de Obra',
      '% Comissao',
      '% Imposto',
      'Frete MI',
      'Dias Venda MI',
      '% Antecipação',
      'Dias Venda ME',
      'Dias Posição',
      'PTAX',
      'Desp. Rodov.',
      'Desp. Financ.',
      'Desp. Porto',
      'Desp. Marit.',
    ];

    const precosMe = [
      'Acem',
      'Peito',
      'Gordura Ext.',
      'Gordura Int.',
      'Musculo Dt.',
      'Paleta',
      'Costela',
      'Bananinha',
      'Lagarto',
      'Contra File',
      'Musculo mole',
      'Coxao Duro',
      'Musculo duro',
      'Coxao Mole',
      'Patinho',
      'File Mignon',
      'Recortes',
      'File Costela',
      'Roubado',
      'Cor. Alcatra',
      'Maminha',
      'Picanha',
      'Fralda',
    ];

    const precosMi = [
      'Acem',
      'Paleta',
      'Cupim',
      'Musculo',
      'Peito',
      'Recortes',
      'Costela',
      'Bife Vazio',
      'Bananinha',
      'Capa File',
      'Contra File',
      'Cor. Alcatra',
      'Coxao Duro',
      'Coxao Mole',
      'File Mignon',
      'Fralda',
      'Lagarto',
      'Maminha',
      'Musculo',
      'Patinho',
      'Picanha',
      'Rec. Alcatra',
      'Recortes',
      'Gordura',
    ];

    const rendimentosMe = [...precosMe];
    const rendimentosMi = [...precosMi];

    const row = (i: number) => i + 3;

    controlesA.forEach((item, index) => {
      headers.push([`A${row(index)}`, item]);
    });

    precosMe.forEach((item, index) => {
      headers.push([`D${row(index)}`, item]);
    });

    rendimentosMe.forEach((item, index) => {
      headers.push([`G${row(index)}`, item]);
    });

    precosMi.forEach((item, index) => {
      headers.push([`J${row(index)}`, item]);
    });

    rendimentosMi.forEach((item, index) => {
      headers.push([`M${row(index)}`, item]);
    });

    return headers;
  }

  getControlsValues(request: CommonDto): [string, any][] {
    const values: [string, any][] = [
      ['B3', request.projecao.diasProjecao],
      ['B4', request.matPrima.cbsMe],
      ['B5', request.matPrima.cbsMi],
      ['B6', request.matPrima.pesoArroba],
      ['B7', request.matPrima.diasPagamento],
      ['B8', request.matPrima.precoFreteKg],
      ['B9', request.matPrima.precoArrobaMe],
      ['B10', request.matPrima.precoArrobaMi],
      ['B11', request.matPrima.pDt],
      ['B12', request.matPrima.pTr],
      ['B13', request.matPrima.pPa],
      ['B14', request.operacao.arredKg],
      ['B15', request.operacao.tipoArrend],
      ['B16', request.operacao.diasPagamentoProdutos],
      ['B17', request.operacao.precoEmbalagem],
      ['B18', request.operacao.precoMod],
      ['B19', request.mi.pComissoesMi],
      ['B20', request.mi.pImpostosMi],
      ['B21', request.mi.precoFreteMi],
      ['B22', request.mi.vendasMiDias],
      ['B23', request.me.pAntecipacaoMe],
      ['B24', request.me.vendasMeDias],
      ['B25', request.me.diasPosicao],
      ['B26', request.me.ptax],
      ['B27', request.me.precoFreteRodoviario],
      ['B28', request.me.precoFinanc],
      ['B29', request.me.precoPorto],
      ['B30', request.me.precoFreteInter],
    ];

    const precosMe: [
      string,
      (
        | keyof typeof request.precosMe.dt
        | keyof typeof request.precosMe.pa
        | keyof typeof request.precosMe.tr
      ),
    ][] = [
      ['E3', 'pAcem'],
      ['E4', 'pPeito'],
      ['E5', 'pGorduraExt'],
      ['E6', 'pGorduraInt'],
      ['E7', 'pMusculo'],
      ['E8', 'pPaleta'],
      ['E9', 'pCostela'],
      ['E10', 'pBananinha'],
      ['E11', 'pLagarto'],
      ['E12', 'pContraFile'],
      ['E13', 'pMusculoMole'],
      ['E14', 'pCoxaoDuro'],
      ['E15', 'pMusculoDuro'],
      ['E16', 'pCoxaoMole'],
      ['E17', 'pPatinho'],
      ['E18', 'pFileMignon'],
      ['E19', 'pRecortes'],
      ['E20', 'pFileCostela'],
      ['E21', 'pRoubado'],
      ['E22', 'pCorAlcatra'],
      ['E23', 'pMaminha'],
      ['E24', 'pPicanha'],
      ['E25', 'pFralda'],
    ];

    precosMe.forEach(([cell, key]) => {
      const value =
        request.precosMe.dt[key] ??
        request.precosMe.pa[key] ??
        request.precosMe.tr[key];
      values.push([cell, value]);
    });

    const rendimentosMe: [
      string,
      (
        | keyof typeof request.rendimentosMe.dt
        | keyof typeof request.rendimentosMe.pa
        | keyof typeof request.rendimentosMe.tr
      ),
    ][] = [
      ['H3', 'pAcem'],
      ['H4', 'pPeito'],
      ['H5', 'pGorduraExt'],
      ['H6', 'pGorduraInt'],
      ['H7', 'pMusculo'],
      ['H8', 'pPaleta'],
      ['H9', 'pCostela'],
      ['H10', 'pBananinha'],
      ['H11', 'pLagarto'],
      ['H12', 'pContraFile'],
      ['H13', 'pMusculoMole'],
      ['H14', 'pCoxaoDuro'],
      ['H15', 'pMusculoDuro'],
      ['H16', 'pCoxaoMole'],
      ['H17', 'pPatinho'],
      ['H18', 'pFileMignon'],
      ['H19', 'pRecortes'],
      ['H20', 'pFileCostela'],
      ['H21', 'pRoubado'],
      ['H22', 'pCorAlcatra'],
      ['H23', 'pMaminha'],
      ['H24', 'pPicanha'],
      ['H25', 'pFralda'],
    ];

    rendimentosMe.forEach(([cell, key]) => {
      const value =
        request.rendimentosMe.dt[key] ??
        request.rendimentosMe.pa[key] ??
        request.rendimentosMe.tr[key];
      values.push([cell, value]);
    });

    const precosMi: [
      string,
      (
        | keyof typeof request.precosMi.dt
        | keyof typeof request.precosMi.pa
        | keyof typeof request.precosMi.tr
      ),
    ][] = [
      ['K3', 'pAcem'],
      ['K4', 'pPaleta'],
      ['K5', 'pCupim'],
      ['K6', 'pMusculo'],
      ['K7', 'pPeito'],
      ['K8', 'pRecortes'],
      ['K9', 'pCostela'],
      ['K10', 'pBifeVazio'],
      ['K11', 'pBananinha'],
      ['K12', 'pCapaFile'],
      ['K13', 'pContraFile'],
      ['K14', 'pCorAlcatra'],
      ['K15', 'pCoxaoDuro'],
      ['K16', 'pCoxaoMole'],
      ['K17', 'pFileMignon'],
      ['K18', 'pFralda'],
      ['K19', 'pLagarto'],
      ['K20', 'pMaminha'],
      ['K21', 'pMusculo'],
      ['K22', 'pPatinho'],
      ['K23', 'pPicanha'],
      ['K24', 'pRecAlcatra'],
      ['K25', 'pRecortes'],
      ['K26', 'pGordura'],
    ];

    precosMi.forEach(([cell, key]) => {
      const value =
        request.precosMi.dt[key] ??
        request.precosMi.pa[key] ??
        request.precosMi.tr[key];
      values.push([cell, value]);
    });

    const rendimentosMi: [
      string,
      (
        | keyof typeof request.rendimentosMi.dt
        | keyof typeof request.rendimentosMi.pa
        | keyof typeof request.rendimentosMi.tr
      ),
    ][] = [
      ['N3', 'pAcem'],
      ['N4', 'pPaleta'],
      ['N5', 'pCupim'],
      ['N6', 'pMusculo'],
      ['N7', 'pPeito'],
      ['N8', 'pRecortes'],
      ['N9', 'pCostela'],
      ['N10', 'pBifeVazio'],
      ['N11', 'pBananinha'],
      ['N12', 'pCapaFile'],
      ['N13', 'pContraFile'],
      ['N14', 'pCorAlcatra'],
      ['N15', 'pCoxaoDuro'],
      ['N16', 'pCoxaoMole'],
      ['N17', 'pFileMignon'],
      ['N18', 'pFralda'],
      ['N19', 'pLagarto'],
      ['N20', 'pMaminha'],
      ['N21', 'pMusculo'],
      ['N22', 'pPatinho'],
      ['N23', 'pPicanha'],
      ['N24', 'pRecAlcatra'],
      ['N25', 'pRecortes'],
      ['N26', 'pGordura'],
    ];

    rendimentosMi.forEach(([cell, key]) => {
      const value =
        request.rendimentosMi.dt[key] ??
        request.rendimentosMi.pa[key] ??
        request.rendimentosMi.tr[key];
      values.push([cell, value]);
    });

    return values;
  }

  // SHEET DE RESULTADOS
  getResultsHeaders(): [string, string][] {
    const resultados = [
      'Entrada MI p/ dia',
      'Entrada ME p/ dia',
      'Entrada TT p/ dia',
      'Produção MI p/ dia',
      'Produção ME p/ dia',
      'Producao TT p/ dia',
      'entrada KG p/ periodo',
      'produzido KG p/ periodo',
      'produzido KG MI p/ periodo',
      'produzido KG ME p/ periodo',
      '% rendimento MI  p/ periodo',
      '% rendimento ME  p/ periodo',
      'compra  p/ periodo',
      'frete boi p/ periodo',
      'arrend  p/ periodo',
      'embalagem  p/ periodo',
      'mod  p/ periodo',
      'frete venda MI  p/ periodo',
      'Comissao MI  p/ periodo',
      'Imp MI  p/ periodo',
      'Rodov ME  p/ periodo',
      'porto ME  p/ periodo',
      'marit ME  p/ periodo',
      'financ ME  p/ periodo',
      'saidas  p/ periodo',
      'entradas  p/ periodo',
      'total  p/ periodo',
    ];

    const kpis = [
      'Custo R$/KG MI',
      'Venda R$/KG MI',
      'Custo R$/KG ME',
      'Venda R$/KG ME',
      'Custo R$/KG FINAL',
      'Venda R$/KG FINAL',
      'Margem Bruta MI',
      'Margem Liquida MI',
      'Margem Bruta ME',
      'Margem Liquida ME',
      'Margem Bruta FINAL',
      'Margem Liquida FINAL',
    ];

    const row = (i: number) => i + 3;

    const headers: [string, string][] = [];

    headers.push(['A1', 'Resultados']);
    resultados.forEach((item, index) => {
      headers.push([`A${row(index)}`, item]);
    });

    headers.push(['D1', 'KPIs']);
    kpis.forEach((item, index) => {
      headers.push([`D${row(index)}`, item]);
    });

    // Linhas da imagem nova
    headers.push(['G1', 'Custo']);
    headers.push(['K1', 'Custo Animais']);
    headers.push(['O1', 'Custo Arrend']);

    headers.push(['G2', 'Custo R$/KG']);
    headers.push(['H2', 'Valor']);
    headers.push(['I2', 'R$/KG']);

    headers.push(['K2', 'Custo R$/KG']);
    headers.push(['L2', 'Valor']);
    headers.push(['M2', 'R$/KG']);

    headers.push(['O2', 'Custo R$/KG']);
    headers.push(['P2', 'Valor']);
    headers.push(['Q2', 'R$/KG']);

    return headers;
  }

  getResultsValues(dto: CashFlowSimulateResponseDto): [string, any][] {
    const values = [];

    // RESULTS
    values.push(
      ['B3', dto.productionValues.total.kgEntradaMi],
      ['B4', dto.productionValues.total.kgEntradaMe],
      ['B5', dto.productionValues.total.kgEntrada],
      ['B6', dto.productionValues.total.kgProduzidoMi],
      ['B7', dto.productionValues.total.kgProduzidoMe],
      ['B8', dto.productionValues.total.kgProduzido],
      ['B9', dto.productionProjection.total.kgEntradaTotal],
      ['B10', dto.productionProjection.total.kgProduzidoTotal],
      ['B11', dto.productionProjection.mi.kgProduzidoTotal],
      ['B12', dto.productionProjection.me.kgProduzidoTotal],
      ['B13', dto.productionProjection.mi.pProduzido],
      ['B14', dto.productionProjection.me.pProduzido],
      ['B15', dto.outingsProjection.compra.valorTotalCompraCabecas],
      ['B16', dto.outingsProjection.compra.valorTotalFrete],
      ['B17', dto.outingsProjection.operacao.arred],
      ['B18', dto.outingsProjection.operacao.embalagem],
      ['B19', dto.outingsProjection.operacao.mod],
      ['B20', dto.outingsProjection.vendas.mi.frete],
      ['B21', dto.outingsProjection.vendas.mi.comissao],
      ['B22', dto.outingsProjection.vendas.mi.imposto],
      ['B23', dto.outingsProjection.vendas.me.rodov],
      ['B24', dto.outingsProjection.vendas.me.porto],
      ['B25', dto.outingsProjection.vendas.me.marit],
      ['B26', dto.outingsProjection.vendas.me.financ],
      ['B27', dto.operationClosureProjection.saidas],
      ['B28', dto.operationClosureProjection.entradas],
      ['B29', dto.operationClosureProjection.fechamento],
    );

    // KPIs
    values.push(
      ['E3', dto.costsByKgProjection.kpis.mi.custoKgFinalMi],
      ['E4', dto.costsByKgProjection.kpis.mi.vendaKgMi],
      ['E5', dto.costsByKgProjection.kpis.me.custoKgFinalMe],
      ['E6', dto.costsByKgProjection.kpis.me.vendaKgMe],
      ['E7', dto.costsByKgProjection.kpis.total.custoKgFinal],
      ['E8', dto.costsByKgProjection.kpis.total.vendaKg],
      ['E9', dto.costsByKgProjection.kpis.mi.margemBrutaMi],
      ['E10', dto.costsByKgProjection.kpis.mi.margemLiquidaMi],
      ['E11', dto.costsByKgProjection.kpis.me.margemBrutaMe],
      ['E12', dto.costsByKgProjection.kpis.me.margemLiquidaMe],
      ['E13', dto.costsByKgProjection.kpis.total.margemBruta],
      ['E14', dto.costsByKgProjection.kpis.total.margemLiquida],
    );

    const row = (i: number) => i + 3;
    console.log({ costsTotal: dto.costsByKgProjection.costs.custoTotal });

    dto.costsByKgProjection.costs.custoTotal.forEach((item, index) =>
      values.push(
        [`G${row(index)}`, item.label],
        [`H${row(index)}`, item.value],
        [`I${row(index)}`, item.costByKg],
      ),
    );

    dto.costsByKgProjection.costs.custoTotalAnimais.forEach((item, index) =>
      values.push(
        [`K${row(index)}`, item.label],
        [`L${row(index)}`, item.value],
        [`M${row(index)}`, item.costByKg],
      ),
    );

    dto.costsByKgProjection.costs.custoTotalArred.forEach((item, index) =>
      values.push(
        [`O${row(index)}`, item.label],
        [`P${row(index)}`, item.value],
        [`Q${row(index)}`, item.costByKg],
      ),
    );

    return values;
  }

  // SHEET DE FC
  getDailyFlowHeaders(): [string, string][] {
    return [
      ['A1', 'Dia'],
      ['B1', 'Compra R$'],
      ['C1', 'Frete Compra R$'],
      ['D1', 'Arrend R$'],
      ['E1', 'Embalagem R$'],
      ['F1', 'MOD R$'],
      ['G1', 'Frete MI R$'],
      ['H1', 'Comissao R$'],
      ['I1', 'Imposto R$'],
      ['J1', 'Frete Rod. R$'],
      ['K1', 'Porto R$'],
      ['L1', 'Frete Marit R$'],
      ['M1', 'Desp. Financ R$'],
      ['N1', 'Saidas R$'],
      ['O1', 'Rec 40'],
      ['P1', 'Rec 60'],
      ['Q1', 'Receitas ME'],
      ['R1', 'Receitas MI'],
      ['S1', 'Receita TT'],
      ['T1', 'Rec - Desp'],
      ['U1', 'Acumulado'],
    ];
  }

  getDailyFlowValues(dto: CashFlowSimulateResponseDto): [string, any][] {
    const dailyFlow = dto.dailyFlowProjection.dailyFlow;
    const values = [];

    const row = (i: number) => i + 2;
    dailyFlow.forEach((item, index) =>
      values.push(
        [`A${row(index)}`, item.dia],
        [`B${row(index)}`, item.compraBoi],
        [`C${row(index)}`, item.freteBoi],
        [`D${row(index)}`, item.arrend],
        [`E${row(index)}`, item.embalagem],
        [`F${row(index)}`, item.mod],
        [`G${row(index)}`, item.freteMi],
        [`H${row(index)}`, item.comissaoMi],
        [`I${row(index)}`, item.impostoMi],
        [`J${row(index)}`, item.freteRodMe],
        [`K${row(index)}`, item.portoMe],
        [`L${row(index)}`, item.maritMe],
        [`M${row(index)}`, item.financMe],
        [`N${row(index)}`, item.saidas],
        [`O${row(index)}`, item.recMe40],
        [`P${row(index)}`, item.recMe60],
        [`Q${row(index)}`, item.recMe],
        [`R${row(index)}`, item.recMi],
        [`S${row(index)}`, item.recTotal],
        [`T${row(index)}`, item.recTotalWithExpenses],
        [`U${row(index)}`, item.acc],
      ),
    );

    return values;
  }

  async export({ request, results }: CashFlowExportReportDto) {
    this.excelReader.create();

    const controlsWorksheet = this.excelReader.addWorksheet('CONTROLES');
    const resultsWorksheet = this.excelReader.addWorksheet('RESULTADOS');
    const dailyFlowWorksheet = this.excelReader.addWorksheet('FLUXO DE CAIXA');

    const controlsHeaders = this.getControlsHeaders();
    controlsHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(controlsWorksheet, cell, value);
    });
    const controlsValues = this.getControlsValues(request);
    controlsValues.forEach(([cell, value]) => {
      this.excelReader.addData(controlsWorksheet, cell, value);
    });

    // Sheet de resultados
    const resultsHeaders = this.getResultsHeaders();
    resultsHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(resultsWorksheet, cell, value);
    });

    const resultsValues = this.getResultsValues(
      results as CashFlowSimulateResponseDto,
    );
    resultsValues.forEach(([cell, value]) => {
      this.excelReader.addData(resultsWorksheet, cell, value);
    });

    // Sheet de FC
    const dailyFlowHeaders = this.getDailyFlowHeaders();
    dailyFlowHeaders.forEach(([cell, value]) => {
      this.excelReader.addData(dailyFlowWorksheet, cell, value);
    });

    const dailyFlowValues = this.getDailyFlowValues(
      results as CashFlowSimulateResponseDto,
    );
    dailyFlowValues.forEach(([cell, value]) => {
      this.excelReader.addData(dailyFlowWorksheet, cell, value);
    });

    return await this.excelReader.toFile();
  }
}
