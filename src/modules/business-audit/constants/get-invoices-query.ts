const GET_MANUALLY_ENTERED_INVOICES_QUERY = /* sql */ `
select 
si."date" ,
si.nf_type,
si.company_code ,
sc."name" company_name,
si.cfop_code ,
si.cfop_description,
si.nf_number,
si.request_id ,
si.client_code ,
si.client_name,
si.product_code,
si.product_name,
si.box_amount,
si.weight_in_kg ,
si.unit_price,
si.total_price 
from dev.sensatta_invoices si
left join dev.sensatta_companies sc on sc.sensatta_code = si.company_code
where 1=1
and si.nf_type = 'AVULSA'
`;
