export const STOCK_BALANCE_QUERY = /* sql */ `
SELECT 
  sb.product_line_code,
  sb.product_line_name,
  sb.product_code,
  sb.product_name,
  sb.weight_in_kg,
  sb.quantity,
  sb.reserved_weight_in_kg,
  sb.reserved_quantity,
  sb.available_weight_in_kg,
  sb.available_quantity
FROM dev.sensatta_stock_balance sb
LEFT JOIN dev.sensatta_product_lines spl 
  ON sb.product_line_code = spl.sensatta_code
WHERE 1=1
  AND sb.company_code = $1                               -- filtro empresa
  AND spl.market::TEXT LIKE '%' || $2 || '%'             -- filtro mercado
  AND spl.is_active = true
  AND sb.quantity <> 0
  AND ($3::TEXT IS NULL OR sb.product_line_code = $3)
ORDER BY sb.product_line_code ASC
`;
