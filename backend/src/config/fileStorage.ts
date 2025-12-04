import fs from 'fs/promises';
import path from 'path';

const DATA_DIR = path.join(__dirname, '../../data');

export class FileStorage {
  private static async ensureDataDir(): Promise<void> {
    try {
      await fs.access(DATA_DIR);
    } catch {
      await fs.mkdir(DATA_DIR, { recursive: true });
    }
  }

  private static getFilePath(filename: string): string {
    return path.join(DATA_DIR, filename);
  }

  static async readFile<T>(filename: string): Promise<T[]> {
    await this.ensureDataDir();
    const filePath = this.getFilePath(filename);
    
    try {
      const data = await fs.readFile(filePath, 'utf-8');
      return JSON.parse(data) as T[];
    } catch (error) {
      // File doesn't exist, return empty array
      return [] as T[];
    }
  }

  static async writeFile<T>(filename: string, data: T[]): Promise<void> {
    await this.ensureDataDir();
    const filePath = this.getFilePath(filename);
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
  }

  static async appendToFile<T>(filename: string, item: T): Promise<void> {
    const data = await this.readFile<T>(filename);
    data.push(item);
    await this.writeFile(filename, data);
  }

  static async updateFile<T extends { id: string }>(
    filename: string, 
    id: string, 
    updateFn: (item: T) => T
  ): Promise<boolean> {
    const data = await this.readFile<T>(filename);
    const index = data.findIndex(item => item.id === id);
    
    if (index === -1) return false;
    
    data[index] = updateFn(data[index]);
    await this.writeFile(filename, data);
    return true;
  }

  static async deleteFromFile<T extends { id: string }>(
    filename: string, 
    id: string
  ): Promise<boolean> {
    const data = await this.readFile<T>(filename);
    const initialLength = data.length;
    const filteredData = data.filter(item => item.id !== id);
    
    if (filteredData.length === initialLength) return false;
    
    await this.writeFile(filename, filteredData);
    return true;
  }

  static async findInFile<T extends { id: string }>(
    filename: string, 
    predicate: (item: T) => boolean
  ): Promise<T[]> {
    const data = await this.readFile<T>(filename);
    return data.filter(predicate);
  }
}
