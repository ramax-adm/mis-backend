export const GET_HUMAN_RESOURCES_HOURS_DATES_QUERY = /* sql */ `
SELECT DISTINCT 
    hrh.date
FROM dev.external_human_resources_hours hrh
WHERE hrh."companyCode" = $1;
`;

export const GET_HUMAN_RESOURCES_DEPARTMENTS_QUERY = /* sql */ `
SELECT DISTINCT 
    hrh.department
FROM dev.external_human_resources_hours hrh
WHERE hrh."companyCode" = $1
ORDER BY 1 ASC
`;
export const GET_HUMAN_RESOURCES_EMPLOYEES_QUERY = /* sql */ `
SELECT DISTINCT 
    hrh.employee_name
FROM dev.external_human_resources_hours hrh
WHERE hrh."companyCode" = $1
AND hrh.department ILIKE '%' || $2 || '%'
ORDER BY 1 ASC;
`;
