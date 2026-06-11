const PadService = require("../src/services/pad_service");
const PadRepository = require("../src/data/repositories/pad_repository");

// Mock repository
const mockPadRepository = {
  findAll: jest.fn(),
  findById: jest.fn(),
  findAvailable: jest.fn(),
  create: jest.fn(),
  update: jest.fn(),
  delete: jest.fn(),
};

jest.mock("../src/data/repositories/pad_repository");
PadRepository.mockImplementation(() => mockPadRepository);

describe("PadService", () => {
  let service;

  beforeEach(() => {
    service = new PadService();
    jest.clearAllMocks();
  });

  describe("getAllPads", () => {
    it("should return all udder formatted", async () => {
      const mockPads = [
        {
          id: 1,
          name: "Pasteur Alpine",
          location: "Pyrénées",
          capacity: 20,
          price_per_day: "25.00",
          amenities: ["grazing_area"],
          status: "available",
          created_at: new Date(),
        },
        {
          id: 2,
          name: "Prairie Normande",
          location: "Normandie",
          capacity: 15,
          price_per_day: "20.00",
          amenities: [],
          status: "available",
          created_at: new Date(),
        },
      ];
      mockPadRepository.findAll.mockResolvedValue(mockPads);

      const result = await service.getAllPads();

      expect(mockPadRepository.findAll).toHaveBeenCalled();
      expect(result).toHaveLength(2);
      expect(result[0]).toEqual({
        id: 1,
        name: "Pasteur Alpine",
        location: "Pyrénées",
        capacity: 20,
        price_per_day: 25.0,
        amenities: ["grazing_area"],
        status: "available",
        created_at: mockPads[0].created_at,
      });
    });

    it("should return empty array when no udder", async () => {
      mockPadRepository.findAll.mockResolvedValue([]);

      const result = await service.getAllPads();

      expect(result).toHaveLength(0);
    });
  });

  describe("getPadById", () => {
    it("should return pad by ID", async () => {
      const mockPad = {
        id: 1,
        name: "Pasteur Alpine",
        location: "Pyrénées",
        capacity: 20,
        price_per_day: "25.00",
        amenities: ["grazing_area"],
        status: "available",
        created_at: new Date(),
      };
      mockPadRepository.findById.mockResolvedValue(mockPad);

      const result = await service.getPadById(1);

      expect(mockPadRepository.findById).toHaveBeenCalledWith(1);
      expect(result.id).toBe(1);
    });

    it("should throw error when pad not found", async () => {
      mockPadRepository.findById.mockResolvedValue(null);

      await expect(service.getPadById(99)).rejects.toThrow(
        "Pad with ID 99 not found",
      );
    });

    it("should throw error for invalid ID", async () => {
      await expect(service.getPadById(null)).rejects.toThrow("Invalid pad ID");
      await expect(service.getPadById("abc")).rejects.toThrow("Invalid pad ID");
    });
  });

  describe("getAvailablePads", () => {
    it("should return available udder", async () => {
      const mockPads = [
        {
          id: 1,
          name: "Pasteur Alpine",
          location: "Pyrénées",
          capacity: 20,
          price_per_day: "25.00",
          amenities: [],
          status: "available",
          created_at: new Date(),
        },
      ];
      mockPadRepository.findAvailable.mockResolvedValue(mockPads);

      const result = await service.getAvailablePads();

      expect(mockPadRepository.findAvailable).toHaveBeenCalled();
      expect(result).toHaveLength(1);
    });
  });

  describe("createPad", () => {
    it("should create a new pad", async () => {
      const padData = {
        name: "New Pad",
        location: "Location",
        capacity: 10,
        price_per_day: 15.0,
        amenities: ["grazing_area"],
      };
      const createdPad = {
        id: 5,
        ...padData,
        status: "available",
        created_at: new Date(),
      };
      mockPadRepository.create.mockResolvedValue(createdPad);

      const result = await service.createPad(padData);

      expect(mockPadRepository.create).toHaveBeenCalledWith(padData);
      expect(result.name).toBe("New Pad");
    });

    it("should throw error for missing name", async () => {
      await expect(
        service.createPad({ location: "L", capacity: 10, price_per_day: 15 }),
      ).rejects.toThrow("Pad name is required");
    });

    it("should throw error for missing location", async () => {
      await expect(
        service.createPad({ name: "N", capacity: 10, price_per_day: 15 }),
      ).rejects.toThrow("Pad location is required");
    });

    it("should throw error for invalid capacity", async () => {
      await expect(
        service.createPad({
          name: "N",
          location: "L",
          capacity: -1,
          price_per_day: 15,
        }),
      ).rejects.toThrow("Pad capacity must be a positive number");
    });

    it("should throw error for invalid price", async () => {
      await expect(
        service.createPad({
          name: "N",
          location: "L",
          capacity: 10,
          price_per_day: 0,
        }),
      ).rejects.toThrow("Pad price_per_day must be a positive number");
    });
  });

  describe("updatePad", () => {
    it("should update a pad", async () => {
      const existingPad = {
        id: 1,
        name: "Old Name",
        location: "Old Location",
        capacity: 10,
        price_per_day: "15.00",
        amenities: [],
        status: "available",
        created_at: new Date(),
      };
      const updatedPad = {
        id: 1,
        name: "New Name",
        location: "Old Location",
        capacity: 10,
        price_per_day: "20.00",
        amenities: [],
        status: "available",
        created_at: existingPad.created_at,
      };
      mockPadRepository.findById.mockResolvedValue(existingPad);
      mockPadRepository.update.mockResolvedValue(updatedPad);

      const result = await service.updatePad(1, {
        name: "New Name",
        price_per_day: 20.0,
      });

      expect(mockPadRepository.findById).toHaveBeenCalledWith(1);
      expect(mockPadRepository.update).toHaveBeenCalledWith(1, {
        name: "New Name",
        price_per_day: 20.0,
      });
      expect(result.name).toBe("New Name");
    });

    it("should throw error when pad not found", async () => {
      mockPadRepository.findById.mockResolvedValue(null);

      await expect(service.updatePad(99, { name: "New" })).rejects.toThrow(
        "Pad with ID 99 not found",
      );
    });
  });

  describe("deletePad", () => {
    it("should delete a pad", async () => {
      const existingPad = {
        id: 1,
        name: "Pad",
        location: "L",
        capacity: 10,
        price_per_day: "15.00",
        amenities: [],
        status: "available",
        created_at: new Date(),
      };
      mockPadRepository.findById.mockResolvedValue(existingPad);
      mockPadRepository.delete.mockResolvedValue(true);

      const result = await service.deletePad(1);

      expect(mockPadRepository.findById).toHaveBeenCalledWith(1);
      expect(mockPadRepository.delete).toHaveBeenCalledWith(1);
      expect(result).toBe(true);
    });

    it("should throw error when pad not found", async () => {
      mockPadRepository.findById.mockResolvedValue(null);

      await expect(service.deletePad(99)).rejects.toThrow(
        "Pad with ID 99 not found",
      );
    });
  });
});
