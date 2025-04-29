import { NumberUtils } from '@/services/utils/number.utils';

export class GetProductionValuesResponseDto {
  me: {
    dt: {
      entradaDt: number;
      pRendimentoDt: number;
      kgRendimentoDt: number;
    };
    pa: {
      entradaPa: number;
      pRendimentoPa: number;
      kgRendimentoPa: number;
    };
    tr: {
      entradaTr: number;
      pRendimentoTr: number;
      kgRendimentoTr: number;
    };
  };

  mi: {
    dt: {
      entradaDt: number;
      pRendimentoDt: number;
      kgRendimentoDt: number;
    };
    pa: {
      entradaPa: number;
      pRendimentoPa: number;
      kgRendimentoPa: number;
    };
    tr: {
      entradaTr: number;
      pRendimentoTr: number;
      kgRendimentoTr: number;
    };
  };

  totalByQuartering: {
    dt: {
      entradaDt: number;
      pRendimentoDt: number;
      kgProduzidoDt: number;
    };
    pa: {
      entradaPa: number;
      pRendimentoPa: number;
      kgProduzidoPa: number;
    };
    tr: {
      entradaTr: number;
      pRendimentoTr: number;
      kgProduzidoTr: number;
    };
  };
  total: {
    kgEntradaMi: number;
    kgProduzidoMi: number;
    pRendimentoMi: number;
    kgEntradaMe: number;
    kgProduzidoMe: number;
    pRendimentoMe: number;
    kgEntrada: number;
    pRendimento: number;
    kgProduzido: number;
  };

  static getData(data: GetProductionValuesResponseDto) {
    return {
      me: {
        dt: {
          entradaDt: NumberUtils.toLocaleString(data.me.dt.entradaDt),
          pRendimentoDt: NumberUtils.toPercent(data.me.dt.pRendimentoDt),
          kgRendimentoDt: NumberUtils.toLocaleString(data.me.dt.kgRendimentoDt),
        },
        pa: {
          entradaPa: NumberUtils.toLocaleString(data.me.pa.entradaPa),
          pRendimentoPa: NumberUtils.toPercent(data.me.pa.pRendimentoPa),
          kgRendimentoPa: NumberUtils.toLocaleString(data.me.pa.kgRendimentoPa),
        },
        tr: {
          entradaTr: NumberUtils.toLocaleString(data.me.tr.entradaTr),
          pRendimentoTr: NumberUtils.toPercent(data.me.tr.pRendimentoTr),
          kgRendimentoTr: NumberUtils.toLocaleString(data.me.tr.kgRendimentoTr),
        },
      },

      mi: {
        dt: {
          entradaDt: NumberUtils.toLocaleString(data.mi.dt.entradaDt),
          pRendimentoDt: NumberUtils.toPercent(data.mi.dt.pRendimentoDt),
          kgRendimentoDt: NumberUtils.toLocaleString(data.mi.dt.kgRendimentoDt),
        },
        pa: {
          entradaPa: NumberUtils.toLocaleString(data.mi.pa.entradaPa),
          pRendimentoPa: NumberUtils.toPercent(data.mi.pa.pRendimentoPa),
          kgRendimentoPa: NumberUtils.toLocaleString(data.mi.pa.kgRendimentoPa),
        },
        tr: {
          entradaTr: NumberUtils.toLocaleString(data.mi.tr.entradaTr),
          pRendimentoTr: NumberUtils.toPercent(data.mi.tr.pRendimentoTr),
          kgRendimentoTr: NumberUtils.toLocaleString(data.mi.tr.kgRendimentoTr),
        },
      },

      totalByQuartering: {
        dt: {
          entradaDt: NumberUtils.toLocaleString(
            data.totalByQuartering.dt.entradaDt,
          ),
          pRendimentoDt: NumberUtils.toPercent(
            data.totalByQuartering.dt.pRendimentoDt,
          ),
          kgRendimentoDt: NumberUtils.toLocaleString(
            data.totalByQuartering.dt.kgProduzidoDt,
          ),
        },
        pa: {
          entradaPa: NumberUtils.toLocaleString(
            data.totalByQuartering.pa.entradaPa,
          ),
          pRendimentoPa: NumberUtils.toPercent(
            data.totalByQuartering.pa.pRendimentoPa,
          ),
          kgRendimentoPa: NumberUtils.toLocaleString(
            data.totalByQuartering.pa.kgProduzidoPa,
          ),
        },
        tr: {
          entradaTr: NumberUtils.toLocaleString(
            data.totalByQuartering.tr.entradaTr,
          ),
          pRendimentoTr: NumberUtils.toPercent(
            data.totalByQuartering.tr.pRendimentoTr,
          ),
          kgRendimentoTr: NumberUtils.toLocaleString(
            data.totalByQuartering.tr.kgProduzidoTr,
          ),
        },
      },
      total: {
        kgEntradaMi: NumberUtils.toLocaleString(data.total.kgEntradaMi),
        kgProduzidoMi: NumberUtils.toLocaleString(data.total.kgProduzidoMi),
        pRendimentoMi: NumberUtils.toPercent(data.total.pRendimentoMi),
        kgEntradaMe: NumberUtils.toLocaleString(data.total.kgEntradaMe),
        kgProduzidoMe: NumberUtils.toLocaleString(data.total.kgProduzidoMe),
        pRendimentoMe: NumberUtils.toPercent(data.total.pRendimentoMe),
        kgEntrada: NumberUtils.toLocaleString(data.total.kgEntrada),
        kgProduzido: NumberUtils.toLocaleString(data.total.kgProduzido),
        pRendimento: NumberUtils.toPercent(data.total.pRendimento),
      },
    };
  }
}
