/**
 * Sample ERP Schema Migration
 *
 * This demonstrates a complete ERP database schema with:
 * - Sales & CRM tables (customers, leads, quotes, orders)
 * - Accounting tables (chart of accounts, invoices, payments, journal entries)
 * - Proper foreign key relationships
 * - Sample seed data
 *
 * Use as reference when designing your application's schema.
 *
 * @customware-ai/template-code
 */

export const migration001 = {
  id: 1,
  name: "Create ERP schema (Sales, CRM)",
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
    DROP TRIGGER IF EXISTS update_customers_timestamp;
    DROP TRIGGER IF EXISTS update_leads_timestamp;
    DROP TRIGGER IF EXISTS update_opportunities_timestamp;
    DROP TRIGGER IF EXISTS update_quotes_timestamp;
    DROP TRIGGER IF EXISTS update_sales_orders_timestamp;
  `,
};
