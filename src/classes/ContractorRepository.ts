import { Business } from "../interfaces/socialEntity";
import { BaseDocRepository } from "./BaseRepository";
import { dbContext } from "../services";
import { uuidv7 } from "uuidv7";


interface ContractorRepositoryInterface {
  add(cropDoc: Business): Promise<any>;
  getAll(): Promise<Business[]>;
  getByCategory(category: string): Promise<Business[]>;
}

export class ContractorRepository
  extends BaseDocRepository<Business>
  implements ContractorRepositoryInterface
{
  private static instance: ContractorRepository;
  private _businnes: Business[];

  constructor(userId?: string) {
    super(dbContext.socialEntities, userId);
  }

  // Método estático para obtener la instancia singleton
  public static getInstance(userId?: string): ContractorRepository {
    if (!ContractorRepository.instance) {
      ContractorRepository.instance = new ContractorRepository(userId);
    }
    return ContractorRepository.instance;
  }

  async getAll() {
    console.log("🔍 ContractorRepository - getAll - Obteniendo todos los documentos...");
    this._businnes = (await this.getAllDocs("")) as unknown as Business[];
    console.log("🔍 ContractorRepository - getAll - Documentos obtenidos:", this._businnes);
    console.log("🔍 ContractorRepository - getAll - Cantidad:", this._businnes.length);
    console.log("🔍 ContractorRepository - getAll - Primer documento (ejemplo):", this._businnes[0]);
    return this._businnes;
  }

  async getByCategory(category: string): Promise<Business[]> {
    this._businnes = (await this.getAllDocs("")) as unknown as Business[];
    console.log("🔍 ContractorRepository - getByCategory - All businesses:", this._businnes);
    console.log("🔍 ContractorRepository - getByCategory - Filtering by category:", category);
    
    const filteredBusinesses = this._businnes.filter((business: Business) => {
      if (!business) return false;
      
      // Para Ingeniero Agronomo (category: 55ff1ae2-d441-4067-9e59-b4cf63d54bfd)
      if (category === '55ff1ae2-d441-4067-9e59-b4cf63d54bfd') {
        // Buscar por categorias array que contenga "Ingeniero Agronomo" o el ID
        if (business.categorias && Array.isArray(business.categorias)) {
          const hasIngenieroCategory = business.categorias.some((cat: string) => 
            cat === 'Ingeniero Agronomo' || cat === category
          );
          if (hasIngenieroCategory) return true;
        }
        
        // Buscar por nombre que contenga "INGENIERO AGRONOMO"
        if (business.razonSocial && business.razonSocial.toUpperCase().includes('INGENIERO AGRONOMO')) {
          return true;
        }
        
        return false;
      }
      
      // Para Contratista (category: 8456b733-d530-4c7d-8907-66f117938769)
      if (category === '8456b733-d530-4c7d-8907-66f117938769') {
        // Buscar documentos con _id que empiece con "contractor:"
        if (business._id && business._id.startsWith('contractor:')) {
          return true;
        }
        
        // Buscar por tipoEntidad "Contratista"
        if (business.tipoEntidad === 'Contratista') {
          return true;
        }
        
        // Buscar por categorias array que contenga "Contratista" o el ID específico
        if (business.categorias && Array.isArray(business.categorias)) {
          const hasContratistaCategory = business.categorias.some((cat: string) => 
            cat === 'Contratista' || 
            cat === category ||
            cat === '1098d6cb-3301-41fa-aa64-d4a4a1127177' // ID encontrado en los datos
          );
          if (hasContratistaCategory) return true;
        }
        
        return false;
      }
      
      // Para otros casos, usar la lógica original
      const hasInCategorias = business.categorias && Array.isArray(business.categorias) && 
        business.categorias.includes(category);
      const hasInIdCategory = business.idCategory === category;
      
      return hasInCategorias || hasInIdCategory;
    });
    
    console.log("🔍 ContractorRepository - getByCategory - Filtered result:", filteredBusinesses);
    return filteredBusinesses;
  }

  async add(doc: Business) {
    if (!doc._id) {
      doc._id = "contractor:" + uuidv7();
    }
    await this.saveDoc(doc);
    this.getAll().then(() => this.notify());
    return doc;
  }

  // Método público para forzar actualización de observers (útil cuando se crea desde otro sistema)
  async refreshAndNotify(): Promise<void> {
    console.log("🔄 ContractorRepository - Refreshing data and notifying observers...");
    await this.getAll();
    console.log("📢 ContractorRepository - Notifying", this.observers.length, "observers with", this._businnes.length, "businesses");
    this.notify();
  }

  private notify(): void {
    console.log("Subject: Notifying observers...");
    for (const observer of this.observers) {
      observer(this._businnes);
    }
  }
}
