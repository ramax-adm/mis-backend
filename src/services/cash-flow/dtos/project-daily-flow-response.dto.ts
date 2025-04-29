import { NumberUtils } from '@/services/utils/number.utils';

export class ProjectDailyFlowResponseDto {
  diasPosicao: number;
  breakEven: number | null;
  breakEvenFinal: number | null;
  dailyFlow: DailyFlowProjection[];

  static getData(raw: ProjectDailyFlowResponseDto) {
    const response = {
      diasPosicao: raw.diasPosicao,
      breakEven: raw.breakEven ?? 'Não alcançado',
      breakEvenFinal: raw.breakEvenFinal ?? 'Não alcançado',
      dailyFlow: [],
    };

    for (const flow of raw.dailyFlow) {
      response.dailyFlow.push({
        dia: flow.dia,
        compraBoi: NumberUtils.toLocaleString(flow.compraBoi),
        freteBoi: NumberUtils.toLocaleString(flow.freteBoi),
        arrend: NumberUtils.toLocaleString(flow.arrend),
        embalagem: NumberUtils.toLocaleString(flow.embalagem),
        mod: NumberUtils.toLocaleString(flow.mod),
        freteMi: NumberUtils.toLocaleString(flow.freteMi),
        comissaoMi: NumberUtils.toLocaleString(flow.comissaoMi),
        impostoMi: NumberUtils.toLocaleString(flow.impostoMi),
        freteRodMe: NumberUtils.toLocaleString(flow.freteRodMe),
        portoMe: NumberUtils.toLocaleString(flow.portoMe),
        maritMe: NumberUtils.toLocaleString(flow.maritMe),
        financMe: NumberUtils.toLocaleString(flow.financMe),
        saidas: NumberUtils.toLocaleString(flow.saidas),
        saidasAcc: NumberUtils.toLocaleString(flow.saidasAcc),
        recMe40: NumberUtils.toLocaleString(flow.recMe40),
        recMe60: NumberUtils.toLocaleString(flow.recMe60),
        recMe: NumberUtils.toLocaleString(flow.recMe),
        recMi: NumberUtils.toLocaleString(flow.recMi),
        recTotal: NumberUtils.toLocaleString(flow.recTotal),
        recTotalAcc: NumberUtils.toLocaleString(flow.recTotalAcc),
        recTotalWithExpenses: NumberUtils.toLocaleString(
          flow.recTotalWithExpenses,
        ),
        acc: NumberUtils.toLocaleString(flow.acc),
      });
    }
    return response;
  }
}

export class DailyFlowProjection {
  dia: number;
  compraBoi: number;
  freteBoi: number;
  arrend: number;
  embalagem: number;
  mod: number;
  freteMi: number;
  comissaoMi: number;
  impostoMi: number;
  freteRodMe: number;
  portoMe: number;
  maritMe: number;
  financMe: number;
  saidas: number;
  saidasAcc: number;
  recMe40: number;
  recMe60: number;
  recMe: number;
  recMi: number;
  recTotal: number;
  recTotalAcc: number;
  recTotalWithExpenses: number;
  acc: number;
}
