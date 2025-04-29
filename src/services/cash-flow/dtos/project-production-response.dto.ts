import { NumberUtils } from '@/services/utils/number.utils';

export class ProjectProductionResponseDto {
  total: {
    kgEntradaTotal: number;
    kgProduzidoTotal: number;
  };
  mi: {
    kgTotalEntrada: number;
    kgProduzidoTotal: number;
    pProduzido: number;
  };
  me: {
    kgTotalEntrada: number;
    kgProduzidoTotal: number;
    pProduzido: number;
  };

  static getData(raw: ProjectProductionResponseDto) {
    return {
      total: {
        kgEntradaTotal: NumberUtils.toLocaleString(raw.total.kgEntradaTotal),
        kgProduzidoTotal: NumberUtils.toLocaleString(
          raw.total.kgProduzidoTotal,
        ),
      },
      mi: {
        kgTotalEntrada: NumberUtils.toLocaleString(raw.mi.kgTotalEntrada),
        kgProduzidoTotal: NumberUtils.toLocaleString(raw.mi.kgProduzidoTotal),
        pProduzido: NumberUtils.toPercent(raw.mi.pProduzido),
      },
      me: {
        kgTotalEntrada: NumberUtils.toLocaleString(raw.me.kgTotalEntrada),
        kgProduzidoTotal: NumberUtils.toLocaleString(raw.me.kgProduzidoTotal),
        pProduzido: NumberUtils.toPercent(raw.me.pProduzido),
      },
    };
  }
}
