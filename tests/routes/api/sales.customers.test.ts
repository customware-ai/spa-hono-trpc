/**
 * Tests for Customer API Routes
 *
 * Tests the RESTful API endpoints for customer CRUD operations.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ok, err } from 'neverthrow';
import { createLoaderArgs, createActionArgs } from '../../helpers';
import type { Customer } from '~/schemas';

// Mock the ERP service module
vi.mock('~/services/erp', () => ({
  getCustomers: vi.fn(),
  getCustomerById: vi.fn(),
  createCustomer: vi.fn(),
  updateCustomer: vi.fn(),
  deleteCustomer: vi.fn(),
}));

// Mock the json utility
vi.mock('~/utils/json', () => ({
  json: (data: unknown, init?: ResponseInit): Response => {
    const headers: Record<string, string> = { 'Content-Type': 'application/json' };
    if (init?.headers) {
      Object.assign(headers, init.headers);
    }
    return new Response(JSON.stringify(data), {
      ...init,
      headers,
    });
  },
}));

import { loader, action } from '~/routes/api/sales.customers';
import * as erp from '~/services/erp';

function createRequest(method: string, url: string, body?: Record<string, string>): Request {
  const options: RequestInit = { method };
  if (body) {
    const formData = new FormData();
    Object.entries(body).forEach(([key, value]) => {
      formData.append(key, value);
    });
    options.body = formData;
  }
  return new Request(url, options);
}

/**
 * Creates a properly typed mock Customer object matching CustomerSchema
 */
function createMockCustomer(overrides?: Partial<Customer>): Customer {
  const baseCustomer: Customer = {
    id: 1,
    company_name: 'Acme Corp',
    email: 'info@acme.com',
    phone: null,
    status: 'active',
    notes: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };
  return { ...baseCustomer, ...overrides };
}

describe('API Sales Customers Routes', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loader', () => {
    it('should return all customers when no filters are provided', async () => {
      const mockCustomers: Customer[] = [createMockCustomer()];
      vi.mocked(erp.getCustomers).mockResolvedValue(ok(mockCustomers));

      const request = createRequest('GET', 'http://localhost/api/sales/customers');
      const response = await loader(createLoaderArgs(request));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.customers).toEqual(mockCustomers);
      expect(body.total).toBe(1);
    });

    it('should filter customers by status', async () => {
      const mockCustomers: Customer[] = [createMockCustomer({ status: 'active' })];
      vi.mocked(erp.getCustomers).mockResolvedValue(ok(mockCustomers));

      const request = createRequest('GET', 'http://localhost/api/sales/customers?status=active');
      await loader(createLoaderArgs(request));

      expect(erp.getCustomers).toHaveBeenCalledWith({
        status: 'active',
        search: undefined,
      });
    });

    it('should search customers by name', async () => {
      const mockCustomers: Customer[] = [createMockCustomer()];
      vi.mocked(erp.getCustomers).mockResolvedValue(ok(mockCustomers));

      const request = createRequest('GET', 'http://localhost/api/sales/customers?search=acme');
      await loader(createLoaderArgs(request));

      expect(erp.getCustomers).toHaveBeenCalledWith({
        status: undefined,
        search: 'acme',
      });
    });

    it('should handle database errors', async () => {
      vi.mocked(erp.getCustomers).mockResolvedValue(err({
        type: 'DATABASE_ERROR' as const,
        message: 'Database error',
      }));

      const request = createRequest('GET', 'http://localhost/api/sales/customers');
      const response = await loader(createLoaderArgs(request));

      expect(response.status).toBe(500);
      const body = await response.json();
      expect(body.error).toBe('Database error');
    });
  });

  describe('action - POST (create)', () => {
    it('should create a customer with valid data', async () => {
      const mockCustomer = createMockCustomer();
      vi.mocked(erp.createCustomer).mockResolvedValue(ok(mockCustomer));

      const request = createRequest('POST', 'http://localhost/api/sales/customers', {
        company_name: 'New Corp',
        email: 'info@newcorp.com',
      });
      const response = await action(createActionArgs(request));

      expect(response.status).toBe(201);
      const body = await response.json();
      expect(body.customer).toEqual(mockCustomer);
      expect(body.message).toContain('created successfully');
    });

    it('should return validation error for missing company name', async () => {
      const request = createRequest('POST', 'http://localhost/api/sales/customers', {
        email: 'info@example.com',
      });
      const response = await action(createActionArgs(request));

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toBe('Validation failed');
    });

    it('should handle database errors during creation', async () => {
      vi.mocked(erp.createCustomer).mockResolvedValue(err({
        type: 'DATABASE_ERROR' as const,
        message: 'Database error',
      }));

      const request = createRequest('POST', 'http://localhost/api/sales/customers', {
        company_name: 'Test Corp',
        email: 'test@example.com',
      });
      const response = await action(createActionArgs(request));

      expect(response.status).toBe(500);
    });
  });

  describe('action - PUT (update)', () => {
    it('should update a customer with valid data', async () => {
      const mockCustomer = createMockCustomer({ company_name: 'Updated Corp' });
      vi.mocked(erp.updateCustomer).mockResolvedValue(ok(mockCustomer));

      const request = createRequest('PUT', 'http://localhost/api/sales/customers?id=1', {
        company_name: 'Updated Corp',
        email: 'updated@example.com',
      });
      const response = await action(createActionArgs(request));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.message).toContain('updated successfully');
    });

    it('should return error for missing customer ID', async () => {
      const request = createRequest('PUT', 'http://localhost/api/sales/customers', {
        company_name: 'Updated Corp',
      });
      const response = await action(createActionArgs(request));

      expect(response.status).toBe(400);
      const body = await response.json();
      expect(body.error).toContain('ID is required');
    });
  });

  describe('action - DELETE', () => {
    it('should delete a customer', async () => {
      vi.mocked(erp.deleteCustomer).mockResolvedValue(ok(undefined));

      const request = createRequest('DELETE', 'http://localhost/api/sales/customers?id=1');
      const response = await action(createActionArgs(request));

      expect(response.status).toBe(200);
      const body = await response.json();
      expect(body.message).toContain('deleted successfully');
    });

    it('should return error for missing customer ID', async () => {
      const request = createRequest('DELETE', 'http://localhost/api/sales/customers');
      const response = await action(createActionArgs(request));

      expect(response.status).toBe(400);
    });
  });

  describe('method validation', () => {
    it('should return 405 for unsupported methods', async () => {
      const request = createRequest('PATCH', 'http://localhost/api/sales/customers');
      const response = await action(createActionArgs(request));

      expect(response.status).toBe(405);
      const body = await response.json();
      expect(body.error).toBe('Method not allowed');
    });
  });
});
