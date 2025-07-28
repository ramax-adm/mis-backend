export const INCOMING_BATCHES_PRODUCT_LINES_QUERY = /* sql */ `
SELECT DISTINCT 
    spl.sensatta_id, 
    sib.product_line_code as sensatta_code,
    spl."name",
    spl.acronym,
    spl.is_considered_on_stock,
    spl.created_at
FROM "dev".sensatta_incoming_batches sib 
LEFT JOIN "dev".sensatta_product_lines spl on spl.sensatta_code = sib.product_line_code
WHERE 1=1
  AND spl.market = $1
  AND spl.is_considered_on_stock = $2

UNION

SELECT DISTINCT 
    spl.sensatta_id, 
    spl.sensatta_code,
    spl."name",
    spl.acronym,
    spl.is_considered_on_stock,
    spl.created_at
FROM "dev".sensatta_product_lines spl 
WHERE spl.sensatta_code = 'N/D'

ORDER BY "name" ASC;

`;
