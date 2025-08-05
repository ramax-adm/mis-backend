import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { User } from '../entities/user.entity';
import { getRepositoryToken } from '@nestjs/typeorm';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CreateUserDto } from '../dtos/create-user.dto';
import { MakeUser } from '../factories/make-user';
import { UserRole } from '@/core/enums/user-role.enum';
import { DateUtils } from '@/utils/date.utils';
import { it, describe, expect, vi } from 'vitest';
describe('UserService', () => {
  let service: UserService;

  const mockRepository = {
    save: vi.fn(),
    find: vi.fn(),
    findOne: vi.fn(),
    findOneBy: vi.fn(),
    merge: vi.fn((entity, dto) => ({ ...entity, ...dto })),
    sendEmails: vi.fn(),
  };
  const emailServiceMock = {
    sendEmail: vi.fn(),
  };

  vi.mock('uuid', () => ({
    v4: vi.fn(() => 'a-fixed-uuid'), // Providing a default implementation
  }));

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        UserService,
        {
          provide: getRepositoryToken(User),
          useValue: mockRepository,
        },
        {
          provide: 'EMAIL_SERVICE',
          useValue: emailServiceMock,
        },
      ],
    }).compile();

    service = module.get<UserService>(UserService);
    mockRepository.findOneBy.mockReset();
    mockRepository.save.mockReset();
    mockRepository.merge.mockReset();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    const createUserDto: CreateUserDto = {
      name: 'John Doe',
      email: 'john@example.com',
      password: 'strongPassword123',
      cpf: '123.456.789-09',
      role: 'user',
    };

    it('should throw a conflict exception if user already exists', async () => {
      mockRepository.findOneBy.mockResolvedValue(createUserDto);
      await expect(service.create(createUserDto)).rejects.toThrow(
        ConflictException,
      );
    });

    it('should successfully create a new user when no existing user is found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      mockRepository.save.mockImplementation((dto) => ({
        id: '1',
        ...dto,
        password: 'hashedPassword',
      }));

      const result = await service.create(createUserDto);

      expect(mockRepository.save).toHaveBeenCalledWith({
        ...createUserDto,
        password: expect.any(String),
      });
      expect(result).toEqual({
        ...createUserDto,
        id: '1',
        password: 'hashedPassword',
      });
    });
  });

  describe('profile', () => {
    const userId = '123-uuid';
    const userProfile = {
      id: userId,
      name: 'John Doe',
      cpf: '123.456.789-09',
      email: 'john@example.com',
      password: 'hashedPassword',
      refreshToken: 'some-refresh-token',
      resetPasswordToken: 'some-reset-token',
      role: 'user',
      createdAt: new Date(),
      updatedAt: new Date(),
      isActive: true,
    };

    it('should retrieve a user by ID if the user exists', async () => {
      mockRepository.findOneBy.mockResolvedValue(userProfile);
      const result = await service.profile(userId);
      expect(result).toEqual(userProfile);
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    });

    it('should return null if no user is found', async () => {
      mockRepository.findOneBy.mockResolvedValue(null);
      const result = await service.profile('non-existing-id');
      expect(result).toBeNull();
      expect(mockRepository.findOneBy).toHaveBeenCalledWith({
        id: 'non-existing-id',
      });
    });
  });

  describe('update', () => {
    it('should successfully update a user', async () => {
      const userId = 'uuid1234';
      const mockUser = {
        id: userId,
        name: 'John Doe',
        cpf: '12345678901',
        email: 'old@example.com',
        password: 'hashedOldPassword',
        refreshToken: null,
        resetPasswordToken: null,
        role: 'User',
        createdAt: new Date(),
        updatedAt: new Date(),
        isActive: true,
      };

      const updateUserDto = {
        name: 'John Doe Updated',
        email: 'old@example.com',
        password: 'newPassword',
        cpf: '12345678901',
        role: 'User',
      };

      mockRepository.findOneBy.mockImplementation(({ id }) =>
        Promise.resolve(id === userId ? mockUser : undefined),
      );
      mockRepository.merge.mockImplementation((entity, dto) => ({
        ...entity,
        ...dto,
      }));
      mockRepository.save.mockImplementation((user) => Promise.resolve(user));
      const updatedUser = await service.update(userId, updateUserDto);
      expect(mockRepository.findOneBy).toHaveBeenNthCalledWith(1, {
        id: userId,
      });
      expect(mockRepository.merge).toHaveBeenCalledWith(
        mockUser,
        updateUserDto,
      );
      expect(mockRepository.save).toHaveBeenCalled();
      expect(updatedUser).toHaveProperty('email', 'old@example.com');
      expect(updatedUser).toHaveProperty('name', 'John Doe Updated');
    });

    it('should throw NotFoundException if the user does not exist', async () => {
      const userId = 'uuid1234';
      const updateUserDto = {
        name: 'Jane Doe',
        email: 'new@example.com',
        password: 'newPassword',
        cpf: '12345678901',
        role: 'Admin',
      };

      mockRepository.findOneBy.mockResolvedValue(undefined);

      await expect(service.update(userId, updateUserDto)).rejects.toThrow(
        NotFoundException,
      );

      expect(mockRepository.findOneBy).toHaveBeenCalledWith({ id: userId });
    });
  });

  describe('forgotPassword', () => {
    it('should generate a token and call sendEmails with the token', async () => {
      const email = 'john@example.com';
      const user = {
        id: '1',
        email: 'john@example.com',
        name: 'John Doe',
        resetPasswordToken: null,
      };
      mockRepository.findOne.mockResolvedValue(user);
      mockRepository.save.mockImplementation((u) =>
        Promise.resolve({ ...u, resetPasswordToken: '123abc' }),
      );

      await service.forgotPassword(email);

      expect(mockRepository.findOne).toHaveBeenCalledWith({ where: { email } });
      expect(user.resetPasswordToken).not.toBeNull();
      expect(mockRepository.save).toHaveBeenCalledWith(user);
      expect(emailServiceMock.sendEmail).toHaveBeenCalled();
    });

    it('should throw a NotFoundException when the user is not found', async () => {
      const email = 'unknown@example.com';
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.forgotPassword(email)).rejects.toThrow(
        new NotFoundException(`User with email "${email}" not found.`),
      );
    });
  });

  describe('checkPasswordToken', () => {
    it('should return true if it is the right token', async () => {
      const passwordTokenDto = {
        email: 'user@example.com',
        token: 'valid-token',
      };
      const user = {
        email: 'user@example.com',
        resetPasswordToken: 'valid-token',
      };

      mockRepository.findOne.mockResolvedValue(user);

      const result = await service.checkPasswordToken(passwordTokenDto);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { email: 'user@example.com', resetPasswordToken: 'valid-token' },
      });
      expect(result).toBe(true);
    });

    it('should return false if token is not found', async () => {
      const passwordTokenDto = {
        email: 'user@example.com',
        token: 'invalid-token',
      };

      mockRepository.findOne.mockResolvedValue(null);

      const result = await service.checkPasswordToken(passwordTokenDto);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: 'user@example.com',
          resetPasswordToken: 'invalid-token',
        },
      });
      expect(result).toBe(false);
    });
  });

  describe('resetPassword', () => {
    it('should update the password if token is correct', async () => {
      const changePasswordDto = {
        email: 'user@example.com',
        token: 'valid-token',
        password: 'newPassword123',
      };
      const user = {
        id: '1',
        email: 'user@example.com',
        resetPasswordToken: 'valid-token',
      };

      mockRepository.findOne.mockResolvedValue(user);
      service.update = vi.fn(); // Mock the update method

      await service.resetPassword(changePasswordDto);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: {
          email: 'user@example.com',
          resetPasswordToken: 'valid-token',
        },
      });
      expect(service.update).toHaveBeenCalledWith(user.id, {
        password: 'newPassword123',
      });
    });
  });

  describe('checkIfUserHasPermissionByRole', () => {
    it('should be able to permit access', async () => {
      // mocking
      const user = MakeUser({ role: UserRole.AdminFinPec });
      vi.spyOn(service, 'profile').mockResolvedValueOnce(user);

      const sut = await service.checkIfUserHasPermissionByRole(user.id, [
        UserRole.AdminFinPec,
      ]);
      expect(sut).toBe(true);
    });
    it('should be able to deny access ', async () => {
      // mocking
      const user = MakeUser({ role: '' });
      vi.spyOn(service, 'profile').mockResolvedValueOnce(user);

      const sut = await service.checkIfUserHasPermissionByRole(user.id, [
        UserRole.AdminFinPec,
      ]);
      expect(sut).toBe(false);
    });
  });
  describe('canUserEditRecord', () => {
    it('should be able to allow access for user to edit his own records', async () => {
      // mocking
      const user = MakeUser({ role: UserRole.Financial });
      vi.spyOn(service, 'profile').mockResolvedValueOnce(user);

      const createdBy = user.id;

      // Mockar a data do sistema para 01/01/2024
      vi.useFakeTimers();
      vi.setSystemTime(DateUtils.toDate('2024-01-01'));

      const sut = await service.canUserEditRecord(
        user.id,
        createdBy,
        DateUtils.toDate('2024-01-01'),
        [UserRole.AdminFinPec],
      );

      // assert
      expect(sut.user).toEqual(user);
      expect(sut.hasPermission).toBe(true);
    });
    it('should be able to allow access for admin user to edit any records', async () => {
      // mocking
      const user = MakeUser({ role: UserRole.AdminFinPec });
      vi.spyOn(service, 'profile').mockResolvedValueOnce(user);

      const createdBy = user.id;

      vi.useFakeTimers();
      vi.setSystemTime(DateUtils.toDate('2024-01-01'));

      const sut = await service.canUserEditRecord(
        user.id,
        createdBy,
        DateUtils.toDate('2024-12-01'),
        [UserRole.AdminFinPec],
      );

      // assert
      expect(sut.user).toEqual(user);
      expect(sut.hasPermission).toBe(true);
    });
    it('should be able to deny access for user to edit records from other users', async () => {
      // mocking
      const user = MakeUser({ role: UserRole.Financial });
      vi.spyOn(service, 'profile').mockResolvedValueOnce(user);

      const createdBy = MakeUser({ role: UserRole.Financial }).id;

      vi.useFakeTimers();
      vi.setSystemTime(DateUtils.toDate('2024-01-01'));

      const sut = await service.canUserEditRecord(
        user.id,
        createdBy,
        DateUtils.toDate('2024-01-01'),
        [UserRole.AdminFinPec],
      );

      // assert
      expect(sut.user).toEqual(user);
      expect(sut.hasPermission).toBe(false);
    });

    it('should be able to deny access for user to edit records on different days', async () => {
      // mocking
      const user = MakeUser({ role: UserRole.Financial });
      vi.spyOn(service, 'profile').mockResolvedValueOnce(user);

      const createdBy = user.id;

      vi.useFakeTimers();
      vi.setSystemTime(DateUtils.toDate('2024-01-01'));

      const sut = await service.canUserEditRecord(
        user.id,
        createdBy,
        DateUtils.toDate('2024-01-02'),
        [UserRole.AdminFinPec],
      );

      // assert
      expect(sut.user).toEqual(user);
      expect(sut.hasPermission).toBe(false);
    });
  });
});
