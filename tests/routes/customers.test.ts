/**
 * Tests for Customers Page Route
 *
 * Tests the loader function for the customers list page.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ok, err } from 'neverthrow';
import { createLoaderArgs } from '../helpers';
import type { Customer } from '~/schemas';

// Mock the ERP service module
vi.mock('~/services/erp', () => ({
  getCustomers: vi.fn(),
}));

import { loader } from '~/routes/sales/customers';
import * as erp from '~/services/erp';

/**
 * Creates a properly typed mock Customer object matching CustomerSchema
 */
function createMockCustomer(overrides?: Partial<Customer>): Customer {
  const baseCustomer: Customer = {
    id: 1,
    company_name: 'Acme Corp',
    contact_name: null,
    email: 'info@acme.com',
    phone: null,
    address: null,
    city: null,
    state: null,
    postal_code: null,
    country: 'USA',
    tax_id: null,
    payment_terms: 30,
    credit_limit: 0,
    status: 'active',
    notes: null,
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
  };
  return { ...baseCustomer, ...overrides };
}

describe('Customers Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loader', () => {
    it('should return all customers when no filters are provided', async () => {
      const mockCustomers: Customer[] = [createMockCustomer()];
      vi.mocked(erp.getCustomers).mockResolvedValue(ok(mockCustomers));

      const request = new Request('http://localhost/sales/customers');
      const result = await loader(createLoaderArgs(request));

      expect(result.customers).toEqual(mockCustomers);
      expect(result.error).toBeNull();
      expect(erp.getCustomers).toHaveBeenCalledWith({
        search: undefined,
        status: undefined,
      });
    });

    it('should pass search and status parameters from URL', async () => {
      const mockCustomers: Customer[] = [createMockCustomer()];
      vi.mocked(erp.getCustomers).mockResolvedValue(ok(mockCustomers));

      const request = new Request('http://localhost/sales/customers?search=test&status=inactive');
      const result = await loader(createLoaderArgs(request));

      expect(result.customers).toEqual(mockCustomers);
      expect(erp.getCustomers).toHaveBeenCalledWith({
        search: 'test',
        status: 'inactive',
      });
    });

    it('should return error message when database fetch fails', async () => {
      vi.mocked(erp.getCustomers).mockResolvedValue(err({
        type: 'DATABASE_ERROR' as const,
        message: 'Fetch failed',
      }));

      const request = new Request('http://localhost/sales/customers');
      const result = await loader(createLoaderArgs(request));

      expect(result.customers).toEqual([]);
      expect(result.error).toBe('Fetch failed');
    });
  });
});
