import { customType } from 'drizzle-orm/pg-core';

export interface VectorConfig {
  dimensions: number;
}

// Custom vector type for PostgreSQL
export const vector = customType<{ data: number[]; config: VectorConfig }>({
  dataType(config) {
    return `vector(${config?.dimensions || 1536})`;
  },
  fromDriver(value: unknown): number[] {
    if (!value) return [];
    // Convert PostgreSQL vector notation to array of numbers
    const valueStr = String(value);
    return valueStr
      .replace('[', '')
      .replace(']', '')
      .split(',')
      .map(str => parseFloat(str.trim()));
  },
  toDriver(value: number[]): string {
    // Convert array to PostgreSQL vector notation
    if (!Array.isArray(value)) return '[]';
    return `[${value.join(',')}]`;
  },
}); 