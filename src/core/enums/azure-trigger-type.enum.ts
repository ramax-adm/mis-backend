export enum AzureFunctionTriggerTypeEnum {
  HTTP = 'httpTrigger',
  TIMER = 'timerTrigger',
  BLOB = 'blobTrigger',
  QUEUE = 'queueTrigger',
  SERVICE_BUS = 'serviceBusTrigger',
  EVENT_HUB = 'eventHubTrigger',
  EVENT_GRID = 'eventGridTrigger',
  COSMOS_DB = 'cosmosDBTrigger',
  SIGNALR = 'signalRTrigger',
  IOT_HUB = 'iothubTrigger',
  RABBIT_MQ = 'rabbitMQTrigger',
  KAFKA = 'kafkaTrigger',
  DURABLE_ACTIVITY = 'activityTrigger',
  DURABLE_ORCHESTRATION = 'orchestrationTrigger',
  DURABLE_ENTITY = 'entityTrigger',
  // fallback for non-standard or future/third-party triggers
  CUSTOM = 'customTrigger',
}
