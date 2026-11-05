import {
  bigint,
  bigserial,
  boolean,
  index,
  integer,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
  unique,
} from 'drizzle-orm/pg-core'

// Enum'lar types/vehicle.ts literal union'larıyla birebir eşleşir.
export const vehicleStatusEnum = pgEnum('vehicle_status', ['Satışta', 'Rezerve', 'Satıldı'])
export const vehicleConditionEnum = pgEnum('vehicle_condition', ['Sıfır', 'İkinci El'])
export const fuelTypeEnum = pgEnum('fuel_type', ['Benzin', 'Dizel', 'Hibrit', 'Elektrik'])
export const transmissionTypeEnum = pgEnum('transmission_type', ['Otomatik', 'Manuel'])
export const bodyTypeEnum = pgEnum('body_type', [
  'Sedan',
  'Coupe',
  'SUV',
  'Station Wagon',
  'Hatchback',
])
export const inquirySourceEnum = pgEnum('inquiry_source', ['form', 'whatsapp'])
export const inquiryStatusEnum = pgEnum('inquiry_status', ['new', 'contacted', 'closed'])
export const adminRoleEnum = pgEnum('admin_role', ['owner', 'editor'])

export const vehicles = pgTable('vehicles', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  slug: text('slug').notNull().unique(),
  brand: text('brand').notNull(),
  model: text('model').notNull(),
  trim: text('trim').notNull().default(''),
  year: integer('year').notNull(),
  price: bigint('price', { mode: 'number' }).notNull(),
  mileage: integer('mileage').notNull(),
  fuel: fuelTypeEnum('fuel').notNull(),
  transmission: transmissionTypeEnum('transmission').notNull(),
  body: bodyTypeEnum('body').notNull(),
  color: text('color').notNull().default(''),
  status: vehicleStatusEnum('status').notNull().default('Satışta'),
  condition: vehicleConditionEnum('condition').notNull().default('İkinci El'),
  featured: boolean('featured').notNull().default(false),
  description: text('description').notNull().default(''),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const vehicleImages = pgTable(
  'vehicle_images',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    vehicleId: bigint('vehicle_id', { mode: 'number' })
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    url: text('url').notNull(),
    alt: text('alt').notNull().default(''),
    sortOrder: integer('sort_order').notNull().default(0),
    isKey: boolean('is_key').notNull().default(false),
  },
  (table) => [
    unique('vehicle_images_vehicle_sort_unique').on(table.vehicleId, table.sortOrder),
    index('vehicle_images_vehicle_idx').on(table.vehicleId),
  ],
)

export const vehicleSpecs = pgTable(
  'vehicle_specs',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    vehicleId: bigint('vehicle_id', { mode: 'number' })
      .notNull()
      .references(() => vehicles.id, { onDelete: 'cascade' }),
    label: text('label').notNull(),
    value: text('value').notNull(),
    sortOrder: integer('sort_order').notNull().default(0),
  },
  (table) => [
    unique('vehicle_specs_vehicle_label_unique').on(table.vehicleId, table.label),
    index('vehicle_specs_vehicle_idx').on(table.vehicleId),
  ],
)

export const inquiries = pgTable(
  'inquiries',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    vehicleId: bigint('vehicle_id', { mode: 'number' }).references(() => vehicles.id, {
      onDelete: 'set null',
    }),
    name: text('name').notNull(),
    phone: text('phone').notNull(),
    email: text('email').notNull(),
    message: text('message').notNull(),
    source: inquirySourceEnum('source').notNull().default('form'),
    status: inquiryStatusEnum('status').notNull().default('new'),
    ipHash: text('ip_hash'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('inquiries_status_idx').on(table.status, table.createdAt)],
)

export const adminUsers = pgTable('admin_users', {
  id: bigserial('id', { mode: 'number' }).primaryKey(),
  email: text('email').notNull().unique(),
  passwordHash: text('password_hash'),
  name: text('name').notNull().default(''),
  role: adminRoleEnum('role').notNull().default('editor'),
  isActive: boolean('is_active').notNull().default(true),
  createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  lastLoginAt: timestamp('last_login_at', { withTimezone: true }),
})

export const siteConfigTable = pgTable('site_config', {
  key: text('key').primaryKey(),
  value: jsonb('value').notNull(),
  updatedAt: timestamp('updated_at', { withTimezone: true }).notNull().defaultNow(),
})

export const auditLog = pgTable(
  'audit_log',
  {
    id: bigserial('id', { mode: 'number' }).primaryKey(),
    actorId: bigint('actor_id', { mode: 'number' }).references(() => adminUsers.id, {
      onDelete: 'set null',
    }),
    action: text('action').notNull(),
    entity: text('entity').notNull(),
    entityId: text('entity_id'),
    diff: jsonb('diff'),
    ipHash: text('ip_hash'),
    createdAt: timestamp('created_at', { withTimezone: true }).notNull().defaultNow(),
  },
  (table) => [index('audit_log_created_idx').on(table.createdAt)],
)

export const rateLimits = pgTable('rate_limits', {
  key: text('key').primaryKey(),
  count: integer('count').notNull().default(1),
  resetAt: timestamp('reset_at', { withTimezone: true }).notNull(),
})
