export const FREIGHT_COMPANIES_QUERY = /* sql */ `
SELECT DISTINCT 
    scpf.freight_company_code as sensattaCode, 
    scpf.freight_company_name as sensattaName
FROM "dev".sensatta_cattle_purchase_freights scpf  
ORDER BY scpf.freight_company_name ASC
`;
