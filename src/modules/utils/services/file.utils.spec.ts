import { FileUtils } from './file.utils';
import { it, describe, expect } from 'vitest';

describe('FileUtils', () => {
  describe('Get File Extension', () => {
    it('should be able to get file extension', () => {
      const sut1 = FileUtils.fileExtension('arquivo.teste.xlsx');
      expect(sut1).toBe('.xlsx');

      const sut2 = FileUtils.fileExtension(
        '20241023_TGC_Finpec_ÁguaLimpa_JBonifácio - Copia.xlsx',
      );
      expect(sut2).toBe('.xlsx');
    });
  });

  describe('Get Relative Folder Name', () => {
    it('should be able to get relative folder name from CDZ', () => {
      const sut = FileUtils.getRelativeFolderName(
        'Finpec2/Documentos Compartilhados/17. Risco/17.7 Auditoria/03. Dados do Gado/TGCs originais/Agrobarra - Joviania',
      );

      expect(sut).toBe('Agrobarra - Joviania');
    });
  });
});
