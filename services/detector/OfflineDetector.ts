// Define a type for the structure of your disease data for better code safety
export interface DiseaseInfo {
  symptoms: string[];
  cause: string;
  cure: {
    organic: string[];
    chemical: string[];
  };
}

class OfflineKnowledgeService {
  private database: Record<string, DiseaseInfo> | null = null;

  // Load the entire JSON database from assets into memory
  async loadDatabase(): Promise<void> {
    if (this.database) return;

    try {
      console.log("Loading offline disease database...");
      // In React Native / Expo, requiring JSON directly guarantees instant, bundled offline loading
      const data = require('../../assets/disease_database.json');
      this.database = data;
      console.log("Offline database loaded successfully!");
    } catch (error) {
      console.error("Failed to load offline disease database:", error);
    }
  }

  // Get the details for a specific disease by its name
  getDiseaseInfo(diseaseName: string): DiseaseInfo | null {
    if (!this.database) {
      try {
        this.database = require('../../assets/disease_database.json');
      } catch {
        return null;
      }
    }
    return this.database ? this.database[diseaseName] || null : null;
  }
}

// Export a singleton instance so the database is only loaded once.
export const offlineKnowledgeService = new OfflineKnowledgeService();
