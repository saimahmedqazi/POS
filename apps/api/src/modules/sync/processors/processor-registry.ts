import { Injectable } from '@nestjs/common';

import { SaleCreatedProcessor } from './sale-created.processor';

@Injectable()
export class ProcessorRegistry {
  constructor(
    private saleCreatedProcessor: SaleCreatedProcessor,
  ) {}

  getProcessor(
    eventType: string,
  ) {
    const processors: Record<
      string,
      any
    > = {
      SALE_CREATED:
        this.saleCreatedProcessor,
    };

    return processors[eventType];
  }
}