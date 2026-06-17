declare module "bidi-js" {
  interface BidiResult {
    levels: number[];
    paragraphs: number[];
  }

  interface BidiAPI {
    getEmbeddingLevels(text: string): BidiResult;
    getReorderedString(text: string, levels: BidiResult): string;
    getReorderedIndices(text: string, levels: BidiResult): number[];
    getReorderSegments(text: string, levels: BidiResult): number[][];
    getMirroredCharacter(char: string): string | null;
    getMirroredCharactersMap(): Record<string, string>;
    getBidiCharType(char: string): number;
    getBidiCharTypeName(char: string): string;
    getCanonicalBracket(char: string): string | null;
    closingToOpeningBracket(char: string): string | null;
    openingToClosingBracket(char: string): string | null;
  }

  export default function createBidi(): BidiAPI;
}
