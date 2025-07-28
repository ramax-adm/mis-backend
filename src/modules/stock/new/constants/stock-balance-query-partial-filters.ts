export const STOCK_BALANCE_QUERY_PARTIAL_FILTERS = /* sql */ `
SELECT 
  sc.sensatta_code company_code,
  sc.name company_name,
  sb.product_line_code,
  sb.product_line_name,
  spl.market,
  sb.product_code,
  sb.product_name,
  sb.weight_in_kg,
  sb.quantity,
  sb.reserved_weight_in_kg,
  sb.reserved_quantity,
  sb.available_weight_in_kg,
  sb.available_quantity,
  sb.created_at
FROM dev.sensatta_stock_balance sb
LEFT JOIN dev.sensatta_product_lines spl 
  ON sb.product_line_code = spl.sensatta_code
LEFT JOIN dev.sensatta_companies sc 
  ON sc.sensatta_code = sb.company_code
WHERE 1=1
--AND sb.quantity <> 0
--AND sb.reserved_quantity <> 0
--AND sb.available_quantity <> 0
  AND spl.is_considered_on_stock = true
  AND ($1::TEXT IS NULL OR sb.company_code = $1)              -- filtro empresa
  --AND spl.market::TEXT LIKE '%' || $2 || '%'                  -- filtro mercado
  AND ($2::TEXT IS NULL OR sb.product_line_code = $2)
ORDER BY sb.product_line_code ASC
`;
