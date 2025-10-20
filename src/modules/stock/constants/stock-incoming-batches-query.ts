export const INCOMING_BATCHES_QUERY = /* sql */ `
SELECT 
    sc.sensatta_code AS "companyCode",
    sc."name" AS "companyName",
    spl.acronym AS "productLineAcronym",
    spl.sensatta_code AS "productLineCode",
    spl."name" AS "productLineName",
    sp.sensatta_id AS "productId",
    sp.sensatta_code AS "productCode",
    sp."name" AS "productName",
    sp.classification_type AS "productClassification",
    sib.production_date AS "productionDate",
    sib.due_date AS "dueDate",
    sib.box_amount AS "boxAmount",
    sib.quantity,
    sib.weight_in_kg AS "weightInKg"
FROM "dev".sensatta_warehouses sw
LEFT JOIN "dev".sensatta_companies sc ON sc.sensatta_code = sw.company_code 
LEFT JOIN "dev".sensatta_incoming_batches sib ON sib.warehouse_code = sw.sensatta_code
LEFT JOIN "dev".sensatta_products sp ON sp.sensatta_code = sib.product_code
LEFT JOIN "dev".sensatta_product_lines spl ON spl.sensatta_code = sib.product_line_code
WHERE 1=1
    AND sw.company_code = $1
    AND sw.is_active = $2`;
