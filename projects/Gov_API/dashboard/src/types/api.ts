export interface TradeData {
  Type: string;
  MunicipalityCode: string;
  Prefecture: string;
  Municipality: string;
  DistrictName: string;
  TradePrice: string;
  PricePerUnit: string;
  FloorPlan: string;
  Area: string;
  UnitPrice: string;
  LandShape: string;
  Frontage: string;
  TotalFloorArea: string;
  BuildingYear: string;
  Structure: string;
  Use: string;
  Purpose: string;
  Direction: string;
  Classification: string;
  Breadth: string;
  CityPlanning: string;
  CoverageRatio: string;
  FloorAreaRatio: string;
  Period: string;
  Renovation: string;
  Remarks: string;
}

export interface MonthlyPrice {
  period: string; // e.g., "2023-Q3"
  price: number;
  unitPrice: number;
  count: number;
}
