import { BackendRole, CategoryData, DistrictData, ReportResponse, UserManagementResponse } from "./api";

const DB_KEY = "urbanfix_mock_db_v2";

export interface MockDatabaseSchema {
  users: UserManagementResponse[];
  districts: DistrictData[];
  categories: CategoryData[];
  reports: ReportResponse[];
  upvotes: Record<number, number[]>; // report_id -> list of user_ids who upvoted
}

const SEED_DATA: MockDatabaseSchema = {
  users: [
    { id: 1, full_name: "Citizen Ahmed", national_id: "400400", role: "Citizen", created_at: new Date().toISOString() },
    { id: 2, full_name: "Tech Rami", national_id: "300300", role: "Technician", created_at: new Date().toISOString() },
    { id: 3, full_name: "Manager Sara", national_id: "200200", role: "DistrictManager", created_at: new Date().toISOString() },
    { id: 4, full_name: "Governor Khaled", national_id: "100100", role: "Governor", created_at: new Date().toISOString() },
  ],
  districts: [
    { id: 1, name: "Downtown" },
    { id: 2, name: "Nasr City" },
    { id: 3, name: "Heliopolis" },
    { id: 4, name: "Maadi" },
  ],
  categories: [
    { id: 1, name: "Pothole", default_priority: "Medium", sla_hours: 48 },
    { id: 2, name: "Streetlight", default_priority: "Low", sla_hours: 24 },
    { id: 3, name: "Water leak", default_priority: "High", sla_hours: 4 },
    { id: 4, name: "Graffiti", default_priority: "Low", sla_hours: 72 },
    { id: 5, name: "Trash / Debris", default_priority: "Medium", sla_hours: 12 },
  ],
  reports: [
    {
      id: 1,
      citizen_id: 1,
      citizen_name: "Citizen Ahmed",
      category: "Water leak",
      urgency: "Critical",
      latitude: 30.0444,
      longitude: 31.2357,
      address_description: "Downtown, Talaat Harb St",
      description: "Massive pipe burst, water is flooding the street.",
      status: "Assigned",
      technician_id: 2,
      technician_name: "Tech Rami",
      is_public: true,
      created_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 3600_000).toISOString(),
      upvote_count: 12,
      has_upvoted: false,
    },
    {
      id: 2,
      citizen_id: 1,
      citizen_name: "Citizen Ahmed",
      category: "Streetlight",
      urgency: "Medium",
      latitude: 30.0626,
      longitude: 31.3283,
      address_description: "Nasr City, Makram Ebeid St",
      description: "Streetlight flickering continuously.",
      status: "InProgress",
      technician_id: 2,
      technician_name: "Tech Rami",
      is_public: true,
      created_at: new Date(Date.now() - 30 * 3600_000).toISOString(), // Overdue
      updated_at: new Date(Date.now() - 10 * 3600_000).toISOString(),
      upvote_count: 5,
      has_upvoted: false,
    },
    {
      id: 3,
      citizen_id: 1,
      citizen_name: "Citizen Ahmed",
      category: "Pothole",
      urgency: "High",
      latitude: 30.0763,
      longitude: 31.3275,
      address_description: "Nasr City, Abbas El Akkad St",
      description: "Large pothole in the middle of the street.",
      status: "Resolved",
      technician_id: 2,
      technician_name: "Tech Rami",
      is_public: true,
      created_at: new Date(Date.now() - 48 * 3600_000).toISOString(),
      updated_at: new Date(Date.now() - 2 * 3600_000).toISOString(),
      upvote_count: 24,
      has_upvoted: false,
    },
    {
      id: 4,
      citizen_id: 1,
      citizen_name: "Citizen Ahmed",
      category: "Trash / Debris",
      urgency: "Low",
      latitude: 30.0888,
      longitude: 31.3200,
      address_description: "Heliopolis, Korba",
      description: "Trash bins overflowing.",
      status: "Reported",
      is_public: true,
      created_at: new Date(Date.now() - 1 * 3600_000).toISOString(),
      updated_at: new Date(Date.now() - 1 * 3600_000).toISOString(),
      upvote_count: 2,
      has_upvoted: false,
    },
  ],
  upvotes: {},
};

export class MockDB {
  private db: MockDatabaseSchema;

  constructor() {
    this.db = this.load();
  }

  private load(): MockDatabaseSchema {
    if (typeof window === "undefined") return SEED_DATA;
    const raw = localStorage.getItem(DB_KEY);
    if (!raw) {
      localStorage.setItem(DB_KEY, JSON.stringify(SEED_DATA));
      return SEED_DATA;
    }
    return JSON.parse(raw) as MockDatabaseSchema;
  }

  private save() {
    if (typeof window !== "undefined") {
      localStorage.setItem(DB_KEY, JSON.stringify(this.db));
    }
  }

  public get<K extends keyof MockDatabaseSchema>(key: K): MockDatabaseSchema[K] {
    return this.db[key];
  }

  public set<K extends keyof MockDatabaseSchema>(key: K, value: MockDatabaseSchema[K]) {
    this.db[key] = value;
    this.save();
  }

  public updateReport(id: number, updater: (r: ReportResponse) => Partial<ReportResponse>) {
    const r = this.db.reports.find(x => x.id === id);
    if (r) {
      Object.assign(r, updater(r));
      r.updated_at = new Date().toISOString();
      this.save();
      return { ...r };
    }
    throw new Error("Report not found");
  }
}

export const db = new MockDB();

// Helper to simulate network latency
export const delay = (ms: number = 400) => new Promise(res => setTimeout(res, ms));
