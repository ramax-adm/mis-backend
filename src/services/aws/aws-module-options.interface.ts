import {
  InjectionToken,
  ModuleMetadata,
  OptionalFactoryDependency,
} from '@nestjs/common/interfaces';

import { AwsAccessOptions } from './aws-access-options.interface';

/**
 * @export
 * @interface IAWSModuleAsyncOptions
 * @extends {Pick<ModuleMetadata, 'imports'>}
 */
export interface IAWSModuleAsyncOptions
  extends Pick<ModuleMetadata, 'imports'> {
  useFactory: (env: any) => Promise<AwsAccessOptions> | AwsAccessOptions;
  inject?: Array<InjectionToken | OptionalFactoryDependency>;
}
