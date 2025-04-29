export class StringUtils {
  static ILike(pattern: string, testString: string) {
    // Substituir os curingas SQL por padrões RegExp
    const regexPattern = pattern.replace(/%/g, '.*').replace(/_/g, '.');
    const regex = new RegExp(`^${regexPattern}$`, 'i'); // '^' e '$' para correspondência exata
    return regex.test(testString);
  }
}
