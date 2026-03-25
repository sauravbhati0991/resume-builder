// ==========================================
// 1. IMPORT CATEGORY DEFAULT TEMPLATES
// ==========================================
import AdminSupportTemplate from "./Administrative/AdminSupportTemplate";
import TechTemplate from "./Technology/TechTemplate";
import HealthcareTemplate from "./Healthcare/HealthcareTemplate";
import EducationTemplate from "./Education/EducationTemplate";
import SalesTemplate from "./Sales/SalesTemplate";
import EngineeringTemplate from "./Engineering/EngineeringTemplate";
import CreativeTemplate from "./Creative/CreativeTemplate";
import FinanceTemplate from "./Finance/FinanceTemplate";
import ManufacturingTemplate from "./Manufacturing/ManufacturingTemplate";
import CustomerServiceTemplate from "./Customer/CustomerServiceTemplate";
import LegalTemplate from "./Legal/LegalTemplate";
import HospitalityTemplate from "./Hospitality/HospitalityTemplate";
import LogisticsTemplate from "./Logistics/LogisticsTemplate";
import ScienceTemplate from "./Science/ScienceTemplate";
import PublicSectorTemplate from "./PublicSector/PublicSectorTemplate";
import AcademicTemplate from "./Academic/AcademicTemplate"; 

// ==========================================
// 2. IMPORT SPECIFIC PRO TEMPLATES 
// ==========================================
// Administrative
import ExecutiveAssistantEliteTemplate from "./Administrative/ExecutiveAssistantEliteTemplate";
import OperationsCoordinatorProTemplate from "./Administrative/OperationsCoordinatorProTemplate";
import AdminSpecialistModernTemplate from "./Administrative/AdminSpecialistModernTemplate";
import OfficeManagerProTemplate from "./Administrative/OfficeManagerProTemplate";
import ProjectSupportExpertTemplate from "./Administrative/ProjectSupportExpertTemplate";

// Technology
import CloudArchitectEliteTemplate from "./Technology/CloudArchitectEliteTemplate";
import DataScientistModernTemplate from "./Technology/DataScientistModernTemplate";
import CybersecurityAnalystProTemplate from "./Technology/CybersecurityAnalystProTemplate";
import ITManagerPortfolioTemplate from "./Technology/ITManagerPortfolioTemplate";
import FullStackDevProTemplate from "./Technology/FullStackDevProTemplate";

// Healthcare
import NursePractitionerEliteTemplate from "./Healthcare/NursePractitionerEliteTemplate";
import MedicalDirectorProTemplate from "./Healthcare/MedicalDirectorProTemplate";
import ClinicalPharmacistModernTemplate from "./Healthcare/ClinicalPharmacistModernTemplate";
import PhysicalTherapistProTemplate from "./Healthcare/PhysicalTherapistProTemplate";
import HealthcareAdminLeadTemplate from "./Healthcare/HealthcareAdminLeadTemplate";

// Education
import SeniorEducatorEliteTemplate from "./Education/SeniorEducatorEliteTemplate";
import AcademicDirectorProTemplate from "./Education/AcademicDirectorProTemplate";
import SpecialEdExpertProTemplate from "./Education/SpecialEdExpertProTemplate";
import UniversityProfessorPortfolioTemplate from "./Education/UniversityProfessorPortfolioTemplate";
import CurriculumDesignerProTemplate from "./Education/CurriculumDesignerProTemplate";

// Sales
import MarketingDirectorEliteTemplate from "./Sales/MarketingDirectorEliteTemplate";
import SalesExecutiveProTemplate from "./Sales/SalesExecutiveProTemplate";
import BrandStrategyModernTemplate from "./Sales/BrandStrategyModernTemplate";
import DigitalGrowthProTemplate from "./Sales/DigitalGrowthProTemplate";
import AccountManagerPortfolioTemplate from "./Sales/AccountManagerPortfolioTemplate";

// Engineering
import StructuralEngineerEliteTemplate from "./Engineering/StructuralEngineerEliteTemplate";
import MechanicalDesignProTemplate from "./Engineering/MechanicalDesignProTemplate";
import ElectricalSystemsProTemplate from "./Engineering/ElectricalSystemsProTemplate";
import ProjectEngineerModernTemplate from "./Engineering/ProjectEngineerModernTemplate";
import ReliabilityEngineerProTemplate from "./Engineering/ReliabilityEngineerProTemplate";

// Creative
import CreativeDirectorEliteTemplate from "./Creative/CreativeDirectorEliteTemplate";
import ArtDirectorProTemplate from "./Creative/ArtDirectorProTemplate";
import UxUiDesignerModernTemplate from "./Creative/UxUiDesignerModernTemplate";
import ContentStrategyProTemplate from "./Creative/ContentStrategyProTemplate";
import MultimediaDesignerPortfolioTemplate from "./Creative/MultimediaDesignerPortfolioTemplate";

// Finance
import InvestmentBankerProTemplate from "./Finance/InvestmentBankerProTemplate";
import CaEliteTemplate from "./Finance/CaEliteTemplate";
import FinancialAnalystModernTemplate from "./Finance/FinancialAnalystModernTemplate";
import AuditorProTemplate from "./Finance/AuditorProTemplate";
import TaxConsultantPortfolioTemplate from "./Finance/TaxConsultantPortfolioTemplate";

// Manufacturing
import OperationsSpecialistProTemplate from "./Manufacturing/OperationsSpecialistProTemplate";
//import IndustrialMechanicExpertTemplate from "./Manufacturing/IndustrialMechanicExpertTemplate";
import IndustrialTechnicianModernTemplate from "./Manufacturing/IndustrialTechnicianModernTemplate";
import QualityControlEngineerEliteTemplate from "./Manufacturing/QualityControlEngineerEliteTemplate";
import SafetyComplianceLeadTemplate from "./Manufacturing/SafetyComplianceLeadTemplate";

// // Customer Service
import CustomerSuccessLeadTemplate from "./Customer/CustomerSuccessLeadTemplate";
import SupportSpecialistModernTemplate from "./Customer/SupportSpecialistModernTemplate";
import ClientRelationsExpertTemplate from "./Customer/ClientRelationsExpertTemplate";
import RetailManagerEliteTemplate from "./Customer/RetailManagerEliteTemplate";
import CallCenterLeadProTemplate from "./Customer/CallCenterLeadProTemplate";

// Legal
import ComplianceOfficerModernTemplate from "./Legal/ComplianceOfficerModernTemplate";
import ContractNegotiatorProTemplate from "./Legal/ContractNegotiatorProTemplate";
import CorporateCounselEliteTemplate from "./Legal/CorporateCounselEliteTemplate";
import ParalegalSpecialistTemplate from "./Legal/ParalegalSpecialistTemplate";
import TrialAttorneyProTemplate from "./Legal/TrialAttorneyProTemplate";

// Hospitality and Tourism
import ExecutiveChefEliteTemplate from "./Hospitality/ExecutiveChefEliteTemplate";
import HotelManagerProTemplate from "./Hospitality/HotelManagerProTemplate";
import TravelConsultantExpertTemplate from "./Hospitality/TravelConsultantExpertTemplate";

// Logistics and Supply Chain
import LogisticsManagerModernTemplate from "./Logistics/LogisticsManagerModernTemplate";
import SupplyChainDirectorEliteTemplate from "./Logistics/SupplyChainDirectorEliteTemplate";
import WarehouseOperationsProTemplate from "./Logistics/WarehouseOperationsProTemplate";

// Science and Research
import BiotechAnalystProTemplate from "./Science/BiotechAnalystProTemplate";
import LabManagerModernTemplate from "./Science/LabManagerModernTemplate";
import ResearchScientistExpertTemplate from "./Science/ResearchScientistExpertTemplate";

// Science and Research
import NonprofitManagerProTemplate from "./PublicSector/NonprofitManagerProTemplate";
import PolicyAnalystModernTemplate from "./PublicSector/PolicyAnalystModernTemplate";
import PublicSectorDirectorEliteTemplate from "./PublicSector/PublicSectorDirectorEliteTemplate";

// Academic
import AcademicDirectorExpertTemplate from "./Academic/AcademicDirectorExpertTemplate";
import GraduateFellowEliteTemplate from "./Academic/GraduateFellowEliteTemplate";
import PhDCandidateModernTemplate from "./Academic/PhDCandidateModernTemplate";
import ResearchProfessorProTemplate from "./Academic/ResearchProfessorProTemplate";
import SeniorResearcherPortfolioTemplate from "./Academic/SeniorResearcherPortfolioTemplate";

// ==========================================
// 3. SPECIFIC TEMPLATE MAP (Mapped to Exact MongoDB IDs)
// ==========================================
export const SPECIFIC_TEMPLATE_MAP = {
  // --- Administrative & Support ---
  "699495f29845ed80af9ba167": ExecutiveAssistantEliteTemplate,       
  "699495f39845ed80af9ba169": OperationsCoordinatorProTemplate,        
  "699495f39845ed80af9ba16a": AdminSpecialistModernTemplate,               
  "699495f29845ed80af9ba168": OfficeManagerProTemplate,                
  "699495f39845ed80af9ba16b": ProjectSupportExpertTemplate,                

  // --- Technology / IT ---
  "699495f39845ed80af9ba16d": CloudArchitectEliteTemplate, 
  "699495f39845ed80af9ba16e": DataScientistModernTemplate, 
  "699495f39845ed80af9ba16f": CybersecurityAnalystProTemplate, 
  "699495f39845ed80af9ba170": ITManagerPortfolioTemplate, 
  "699495f39845ed80af9ba16c": FullStackDevProTemplate, 

  // --- Healthcare ---
  "699495f49845ed80af9ba171": NursePractitionerEliteTemplate, 
  "699495f49845ed80af9ba172": MedicalDirectorProTemplate, 
  "699495f49845ed80af9ba173": ClinicalPharmacistModernTemplate, 
  "699495f49845ed80af9ba174": PhysicalTherapistProTemplate, 
  "699495f49845ed80af9ba175": HealthcareAdminLeadTemplate, 

  // --- Education ---
  "699495f49845ed80af9ba176": SeniorEducatorEliteTemplate, 
  "699495f49845ed80af9ba177": AcademicDirectorProTemplate, 
  "699495f49845ed80af9ba178": SpecialEdExpertProTemplate, 
  "699495f49845ed80af9ba179": UniversityProfessorPortfolioTemplate, 
  "699495f59845ed80af9ba17a": CurriculumDesignerProTemplate,

  // --- Sales & Marketing ---
  "699495f59845ed80af9ba17b": MarketingDirectorEliteTemplate, 
  "699495f59845ed80af9ba17c": SalesExecutiveProTemplate, 
  "699495f59845ed80af9ba17d": BrandStrategyModernTemplate, 
  "699495f59845ed80af9ba17e": DigitalGrowthProTemplate, 
  "699495f59845ed80af9ba17f": AccountManagerPortfolioTemplate,

  // --- Engineering ---
  "699495f69845ed80af9ba180": StructuralEngineerEliteTemplate, 
  "699495f69845ed80af9ba181": MechanicalDesignProTemplate, 
  "699495f69845ed80af9ba182": ElectricalSystemsProTemplate, 
  "699495f69845ed80af9ba183": ProjectEngineerModernTemplate, 
  "699495f69845ed80af9ba184": ReliabilityEngineerProTemplate,

  // --- Creative & Design ---
  "699495f69845ed80af9ba185": CreativeDirectorEliteTemplate, 
  "699495f69845ed80af9ba186": ArtDirectorProTemplate, 
  "699495f69845ed80af9ba187": UxUiDesignerModernTemplate, 
  "699495f69845ed80af9ba188": ContentStrategyProTemplate, 
  "699495f69845ed80af9ba189": MultimediaDesignerPortfolioTemplate,

  // --- Finance & Accounting ---
  "699495f79845ed80af9ba18a": InvestmentBankerProTemplate, 
  "699495f79845ed80af9ba18b": CaEliteTemplate, 
  "699495f79845ed80af9ba18c": AuditorProTemplate, 
  "699495f79845ed80af9ba18d": TaxConsultantPortfolioTemplate, 
  "699495f79845ed80af9ba18e": FinancialAnalystModernTemplate,

  // --- Manufacturing (Mapped to Base) ---
  "699495f89845ed80af9ba18f": OperationsSpecialistProTemplate,
  "699495f89845ed80af9ba190": QualityControlEngineerEliteTemplate,
  "699495f89845ed80af9ba191": IndustrialTechnicianModernTemplate,
  //"699495f89845ed80af9ba192": IndustrialMechanicExpertTemplate,
  "699495f89845ed80af9ba193": SafetyComplianceLeadTemplate,

  // --- Customer Service (Mapped to Base) ---
  "699495f99845ed80af9ba194": CallCenterLeadProTemplate,
  "699495f99845ed80af9ba195": RetailManagerEliteTemplate,
  "699495f99845ed80af9ba196": ClientRelationsExpertTemplate,
  "699495f99845ed80af9ba197": SupportSpecialistModernTemplate,
  "699495f99845ed80af9ba198": CustomerSuccessLeadTemplate,

  // --- Legal (Mapped to Base) ---
  "699495f99845ed80af9ba199": CorporateCounselEliteTemplate,
  "699495f99845ed80af9ba19a": TrialAttorneyProTemplate,
  "699495f99845ed80af9ba19b": ComplianceOfficerModernTemplate,
  "699495f99845ed80af9ba19c": ParalegalSpecialistTemplate,
  "699495f99845ed80af9ba19d": ContractNegotiatorProTemplate,

  // --- Hospitality (Mapped to Base) ---
  "699495fa9845ed80af9ba19e": ExecutiveChefEliteTemplate,
  "699495fa9845ed80af9ba19f": HotelManagerProTemplate,
  "699495fa9845ed80af9ba1a0": TravelConsultantExpertTemplate,

  // --- Logistics (Mapped to Base) ---
  "699495fa9845ed80af9ba1a1": SupplyChainDirectorEliteTemplate,
  "699495fa9845ed80af9ba1a2": WarehouseOperationsProTemplate,
  "699495fa9845ed80af9ba1a3": LogisticsManagerModernTemplate,

  // --- Science (Mapped to Base) ---
  "699495fa9845ed80af9ba1a8": ResearchScientistExpertTemplate,
  "699495fa9845ed80af9ba1a9": BiotechAnalystProTemplate,
  "699495fa9845ed80af9ba1ab": LabManagerModernTemplate,

  // --- Public Sector (Mapped to Base) ---
  "699495fa9845ed80af9ba1ac": PublicSectorDirectorEliteTemplate,
  "699495fa9845ed80af9ba1ad": NonprofitManagerProTemplate,
  "699495fa9845ed80af9ba1ae": PolicyAnalystModernTemplate,

  // --- Academic (Mapped to Base) ---
  "699496019845ed80af9ba1e0": GraduateFellowEliteTemplate,
  "699496019845ed80af9ba1e1": ResearchProfessorProTemplate,
  "699496019845ed80af9ba1e2": PhDCandidateModernTemplate,
  "699496019845ed80af9ba1e3": AcademicDirectorExpertTemplate,
  "699496019845ed80af9ba1e4": SeniorResearcherPortfolioTemplate,
};

// ==========================================
// 4. CATEGORY MAP (Fallback using Category IDs)
// ==========================================
export const CATEGORY_TEMPLATE_MAP = {
  "698c7751e01cdb7558f68c3a": AdminSupportTemplate, 
  "698c7751e01cdb7558f68c3d": TechTemplate,
  "698c7751e01cdb7558f68c40": HealthcareTemplate,
  "698c7751e01cdb7558f68c43": EducationTemplate,
  "698c7751e01cdb7558f68c46": SalesTemplate,
  "698c7751e01cdb7558f68c49": EngineeringTemplate,
  "698c7751e01cdb7558f68c4c": CreativeTemplate,
  "698c7751e01cdb7558f68c4f": FinanceTemplate,
  "698c7751e01cdb7558f68c52": ManufacturingTemplate,
  "698c7751e01cdb7558f68c55": CustomerServiceTemplate,
  "698c7751e01cdb7558f68c58": LegalTemplate,
  "698c7751e01cdb7558f68c5b": HospitalityTemplate,
  "698c7751e01cdb7558f68c5e": LogisticsTemplate,
  "698c7751e01cdb7558f68c61": ScienceTemplate,
  "698c7751e01cdb7558f68c64": PublicSectorTemplate,
  "698c7751e01cdb7558f68c67": AcademicTemplate,
};