export interface GetFreightCompanyRawItem {
  sensatta_code: string;
  name: string;
  cnpj: string;
  state_subscription: string;
  city: string;
  uf: string;
  rnrtc_code: string;
  result_status: string;
  verified_at: Date;
}
/***
 * data:{
 *    sensatta_code,
 *    name,
 *    cnpj,
 *    rnrtc_code,
 *    rnrtc_status,
 *    registered_at,
 *    location,
 *    result_status,
 *    result_description,
 *    result_observation
 * }
 * kpis:{
 * quantity_status_ok
 * quantity_status_error
 * status_by_day
 * }
 *
 */
