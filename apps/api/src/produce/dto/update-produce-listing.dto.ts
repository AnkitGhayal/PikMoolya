import { PartialType } from '@nestjs/mapped-types';

import { CreateProduceListingDto } from './create-produce-listing.dto.js';

export class UpdateProduceListingDto extends PartialType(
  CreateProduceListingDto,
) {}
