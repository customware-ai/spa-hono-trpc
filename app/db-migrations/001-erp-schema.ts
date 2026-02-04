export const migration001 = {
  id: 1,
  name: "Create ERP schema (Sales, CRM, Accounting)",
  sql: `
    -- ============================================================
    -- SALES & CRM TABLES
    -- ============================================================

    -- Customers
    CREATE TABLE IF NOT EXISTS customers (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      address TEXT,
      city TEXT,
      state TEXT,
      postal_code TEXT,
      country TEXT DEFAULT 'USA',
      tax_id TEXT,
      payment_terms INTEGER DEFAULT 30,
      credit_limit REAL DEFAULT 0,
      status TEXT DEFAULT 'active' CHECK(status IN ('active', 'inactive')),
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX idx_customers_email ON customers(email);
    CREATE INDEX idx_customers_status ON customers(status);

    -- Contacts (Multiple contacts per customer)
    CREATE TABLE IF NOT EXISTS contacts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER NOT NULL,
      first_name TEXT NOT NULL,
      last_name TEXT NOT NULL,
      email TEXT,
      phone TEXT,
      position TEXT,
      is_primary INTEGER DEFAULT 0,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_contacts_customer ON contacts(customer_id);
    CREATE INDEX idx_contacts_email ON contacts(email);

    -- Leads
    CREATE TABLE IF NOT EXISTS leads (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      company_name TEXT NOT NULL,
      contact_name TEXT,
      email TEXT,
      phone TEXT,
      status TEXT DEFAULT 'new' CHECK(status IN ('new', 'contacted', 'qualified', 'proposal', 'won', 'lost')),
      source TEXT,
      estimated_value REAL DEFAULT 0,
      probability INTEGER DEFAULT 0,
      expected_close_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );
    CREATE INDEX idx_leads_status ON leads(status);
    CREATE INDEX idx_leads_email ON leads(email);

    -- Opportunities
    CREATE TABLE IF NOT EXISTS opportunities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      customer_id INTEGER,
      lead_id INTEGER,
      name TEXT NOT NULL,
      description TEXT,
      stage TEXT DEFAULT 'qualification' CHECK(stage IN ('qualification', 'needs_analysis', 'proposal', 'negotiation', 'closed_won', 'closed_lost')),
      estimated_value REAL DEFAULT 0,
      probability INTEGER DEFAULT 0,
      expected_close_date TEXT,
      actual_close_date TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE SET NULL,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE SET NULL
    );
    CREATE INDEX idx_opportunities_customer ON opportunities(customer_id);
    CREATE INDEX idx_opportunities_stage ON opportunities(stage);

    -- Quotes
    CREATE TABLE IF NOT EXISTS quotes (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL,
      opportunity_id INTEGER,
      issue_date TEXT NOT NULL,
      expiry_date TEXT,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'accepted', 'rejected', 'expired')),
      subtotal REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      terms TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE SET NULL
    );
    CREATE INDEX idx_quotes_customer ON quotes(customer_id);
    CREATE INDEX idx_quotes_status ON quotes(status);
    CREATE INDEX idx_quotes_number ON quotes(quote_number);

    -- Quote Items
    CREATE TABLE IF NOT EXISTS quote_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      quote_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      quantity REAL DEFAULT 1,
      unit_price REAL DEFAULT 0,
      discount_percent REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      line_total REAL DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_quote_items_quote ON quote_items(quote_id);

    -- Sales Orders
    CREATE TABLE IF NOT EXISTS sales_orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL,
      quote_id INTEGER,
      order_date TEXT NOT NULL,
      delivery_date TEXT,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'confirmed', 'processing', 'shipped', 'delivered', 'cancelled')),
      subtotal REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      shipping_amount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
      FOREIGN KEY (quote_id) REFERENCES quotes(id) ON DELETE SET NULL
    );
    CREATE INDEX idx_sales_orders_customer ON sales_orders(customer_id);
    CREATE INDEX idx_sales_orders_status ON sales_orders(status);
    CREATE INDEX idx_sales_orders_number ON sales_orders(order_number);

    -- Sales Order Items
    CREATE TABLE IF NOT EXISTS sales_order_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      order_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      quantity REAL DEFAULT 1,
      unit_price REAL DEFAULT 0,
      discount_percent REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      line_total REAL DEFAULT 0,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (order_id) REFERENCES sales_orders(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_sales_order_items_order ON sales_order_items(order_id);

    -- Activities (CRM activity log)
    CREATE TABLE IF NOT EXISTS activities (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      type TEXT NOT NULL CHECK(type IN ('call', 'meeting', 'email', 'task', 'note')),
      subject TEXT NOT NULL,
      description TEXT,
      customer_id INTEGER,
      lead_id INTEGER,
      opportunity_id INTEGER,
      status TEXT DEFAULT 'pending' CHECK(status IN ('pending', 'completed', 'cancelled')),
      due_date TEXT,
      completed_at TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE,
      FOREIGN KEY (lead_id) REFERENCES leads(id) ON DELETE CASCADE,
      FOREIGN KEY (opportunity_id) REFERENCES opportunities(id) ON DELETE CASCADE
    );
    CREATE INDEX idx_activities_customer ON activities(customer_id);
    CREATE INDEX idx_activities_lead ON activities(lead_id);
    CREATE INDEX idx_activities_status ON activities(status);

    -- ============================================================
    -- ACCOUNTING & FINANCE TABLES
    -- ============================================================

    -- Chart of Accounts
    CREATE TABLE IF NOT EXISTS chart_of_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_code TEXT NOT NULL UNIQUE,
      account_name TEXT NOT NULL,
      account_type TEXT NOT NULL CHECK(account_type IN ('asset', 'liability', 'equity', 'revenue', 'expense')),
      parent_id INTEGER,
      description TEXT,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (parent_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL
    );
    CREATE INDEX idx_coa_type ON chart_of_accounts(account_type);
    CREATE INDEX idx_coa_code ON chart_of_accounts(account_code);

    -- Invoices
    CREATE TABLE IF NOT EXISTS invoices (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL,
      sales_order_id INTEGER,
      invoice_date TEXT NOT NULL,
      due_date TEXT NOT NULL,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'sent', 'partial', 'paid', 'overdue', 'cancelled')),
      subtotal REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      tax_amount REAL DEFAULT 0,
      discount_amount REAL DEFAULT 0,
      total REAL DEFAULT 0,
      amount_paid REAL DEFAULT 0,
      amount_due REAL DEFAULT 0,
      terms TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
      FOREIGN KEY (sales_order_id) REFERENCES sales_orders(id) ON DELETE SET NULL
    );
    CREATE INDEX idx_invoices_customer ON invoices(customer_id);
    CREATE INDEX idx_invoices_status ON invoices(status);
    CREATE INDEX idx_invoices_number ON invoices(invoice_number);
    CREATE INDEX idx_invoices_due_date ON invoices(due_date);

    -- Invoice Items
    CREATE TABLE IF NOT EXISTS invoice_items (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      invoice_id INTEGER NOT NULL,
      description TEXT NOT NULL,
      quantity REAL DEFAULT 1,
      unit_price REAL DEFAULT 0,
      discount_percent REAL DEFAULT 0,
      tax_rate REAL DEFAULT 0,
      line_total REAL DEFAULT 0,
      account_id INTEGER,
      sort_order INTEGER DEFAULT 0,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id) ON DELETE SET NULL
    );
    CREATE INDEX idx_invoice_items_invoice ON invoice_items(invoice_id);

    -- Payments
    CREATE TABLE IF NOT EXISTS payments (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      payment_number TEXT NOT NULL UNIQUE,
      customer_id INTEGER NOT NULL,
      invoice_id INTEGER,
      payment_date TEXT NOT NULL,
      amount REAL NOT NULL,
      payment_method TEXT CHECK(payment_method IN ('cash', 'check', 'credit_card', 'bank_transfer', 'other')),
      reference_number TEXT,
      notes TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE RESTRICT,
      FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE SET NULL
    );
    CREATE INDEX idx_payments_customer ON payments(customer_id);
    CREATE INDEX idx_payments_invoice ON payments(invoice_id);
    CREATE INDEX idx_payments_date ON payments(payment_date);

    -- Journal Entries
    CREATE TABLE IF NOT EXISTS journal_entries (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      entry_number TEXT NOT NULL UNIQUE,
      entry_date TEXT NOT NULL,
      entry_type TEXT DEFAULT 'general' CHECK(entry_type IN ('general', 'adjusting', 'closing', 'opening')),
      description TEXT,
      reference TEXT,
      status TEXT DEFAULT 'draft' CHECK(status IN ('draft', 'posted', 'void')),
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      posted_at TEXT
    );
    CREATE INDEX idx_journal_entries_date ON journal_entries(entry_date);
    CREATE INDEX idx_journal_entries_status ON journal_entries(status);

    -- Journal Entry Lines
    CREATE TABLE IF NOT EXISTS journal_entry_lines (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      journal_entry_id INTEGER NOT NULL,
      account_id INTEGER NOT NULL,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      description TEXT,
      FOREIGN KEY (journal_entry_id) REFERENCES journal_entries(id) ON DELETE CASCADE,
      FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id) ON DELETE RESTRICT
    );
    CREATE INDEX idx_je_lines_entry ON journal_entry_lines(journal_entry_id);
    CREATE INDEX idx_je_lines_account ON journal_entry_lines(account_id);

    -- General Ledger
    CREATE TABLE IF NOT EXISTS ledger (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      transaction_date TEXT NOT NULL,
      transaction_type TEXT NOT NULL,
      reference_id INTEGER,
      reference_type TEXT,
      debit REAL DEFAULT 0,
      credit REAL DEFAULT 0,
      balance REAL DEFAULT 0,
      description TEXT,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id) ON DELETE RESTRICT
    );
    CREATE INDEX idx_ledger_account ON ledger(account_id);
    CREATE INDEX idx_ledger_date ON ledger(transaction_date);
    CREATE INDEX idx_ledger_type ON ledger(transaction_type);

    -- Bank Accounts
    CREATE TABLE IF NOT EXISTS bank_accounts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      account_id INTEGER NOT NULL,
      bank_name TEXT NOT NULL,
      account_number TEXT,
      routing_number TEXT,
      account_type TEXT CHECK(account_type IN ('checking', 'savings', 'credit_card', 'line_of_credit')),
      current_balance REAL DEFAULT 0,
      is_active INTEGER DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (account_id) REFERENCES chart_of_accounts(id) ON DELETE RESTRICT
    );

    -- ============================================================
    -- SEED DEFAULT CHART OF ACCOUNTS
    -- ============================================================

    -- Assets
    INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
    ('1000', 'Assets', 'asset', 'All asset accounts'),
    ('1100', 'Current Assets', 'asset', 'Assets expected to be converted to cash within one year'),
    ('1110', 'Cash', 'asset', 'Cash on hand and in bank'),
    ('1120', 'Accounts Receivable', 'asset', 'Money owed by customers'),
    ('1130', 'Inventory', 'asset', 'Goods available for sale'),
    ('1200', 'Fixed Assets', 'asset', 'Long-term tangible assets'),
    ('1210', 'Equipment', 'asset', 'Office and business equipment'),
    ('1220', 'Accumulated Depreciation', 'asset', 'Contra asset account for depreciation');

    -- Set parent relationships for assets
    UPDATE chart_of_accounts SET parent_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1000') WHERE account_code IN ('1100', '1200');
    UPDATE chart_of_accounts SET parent_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1100') WHERE account_code IN ('1110', '1120', '1130');
    UPDATE chart_of_accounts SET parent_id = (SELECT id FROM chart_of_accounts WHERE account_code = '1200') WHERE account_code IN ('1210', '1220');

    -- Liabilities
    INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
    ('2000', 'Liabilities', 'liability', 'All liability accounts'),
    ('2100', 'Current Liabilities', 'liability', 'Obligations due within one year'),
    ('2110', 'Accounts Payable', 'liability', 'Money owed to suppliers'),
    ('2120', 'Sales Tax Payable', 'liability', 'Sales tax collected from customers'),
    ('2200', 'Long-term Liabilities', 'liability', 'Obligations due after one year'),
    ('2210', 'Loans Payable', 'liability', 'Long-term loans');

    -- Set parent relationships for liabilities
    UPDATE chart_of_accounts SET parent_id = (SELECT id FROM chart_of_accounts WHERE account_code = '2000') WHERE account_code IN ('2100', '2200');
    UPDATE chart_of_accounts SET parent_id = (SELECT id FROM chart_of_accounts WHERE account_code = '2100') WHERE account_code IN ('2110', '2120');
    UPDATE chart_of_accounts SET parent_id = (SELECT id FROM chart_of_accounts WHERE account_code = '2200') WHERE account_code = '2210';

    -- Equity
    INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
    ('3000', 'Equity', 'equity', 'Owners equity'),
    ('3100', 'Owner''s Equity', 'equity', 'Owners investment in the business'),
    ('3200', 'Retained Earnings', 'equity', 'Accumulated profits');

    -- Set parent relationships for equity
    UPDATE chart_of_accounts SET parent_id = (SELECT id FROM chart_of_accounts WHERE account_code = '3000') WHERE account_code IN ('3100', '3200');

    -- Revenue
    INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
    ('4000', 'Revenue', 'revenue', 'All revenue accounts'),
    ('4100', 'Sales Revenue', 'revenue', 'Revenue from sales'),
    ('4200', 'Service Revenue', 'revenue', 'Revenue from services'),
    ('4900', 'Other Revenue', 'revenue', 'Other income');

    -- Set parent relationships for revenue
    UPDATE chart_of_accounts SET parent_id = (SELECT id FROM chart_of_accounts WHERE account_code = '4000') WHERE account_code IN ('4100', '4200', '4900');

    -- Expenses
    INSERT INTO chart_of_accounts (account_code, account_name, account_type, description) VALUES
    ('5000', 'Expenses', 'expense', 'All expense accounts'),
    ('5100', 'Cost of Goods Sold', 'expense', 'Direct costs of producing goods'),
    ('5200', 'Operating Expenses', 'expense', 'Day-to-day business expenses'),
    ('5210', 'Salaries and Wages', 'expense', 'Employee compensation'),
    ('5220', 'Rent Expense', 'expense', 'Facility rent'),
    ('5230', 'Utilities', 'expense', 'Utilities expenses'),
    ('5240', 'Office Supplies', 'expense', 'Office supplies and materials'),
    ('5250', 'Marketing and Advertising', 'expense', 'Marketing costs'),
    ('5900', 'Other Expenses', 'expense', 'Miscellaneous expenses');

    -- Set parent relationships for expenses
    UPDATE chart_of_accounts SET parent_id = (SELECT id FROM chart_of_accounts WHERE account_code = '5000') WHERE account_code IN ('5100', '5200', '5900');
    UPDATE chart_of_accounts SET parent_id = (SELECT id FROM chart_of_accounts WHERE account_code = '5200') WHERE account_code IN ('5210', '5220', '5230', '5240', '5250');

    -- ============================================================
    -- TRIGGERS
    -- ============================================================

    -- Update timestamps
    CREATE TRIGGER update_customers_timestamp AFTER UPDATE ON customers
    BEGIN
      UPDATE customers SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER update_leads_timestamp AFTER UPDATE ON leads
    BEGIN
      UPDATE leads SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER update_opportunities_timestamp AFTER UPDATE ON opportunities
    BEGIN
      UPDATE opportunities SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER update_quotes_timestamp AFTER UPDATE ON quotes
    BEGIN
      UPDATE quotes SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER update_sales_orders_timestamp AFTER UPDATE ON sales_orders
    BEGIN
      UPDATE sales_orders SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;

    CREATE TRIGGER update_invoices_timestamp AFTER UPDATE ON invoices
    BEGIN
      UPDATE invoices SET updated_at = CURRENT_TIMESTAMP WHERE id = NEW.id;
    END;
  `,
  rollback: `
    DROP TABLE IF EXISTS activities;
    DROP TABLE IF EXISTS sales_order_items;
    DROP TABLE IF EXISTS sales_orders;
    DROP TABLE IF EXISTS quote_items;
    DROP TABLE IF EXISTS quotes;
    DROP TABLE IF EXISTS opportunities;
    DROP TABLE IF EXISTS leads;
    DROP TABLE IF EXISTS contacts;
    DROP TABLE IF EXISTS customers;
    DROP TABLE IF EXISTS ledger;
    DROP TABLE IF EXISTS journal_entry_lines;
    DROP TABLE IF EXISTS journal_entries;
    DROP TABLE IF EXISTS bank_accounts;
    DROP TABLE IF EXISTS payments;
    DROP TABLE IF EXISTS invoice_items;
    DROP TABLE IF EXISTS invoices;
    DROP TABLE IF EXISTS chart_of_accounts;
    DROP TRIGGER IF EXISTS update_customers_timestamp;
    DROP TRIGGER IF EXISTS update_leads_timestamp;
    DROP TRIGGER IF EXISTS update_opportunities_timestamp;
    DROP TRIGGER IF EXISTS update_quotes_timestamp;
    DROP TRIGGER IF EXISTS update_sales_orders_timestamp;
    DROP TRIGGER IF EXISTS update_invoices_timestamp;
  `,
};
