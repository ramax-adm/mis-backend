export const CATTLE_PURCHASE_CATTLE_OWNERS = /* sql */ `
SELECT DISTINCT 
    scp.cattle_owner_name
FROM dev.sensatta_cattle_purchases scp
WHERE 1=1 
--AND scp."company_code" = $1
AND (
    $1::date IS NULL OR scp.slaughter_date >= $1::date
  )
  AND (
    $2::date IS NULL OR scp.slaughter_date <= $2::date
  )
ORDER BY 1 ASC
`;

export const CATTLE_PURCHASE_CATTLE_CLASSIFICATION = /* sql */ `
SELECT DISTINCT 
    scp.cattle_classification
FROM dev.sensatta_cattle_purchases scp
WHERE 1=1 
--AND scp."company_code" = $1
AND (
    $1::date IS NULL OR scp.slaughter_date >= $1::date
  )
  AND (
    $2::date IS NULL OR scp.slaughter_date <= $2::date
  )
ORDER BY 1 ASC
`;

export const CATTLE_PURCHASE_CATTLE_ADVISOR = /* sql */ `
SELECT DISTINCT 
    scp.cattle_advisor_name
FROM dev.sensatta_cattle_purchases scp
WHERE 1=1 
--AND scp."company_code" = $1
AND (
    $1::date IS NULL OR scp.slaughter_date >= $1::date
  )
  AND (
    $2::date IS NULL OR scp.slaughter_date <= $2::date
  )
ORDER BY 1 ASC
`;
