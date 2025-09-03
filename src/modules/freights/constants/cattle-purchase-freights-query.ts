import { CattlePurchaseFreightsStatusEnum } from '../enums/cattle-purchase-freights-status.enum';

export const CATTLE_PURCHASE_FREIGHTS_QUERY = /* sql */ `
select 
  scpf.slaughter_date,
  scpf.receipt_date,
  scpf.company_code,
  sc."name" as company_name,
  scpf.purchase_cattle_order_id,
  case 
    when scpf.freight_transport_type ilike '%SEM FRETE%' then '${CattlePurchaseFreightsStatusEnum.NO_FREIGHT}'
    when scpf.freight_closing_date is not null then '${CattlePurchaseFreightsStatusEnum.CLOSED}'
    else '${CattlePurchaseFreightsStatusEnum.OPEN}'
  end as status,
  scpf.freight_company_name,
  scpf.supplier_name,
  scpf.cattle_advisor_name,
  scpf.freight_transport_plate,
  scpf.freight_transport_capacity,
  scpf.freight_transport_type, 
  scpf.feedlot_name,
  scpf.feedlot_km_distance,
  scpf.negotiated_km_distance,
  scpf.cattle_quantity,
  scpf.reference_freight_table_price,
  scpf.road_price,
  scpf.earth_price,
  scpf.toll_price,
  scpf.additional_price,
  scpf.discount_price,
  scpf.negotiated_freight_price,
  case
  	when scpf.negotiated_km_distance = 0 then 0
  	else scpf.negotiated_freight_price / scpf.negotiated_km_distance
  end as price_km,
  case 
    when scpf.negotiated_km_distance = 0 or scpf.cattle_quantity = 0 then 0
    else scpf.negotiated_freight_price / scpf.negotiated_km_distance / scpf.cattle_quantity 
  end as price_km_cattle_quantity,
  scpf.entry_nf,
  scpf.complement_nf
from dev.sensatta_cattle_purchase_freights scpf 
left join dev.sensatta_companies sc on sc.sensatta_code = scpf.company_code
where 1=1 
  and scpf.slaughter_date between cast($1 as date) and cast($2 as date)
  and sc.sensatta_code = $3
  -- status
  and (
    cast($4 as text) is null or cast($4 as text) = '' or
    (cast($4 as text) = '${CattlePurchaseFreightsStatusEnum.NO_FREIGHT}' and scpf.freight_transport_type ilike '%SEM FRETE%') or
    (cast($4 as text) = '${CattlePurchaseFreightsStatusEnum.OPEN}' and scpf.freight_closing_date is null and scpf.freight_transport_type not ilike '%SEM FRETE%') or
    (cast($4 as text) = '${CattlePurchaseFreightsStatusEnum.CLOSED}' and scpf.freight_closing_date is not null and scpf.freight_transport_type not ilike '%SEM FRETE%')
  )

  -- freight company
  and (
  cast($5 as text) is null 
  or cast($5 as text) = '' 
  or scpf.freight_company_code ilike cast($5 as text)
)

-- cattle advisor
  and (
  cast($6 as text) is null 
  or cast($6 as text) = '' 
  or scpf.cattle_advisor_code ilike cast($6 as text)
)
order by scpf.slaughter_date asc,scpf.freight_transport_plate asc;
`;
