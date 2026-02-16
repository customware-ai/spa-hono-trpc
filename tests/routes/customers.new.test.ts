/**
 * Tests for New Customer Page Route
 *
 * Tests the action function for creating new customers.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ok, err } from 'neverthrow';
import { createActionArgs } from '../helpers';
import type { Customer } from '~/schemas';

// Mock the ERP service module
vi.mock('~/services/erp', () => ({
  createCustomer: vi.fn(),
}));

import { action } from '~/routes/sales/customers.new';
import * as erp from '~/services/erp';

/**
 * Creates a FormData object from an object
 */
function createFormData(data: Record<string, string>): FormData {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    formData.append(key, value);
  });
  return formData;
}

/**
 * Creates a mock Customer object for testing
 */
function createMockCustomer(overrides?: Partial<Customer>): Customer {
  return {
    id: 1,
    company_name: 'Test Corp',
    email: 'test@test.com',
    phone: null,
    status: 'active',
    notes: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('New Customer Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('action', () => {
    it('should create customer with valid data and redirect', async () => {
      const mockCustomer = createMockCustomer({ company_name: 'New Corp' });
      vi.mocked(erp.createCustomer).mockResolvedValue(ok(mockCustomer));

      const formData = createFormData({
        company_name: 'New Corp',
        email: 'new@corp.com',
      });

      const request = new Request('http://localhost/sales/customers/new', {
        method: 'POST',
        body: formData,
      });

      const result = await action(createActionArgs(request));

      // Should redirect on success
      expect(result).toBeInstanceOf(Response);
      expect((result as Response).status).toBe(302);
      expect((result as Response).headers.get('Location')).toBe('/sales/customers');
    });

    it('should return validation error for missing company_name', async () => {
      const formData = createFormData({
        email: 'test@test.com',
        // company_name is missing
      });

      const request = new Request('http://localhost/sales/customers/new', {
        method: 'POST',
        body: formData,
      });

      const result = await action(createActionArgs(request));

      // Should NOT be a redirect
      expect(result).not.toBeInstanceOf(Response);
      expect((result as { error: string }).error).toBe('Validation failed');
    });

    it('should return database error when createCustomer fails', async () => {
      vi.mocked(erp.createCustomer).mockResolvedValue(
        err({
          type: 'DATABASE_ERROR' as const,
          message: 'Database connection failed',
        })
      );

      const formData = createFormData({
        company_name: 'Test Corp',
        email: 'test@test.com',
      });

      const request = new Request('http://localhost/sales/customers/new', {
        method: 'POST',
        body: formData,
      });

      const result = await action(createActionArgs(request));

      expect(result).not.toBeInstanceOf(Response);
      expect((result as { error: string }).error).toBe('Database connection failed');
    });

    it('should use default values for optional fields', async () => {
      const mockCustomer = createMockCustomer();
      vi.mocked(erp.createCustomer).mockResolvedValue(ok(mockCustomer));

      const formData = createFormData({
        company_name: 'Minimal Corp',
        // Only required field, all others use defaults
      });

      const request = new Request('http://localhost/sales/customers/new', {
        method: 'POST',
        body: formData,
      });

      await action(createActionArgs(request));

      expect(erp.createCustomer).toHaveBeenCalledWith(
        expect.objectContaining({
          company_name: 'Minimal Corp',
          status: 'active',
        })
      );
    });

    it('should pass all form fields to createCustomer', async () => {
      const mockCustomer = createMockCustomer();
      vi.mocked(erp.createCustomer).mockResolvedValue(ok(mockCustomer));

      const formData = createFormData({
        company_name: 'Full Corp',
        email: 'john@fullcorp.com',
        phone: '555-1234',
        status: 'inactive',
        notes: 'Important customer',
      });

      const request = new Request('http://localhost/sales/customers/new', {
        method: 'POST',
        body: formData,
      });

      await action(createActionArgs(request));

      expect(erp.createCustomer).toHaveBeenCalledWith(
        expect.objectContaining({
          company_name: 'Full Corp',
          email: 'john@fullcorp.com',
          phone: '555-1234',
          status: 'inactive',
          notes: 'Important customer',
        })
      );
    });

    it('should handle null optional fields', async () => {
      const mockCustomer = createMockCustomer();
      vi.mocked(erp.createCustomer).mockResolvedValue(ok(mockCustomer));

      const formData = createFormData({
        company_name: 'Test Corp',
        email: '',
        phone: '',
      });

      const request = new Request('http://localhost/sales/customers/new', {
        method: 'POST',
        body: formData,
      });

      await action(createActionArgs(request));

      expect(erp.createCustomer).toHaveBeenCalledWith(
        expect.objectContaining({
          company_name: 'Test Corp',
          email: null,
          phone: null,
        })
      );
    });
  });
});
