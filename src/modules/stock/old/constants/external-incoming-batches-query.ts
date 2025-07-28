export const EXTERNAL_INCOMING_BATCHES_QUERY = /* sql */ `
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
    eib.production_date AS "productionDate",
    eib.due_date AS "dueDate",
    SUM(eib.box_amount) AS "boxAmount",
    SUM(eib.quantity) AS "quantity",
    SUM(eib.weight_in_kg) AS "weightInKg"
FROM "dev".external_incoming_batches eib
LEFT JOIN "dev".sensatta_companies sc ON sc.sensatta_code = eib.company_code 
LEFT JOIN "dev".sensatta_products sp ON sp.sensatta_code = eib.product_code
LEFT JOIN "dev".sensatta_product_lines spl ON spl.sensatta_code = eib.product_line_code
WHERE eib.company_code = $1
GROUP BY 
    sc.sensatta_code,
    sc."name",
    spl.acronym,
    spl.sensatta_code,
    spl."name",
    sp.sensatta_id,
    sp.sensatta_code,
    sp."name",
    sp.classification_type,
    eib.production_date,
    eib.due_date;
`;
