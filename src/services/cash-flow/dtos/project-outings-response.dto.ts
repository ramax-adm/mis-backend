import { NumberUtils } from '@/services/utils/number.utils';
import { IsNumber, IsObject } from 'class-validator';

export class ProjectOutingsResponseDto {
  @IsObject()
  compra: {
    valorTotalCompraCabecas: number;
    valorTotalFrete: number;
    me: {
      valorFreteBoiMe: number;
      valorCompraCabecasMe: number;
    };
    mi: {
      valorFreteBoiMi: number;
      valorCompraCabecasMi: number;
    };
  };
  @IsObject()
  operacao: {
    arred: number;
    embalagem: number;
    mod: number;
    me: {
      valorEmbalagemMe: number;
      valorModMe: number;
      arredMe: number;
    };
    mi: { valorEmbalagemMi: number; valorModMi: number; arredMi: number };
  };
  @IsObject()
  vendas: {
    me: {
      rodov: number;
      porto: number;
      marit: number;
      financ: number;
    };
    mi: {
      frete: number;
      comissao: number;
      imposto: number;
    };
  };
  @IsNumber()
  totalExpenses: number;

  static getData(raw: ProjectOutingsResponseDto) {
    return {
      compra: {
        valorTotalCompraCabecas: NumberUtils.toLocaleString(
          raw.compra.valorTotalCompraCabecas,
        ),
        valorTotalFrete: NumberUtils.toLocaleString(raw.compra.valorTotalFrete),
        me: {
          valorFreteBoiMe: NumberUtils.toLocaleString(
            raw.compra.me.valorFreteBoiMe,
          ),
          valorCompraCabecasMe: NumberUtils.toLocaleString(
            raw.compra.me.valorCompraCabecasMe,
          ),
        },
        mi: {
          valorFreteBoiMi: NumberUtils.toLocaleString(
            raw.compra.mi.valorFreteBoiMi,
          ),
          valorCompraCabecasMi: NumberUtils.toLocaleString(
            raw.compra.mi.valorCompraCabecasMi,
          ),
        },
      },
      operacao: {
        arred: NumberUtils.toLocaleString(raw.operacao.arred),
        embalagem: NumberUtils.toLocaleString(raw.operacao.embalagem),
        mod: NumberUtils.toLocaleString(raw.operacao.mod),
        me: {
          valorEmbalagemMe: NumberUtils.toLocaleString(
            raw.operacao.me.valorEmbalagemMe,
          ),
          valorModMe: NumberUtils.toLocaleString(raw.operacao.me.valorModMe),
          arredMe: NumberUtils.toLocaleString(raw.operacao.me.arredMe),
        },
        mi: {
          valorEmbalagemMi: NumberUtils.toLocaleString(
            raw.operacao.mi.valorEmbalagemMi,
          ),
          valorModMi: NumberUtils.toLocaleString(raw.operacao.mi.valorModMi),
          arredMi: NumberUtils.toLocaleString(raw.operacao.mi.arredMi),
        },
      },
      vendas: {
        me: {
          rodov: NumberUtils.toLocaleString(raw.vendas.me.rodov),
          porto: NumberUtils.toLocaleString(raw.vendas.me.porto),
          marit: NumberUtils.toLocaleString(raw.vendas.me.marit),
          financ: NumberUtils.toLocaleString(raw.vendas.me.financ),
        },
        mi: {
          frete: NumberUtils.toLocaleString(raw.vendas.mi.frete),
          comissao: NumberUtils.toLocaleString(raw.vendas.mi.comissao),
          imposto: NumberUtils.toLocaleString(raw.vendas.mi.imposto),
        },
      },
      totalExpenses: NumberUtils.toLocaleString(raw.totalExpenses),
    };
  }
}
