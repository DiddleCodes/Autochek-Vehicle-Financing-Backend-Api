
import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { Vehicle } from '../database/entities/vehicle.entity';
import { VehiclesService } from './vehicle.service';

describe('VehiclesService', () => {
  let service: VehiclesService;
  let repository: Repository<Vehicle>;

  const mockVehicle: Partial<Vehicle> = {
    id: "22191e4d-2131-4857-aeb6-71e72c984991",
    vin: '1HGBH41JXMN109186',
    make: 'Toyota',
    model: 'Camry',
    year: 2020,
    mileage: 35000,
    isAvailable: true,
  };

  const mockRepository = {
    create: jest.fn(),
    save: jest.fn(),
    find: jest.fn(),
    findOne: jest.fn(),
    findAndCount: jest.fn(),
    remove: jest.fn(),
    count: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        VehiclesService,
        {
          provide: getRepositoryToken(Vehicle),
          useValue: mockRepository,
        },
      ],
    }).compile();

    service = module.get<VehiclesService>(VehiclesService);
    repository = module.get<Repository<Vehicle>>(getRepositoryToken(Vehicle));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a vehicle successfully', async () => {
      const createDto: any = {
        vin: '1HGBH41JXMN109186',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        mileage: 35000,
      };

      mockRepository.findOne.mockResolvedValue(null);
      mockRepository.create.mockReturnValue(mockVehicle);
      mockRepository.save.mockResolvedValue(mockVehicle);

      const result = await service.create(createDto);

      expect(result).toEqual(mockVehicle);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { vin: createDto.vin },
      });
      expect(mockRepository.save).toHaveBeenCalled();
    });

    it('should throw ConflictException if VIN already exists', async () => {
      const createDto: any = {
        vin: '1HGBH41JXMN109186',
        make: 'Toyota',
        model: 'Camry',
        year: 2020,
        mileage: 35000,
      };

      mockRepository.findOne.mockResolvedValue(mockVehicle);

      await expect(service.create(createDto)).rejects.toThrow(
        ConflictException,
      );
    });
  });

  describe('findAll', () => {
    it('should return paginated vehicles', async () => {
      const mockVehicles = [mockVehicle];
      mockRepository.findAndCount.mockResolvedValue([mockVehicles, 1]);

      const result = await service.findAll(1, 10, {} as any);

      expect(result).toEqual({
        data: mockVehicles,
        total: 1,
        page: 1,
        totalPages: 1,
      });
      expect(mockRepository.findAndCount).toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('should return a vehicle by ID', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);

      const result = await service.findOne("22191e4d-2131-4857-aeb6-71e72c984991");

      expect(result).toEqual(mockVehicle);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: 1 },
        relations: ['valuations', 'loans'],
      });
    });

    it('should throw NotFoundException if vehicle not found', async () => {
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.findOne("22191e4d-2131-4857-aeb6-71e72c984991")).rejects.toThrow(NotFoundException);
    });
  });

  describe('update', () => {
    it('should update a vehicle successfully', async () => {
      const updateDto = { mileage: 40000 };
      const updatedVehicle = { ...mockVehicle, ...updateDto };

      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockRepository.save.mockResolvedValue(updatedVehicle);

      const result = await service.update("22191e4d-2131-4857-aeb6-71e72c984991", updateDto);

      expect(result.mileage).toBe(40000);
      expect(mockRepository.save).toHaveBeenCalled();
    });
  });

  describe('remove', () => {
    it('should remove a vehicle successfully', async () => {
      mockRepository.findOne.mockResolvedValue(mockVehicle);
      mockRepository.remove.mockResolvedValue(mockVehicle);

      await service.remove("22191e4d-2131-4857-aeb6-71e72c984991", {} as any);

      expect(mockRepository.remove).toHaveBeenCalledWith(mockVehicle);
    });
  });

  describe('exists', () => {
    it('should return true if vehicle exists', async () => {
      mockRepository.count.mockResolvedValue(1);

      const result = await service.exists("22191e4d-2131-4857-aeb6-71e72c984991");

      expect(result).toBe(true);
    });

    it('should return false if vehicle does not exist', async () => {
      mockRepository.count.mockResolvedValue(0);

      const result = await service.exists("22191e4d-2131-4857-aeb6-71e72c984991");

      expect(result).toBe(false);
    });
  });
});
