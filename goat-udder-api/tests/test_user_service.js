const UserService = require('../src/services/user_service');
const UserRepository = require('../src/data/repositories/user_repository');

// Mock repository
const mockUserRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findByUsername: jest.fn(),
  findByEmail: jest.fn(),
  create: jest.fn(),
  verifyPassword: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock('../src/data/repositories/user_repository');
UserRepository.mockImplementation(() => mockUserRepository);

describe('UserService', () => {
  let service;

  beforeEach(() => {
    service = new UserService();
    jest.clearAllMocks();
  });

  describe('getAllUsers', () => {
    it('should return all users formatted', async () => {
      const mockUsers = [
        { id: 1, username: 'goatlover', email: 'goat@example.com', role: 'customer', password_hash: 'hashed', created_at: new Date() },
      ];
      mockUserRepository.findAll.mockResolvedValue(mockUsers);

      const result = await service.getAllUsers();

      expect(mockUserRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(1);
      expect(result[0]).not.toHaveProperty('password_hash');
    });
  });

  describe('getUserById', () => {
    it('should return user by ID', async () => {
      const mockUser = { id: 1, username: 'goatlover', email: 'goat@example.com', role: 'customer', password_hash: 'hashed', created_at: new Date() };
      mockUserRepository.findById.mockResolvedValue(mockUser);

      const result = await service.getUserById(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.getUserById(99)).rejects.toThrow('User with ID 99 not found');
    });

    it('should throw error for invalid ID', async () => {
      await expect(service.getUserById(null)).rejects.toThrow('Invalid user ID');
    });
  });

  describe('register', () => {
    it('should register a new user', async () => {
      const userData = { username: 'newgoat', email: 'new@example.com', password: 'password123' };
      const createdUser = { id: 2, username: 'newgoat', email: 'new@example.com', role: 'customer', password_hash: 'hashed', created_at: new Date() };
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue(null);
      mockUserRepository.create.mockResolvedValue(createdUser);

      const result = await service.register(userData);

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('newgoat');
      expect(mockUserRepository.findByEmail).toHaveBeenCalledWith('new@example.com');
      expect(mockUserRepository.create).toHaveBeenCalled();
      expect(result.username).toBe('newgoat');
    });

    it('should throw error when username exists', async () => {
      mockUserRepository.findByUsername.mockResolvedValue({ id: 1, username: 'goatlover' });

      await expect(service.register({ username: 'goatlover', email: 'new@example.com', password: 'password123' })).rejects.toThrow('Username already exists');
    });

    it('should throw error when email exists', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);
      mockUserRepository.findByEmail.mockResolvedValue({ id: 1, email: 'existing@example.com' });

      await expect(service.register({ username: 'newgoat', email: 'existing@example.com', password: 'password123' })).rejects.toThrow('Email already exists');
    });

    it('should throw error for missing username', async () => {
      await expect(service.register({ email: 'test@example.com', password: 'password123' })).rejects.toThrow('Username is required');
    });

    it('should throw error for missing email', async () => {
      await expect(service.register({ username: 'test', password: 'password123' })).rejects.toThrow('Email is required');
    });

    it('should throw error for short password', async () => {
      await expect(service.register({ username: 'test', email: 'test@example.com', password: 'short' })).rejects.toThrow('Password must be at least 8 characters');
    });
  });

  describe('login', () => {
    it('should login successfully', async () => {
      const mockUser = { id: 1, username: 'goatlover', email: 'goat@example.com', role: 'customer', password_hash: 'hashed', created_at: new Date() };
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);
      mockUserRepository.verifyPassword.mockResolvedValue(true);

      const result = await service.login('goatlover', 'password123');

      expect(mockUserRepository.findByUsername).toHaveBeenCalledWith('goatlover');
      expect(mockUserRepository.verifyPassword).toHaveBeenCalledWith(mockUser, 'password123');
      expect(result).toHaveProperty('token');
      expect(result.user).not.toHaveProperty('password_hash');
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findByUsername.mockResolvedValue(null);

      await expect(service.login('unknown', 'password')).rejects.toThrow('Invalid username or password');
    });

    it('should throw error for wrong password', async () => {
      const mockUser = { id: 1, username: 'goatlover', email: 'goat@example.com', role: 'customer', password_hash: 'hashed', created_at: new Date() };
      mockUserRepository.findByUsername.mockResolvedValue(mockUser);
      mockUserRepository.verifyPassword.mockResolvedValue(false);

      await expect(service.login('goatlover', 'wrongpassword')).rejects.toThrow('Invalid username or password');
    });

    it('should throw error for missing credentials', async () => {
      await expect(service.login('', 'password')).rejects.toThrow('Username and password are required');
      await expect(service.login('user', '')).rejects.toThrow('Username and password are required');
    });
  });

  describe('verifyToken', () => {
    it('should verify valid token', () => {
      const token = service.generateToken({ id: 1, username: 'goatlover', role: 'customer' });
      const result = service.verifyToken(token);
      expect(result).toHaveProperty('id');
      expect(result).toHaveProperty('username');
    });

    it('should throw error for invalid token', async () => {
      await expect(service.verifyToken('invalid-token')).rejects.toThrow('Invalid token');
    });
  });

  describe('updateUser', () => {
    it('should update a user', async () => {
      const existingUser = { id: 1, username: 'goatlover', email: 'goat@example.com', role: 'customer', password_hash: 'hashed', created_at: new Date() };
      const updatedUser = { id: 1, username: 'updated', email: 'goat@example.com', role: 'admin', password_hash: 'hashed', created_at: existingUser.created_at };
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.update.mockResolvedValue(updatedUser);

      const result = await service.updateUser(1, { username: 'updated', role: 'admin' });

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.update).toHaveBeenCalledWith(1, { username: 'updated', role: 'admin' });
      expect(result.username).toBe('updated');
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.updateUser(99, { username: 'new' })).rejects.toThrow('User with ID 99 not found');
    });
  });

  describe('deleteUser', () => {
    it('should delete a user', async () => {
      const existingUser = { id: 1, username: 'goatlover', email: 'goat@example.com', role: 'customer', password_hash: 'hashed', created_at: new Date() };
      mockUserRepository.findById.mockResolvedValue(existingUser);
      mockUserRepository.delete.mockResolvedValue(true);

      const result = await service.deleteUser(1);

      expect(mockUserRepository.findById).toHaveBeenCalledWith(1);
      expect(mockUserRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it('should throw error when user not found', async () => {
      mockUserRepository.findById.mockResolvedValue(null);

      await expect(service.deleteUser(99)).rejects.toThrow('User with ID 99 not found');
    });
  });
});