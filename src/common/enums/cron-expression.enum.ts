export enum CustomCronExpression {
  EVERY_DAY_AT_9AM_12PM_15PM_18PM = '0 9,13,14,18 * * *',
  MONDAY_TO_FRIDAY_EVERY_2_HOURS_FROM_8AM_TO_20PM = '0 8-20/2 * * 1-5',
  EVERY_MONDAY_TO_FRIDAY_AT_9AM_18PM = '0 9,18 * * 1-5',
  MONDAY_TO_FRIDAY_EVERY_1_HOUR_FROM_9AM_TO_18PM = '0 9-18/1 * * 1-5',
}
