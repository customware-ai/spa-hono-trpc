/**
 * Tests for Quotes Page Route
 *
 * Tests the loader function for the quotes list page.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLoaderArgs } from '../helpers';

// Mock the ERP service module
vi.mock('~/services/erp', () => ({
  getDemoQuotes: vi.fn(),
}));

import { loader } from '~/routes/sales/quotes';
import * as erp from '~/services/erp';

describe('Quotes Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loader', () => {
    it('should return quotes transformed to correct interface', async () => {
      const mockDemoQuotes = [
        {
          id: 1,
          quote_number: 'QT-2026-001',
          customer: 'Acme Corp',
          amount: 5000,
          status: 'draft',
          date: '2024-01-01',
          valid_until: '2024-02-01',
        },
        {
          id: 2,
          quote_number: 'QT-2026-002',
          customer: 'Tech Inc',
          amount: 12500,
          status: 'sent',
          date: '2024-01-02',
          valid_until: '2024-02-02',
        },
      ];
      vi.mocked(erp.getDemoQuotes).mockResolvedValue(mockDemoQuotes);

      const request = new Request('http://localhost/sales/quotes');
      const result = await loader(createLoaderArgs(request));

      expect(result.quotes).toHaveLength(2);
      expect(result.quotes[0]).toEqual({
        id: 1,
        quote_number: 'QT-2026-001',
        customer_name: 'Acme Corp',
        issue_date: '2024-01-01',
        expiry_date: '2024-02-01',
        total: 5000,
        status: 'draft',
      });
    });

    it('should transform customer to customer_name', async () => {
      const mockDemoQuotes = [
        {
          id: 1,
          quote_number: 'QT-001',
          customer: 'Test Customer',
          amount: 1000,
          status: 'draft',
          date: '2024-01-01',
          valid_until: '2024-02-01',
        },
      ];
      vi.mocked(erp.getDemoQuotes).mockResolvedValue(mockDemoQuotes);

      const request = new Request('http://localhost/sales/quotes');
      const result = await loader(createLoaderArgs(request));

      expect(result.quotes[0].customer_name).toBe('Test Customer');
    });

    it('should transform date to issue_date and valid_until to expiry_date', async () => {
      const mockDemoQuotes = [
        {
          id: 1,
          quote_number: 'QT-001',
          customer: 'Test',
          amount: 1000,
          status: 'draft',
          date: '2024-03-15',
          valid_until: '2024-04-15',
        },
      ];
      vi.mocked(erp.getDemoQuotes).mockResolvedValue(mockDemoQuotes);

      const request = new Request('http://localhost/sales/quotes');
      const result = await loader(createLoaderArgs(request));

      expect(result.quotes[0].issue_date).toBe('2024-03-15');
      expect(result.quotes[0].expiry_date).toBe('2024-04-15');
    });

    it('should transform amount to total', async () => {
      const mockDemoQuotes = [
        {
          id: 1,
          quote_number: 'QT-001',
          customer: 'Test',
          amount: 9999.99,
          status: 'sent',
          date: '2024-01-01',
          valid_until: '2024-02-01',
        },
      ];
      vi.mocked(erp.getDemoQuotes).mockResolvedValue(mockDemoQuotes);

      const request = new Request('http://localhost/sales/quotes');
      const result = await loader(createLoaderArgs(request));

      expect(result.quotes[0].total).toBe(9999.99);
    });

    it('should handle empty quotes array', async () => {
      vi.mocked(erp.getDemoQuotes).mockResolvedValue([]);

      const request = new Request('http://localhost/sales/quotes');
      const result = await loader(createLoaderArgs(request));

      expect(result.quotes).toHaveLength(0);
    });

    it('should call getDemoQuotes service', async () => {
      vi.mocked(erp.getDemoQuotes).mockResolvedValue([]);

      const request = new Request('http://localhost/sales/quotes');
      await loader(createLoaderArgs(request));

      expect(erp.getDemoQuotes).toHaveBeenCalledTimes(1);
    });
  });
});
