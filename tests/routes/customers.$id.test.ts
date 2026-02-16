/**
 * Tests for Customer Detail Page Route
 *
 * Tests the loader function for the customer detail page.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { ok, err } from 'neverthrow';
import type { LoaderFunctionArgs } from 'react-router';
import type { Customer } from '~/schemas';

// Mock the ERP service module
vi.mock('~/services/erp', () => ({
  getCustomerById: vi.fn(),
}));

import { loader } from '~/routes/sales/customers.$id';
import * as erp from '~/services/erp';

/**
 * Creates mock loader function args for testing with params.
 */
function createLoaderArgsWithParams(
  request: Request,
  params: Record<string, string>
): LoaderFunctionArgs {
  return {
    request,
    params,
    context: {},
    unstable_pattern: '/sales/customers/:id',
  } as LoaderFunctionArgs;
}

/**
 * Creates a mock Customer object for testing
 */
function createMockCustomer(overrides?: Partial<Customer>): Customer {
  return {
    id: 1,
    company_name: 'Test Corp',
    contact_name: 'John Doe',
    email: 'john@testcorp.com',
    phone: '555-1234',
    address: '123 Main St',
    city: 'New York',
    state: 'NY',
    postal_code: '10001',
    country: 'USA',
    tax_id: '12-3456789',
    payment_terms: 30,
    credit_limit: 5000,
    status: 'active',
    notes: 'Important customer',
    created_at: '2024-01-01T00:00:00.000Z',
    updated_at: '2024-01-01T00:00:00.000Z',
    ...overrides,
  };
}

describe('Customer Detail Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loader', () => {
    it('should return customer data for valid id', async () => {
      const mockCustomer = createMockCustomer({ id: 42, company_name: 'Acme Corp' });
      vi.mocked(erp.getCustomerById).mockResolvedValue(ok(mockCustomer));

      const request = new Request('http://localhost/sales/customers/42');
      const result = await loader(createLoaderArgsWithParams(request, { id: '42' }));

      expect(result.customer).toEqual(mockCustomer);
      expect(erp.getCustomerById).toHaveBeenCalledWith(42);
    });

    it('should throw 404 response when customer not found', async () => {
      vi.mocked(erp.getCustomerById).mockResolvedValue(ok(null));

      const request = new Request('http://localhost/sales/customers/999');

      await expect(
        loader(createLoaderArgsWithParams(request, { id: '999' }))
      ).rejects.toThrow();

      // Verify the thrown error is a Response with 404 status
      try {
        await loader(createLoaderArgsWithParams(request, { id: '999' }));
      } catch (error) {
        expect(error).toBeInstanceOf(Response);
        expect((error as Response).status).toBe(404);
      }
    });

    it('should throw 404 response when database returns error', async () => {
      vi.mocked(erp.getCustomerById).mockResolvedValue(
        err({
          type: 'DATABASE_ERROR' as const,
          message: 'Database error',
        })
      );

      const request = new Request('http://localhost/sales/customers/1');

      await expect(
        loader(createLoaderArgsWithParams(request, { id: '1' }))
      ).rejects.toThrow();
    });

    it('should parse id parameter as integer', async () => {
      const mockCustomer = createMockCustomer();
      vi.mocked(erp.getCustomerById).mockResolvedValue(ok(mockCustomer));

      const request = new Request('http://localhost/sales/customers/123');
      await loader(createLoaderArgsWithParams(request, { id: '123' }));

      // Should be called with number, not string
      expect(erp.getCustomerById).toHaveBeenCalledWith(123);
    });

    it('should return all customer fields', async () => {
      const mockCustomer = createMockCustomer({
        id: 1,
        company_name: 'Full Data Corp',
        contact_name: 'Jane Smith',
        email: 'jane@fulldata.com',
        phone: '555-9999',
        address: '456 Oak Ave',
        city: 'Los Angeles',
        state: 'CA',
        postal_code: '90001',
        country: 'USA',
        tax_id: '98-7654321',
        payment_terms: 45,
        credit_limit: 25000,
        status: 'active',
        notes: 'VIP customer',
      });
      vi.mocked(erp.getCustomerById).mockResolvedValue(ok(mockCustomer));

      const request = new Request('http://localhost/sales/customers/1');
      const result = await loader(createLoaderArgsWithParams(request, { id: '1' }));

      expect(result.customer.company_name).toBe('Full Data Corp');
      expect(result.customer.contact_name).toBe('Jane Smith');
      expect(result.customer.email).toBe('jane@fulldata.com');
      expect(result.customer.payment_terms).toBe(45);
      expect(result.customer.credit_limit).toBe(25000);
      expect(result.customer.notes).toBe('VIP customer');
    });
  });
});
