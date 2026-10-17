import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { DataSource } from 'typeorm';
import { OrdersService } from './orders.service.js';
import { Order } from './entities/order.entity.js';
import { Offer } from '../offers/entities/offer.entity.js';
import { ProduceListing } from '../produce/entities/produce-listing.entity.js';

describe('OrdersService', () => {
  let service: OrdersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        {
          provide: getRepositoryToken(Order),
          useValue: { findOne: vi.fn(), save: vi.fn(), create: vi.fn() },
        },
        {
          provide: getRepositoryToken(Offer),
          useValue: { findOne: vi.fn(), save: vi.fn() },
        },
        {
          provide: getRepositoryToken(ProduceListing),
          useValue: { findOne: vi.fn(), save: vi.fn() },
        },
        {
          provide: DataSource,
          useValue: {
            createQueryRunner: () => ({
              connect: vi.fn(),
              startTransaction: vi.fn(),
              commitTransaction: vi.fn(),
              rollbackTransaction: vi.fn(),
              release: vi.fn(),
              manager: { save: vi.fn() },
            }),
          },
        },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
