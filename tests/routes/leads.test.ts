/**
 * Tests for Leads Page Route
 *
 * Tests the loader function for the leads kanban board page.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { createLoaderArgs } from '../helpers';

// Mock the ERP service module
vi.mock('~/services/erp', () => ({
  getDemoLeads: vi.fn(),
}));

import { loader } from '~/routes/sales/leads';
import * as erp from '~/services/erp';

describe('Leads Route', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('loader', () => {
    it('should return leads grouped by status', async () => {
      const mockLeads = [
        { id: 1, company_name: 'Acme Corp', contact_name: 'John', estimated_value: 25000, probability: 20, stage: 'new', created_at: '2024-01-01' },
        { id: 2, company_name: 'Tech Inc', contact_name: 'Jane', estimated_value: 50000, probability: 40, stage: 'contacted', created_at: '2024-01-02' },
        { id: 3, company_name: 'Global Co', contact_name: 'Bob', estimated_value: 75000, probability: 60, stage: 'qualified', created_at: '2024-01-03' },
      ];
      vi.mocked(erp.getDemoLeads).mockResolvedValue(mockLeads);

      const request = new Request('http://localhost/sales/leads');
      const result = await loader(createLoaderArgs(request));

      expect(result.leadsByStatus).toBeDefined();
      expect(result.leadsByStatus.new).toHaveLength(1);
      expect(result.leadsByStatus.contacted).toHaveLength(1);
      expect(result.leadsByStatus.qualified).toHaveLength(1);
      expect(result.leadsByStatus.new[0].company_name).toBe('Acme Corp');
    });

    it('should return empty arrays for stages with no leads', async () => {
      const mockLeads = [
        { id: 1, company_name: 'Acme Corp', contact_name: 'John', estimated_value: 25000, probability: 20, stage: 'new', created_at: '2024-01-01' },
      ];
      vi.mocked(erp.getDemoLeads).mockResolvedValue(mockLeads);

      const request = new Request('http://localhost/sales/leads');
      const result = await loader(createLoaderArgs(request));

      expect(result.leadsByStatus.new).toHaveLength(1);
      expect(result.leadsByStatus.contacted).toHaveLength(0);
      expect(result.leadsByStatus.qualified).toHaveLength(0);
      expect(result.leadsByStatus.proposal).toHaveLength(0);
      expect(result.leadsByStatus.won).toHaveLength(0);
    });

    it('should handle empty leads array', async () => {
      vi.mocked(erp.getDemoLeads).mockResolvedValue([]);

      const request = new Request('http://localhost/sales/leads');
      const result = await loader(createLoaderArgs(request));

      expect(result.leadsByStatus.new).toHaveLength(0);
      expect(result.leadsByStatus.contacted).toHaveLength(0);
    });

    it('should call getDemoLeads service', async () => {
      vi.mocked(erp.getDemoLeads).mockResolvedValue([]);

      const request = new Request('http://localhost/sales/leads');
      await loader(createLoaderArgs(request));

      expect(erp.getDemoLeads).toHaveBeenCalledTimes(1);
    });
  });
});
