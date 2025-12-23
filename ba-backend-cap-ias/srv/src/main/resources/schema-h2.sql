
DROP VIEW IF EXISTS OrderService_Orders;
DROP TABLE IF EXISTS cds_outbox_Messages;
DROP TABLE IF EXISTS sap_cap_orders_Orders;

CREATE TABLE sap_cap_orders_Orders (
  ID NVARCHAR(36) NOT NULL,
  createdAt TIMESTAMP(7),
  createdBy NVARCHAR(255),
  modifiedAt TIMESTAMP(7),
  modifiedBy NVARCHAR(255),
  customer NVARCHAR(255) NOT NULL,
  amount DECIMAL(10, 2) NOT NULL,
  status NVARCHAR(255) DEFAULT 'OPEN',
  PRIMARY KEY(ID)
);

CREATE TABLE cds_outbox_Messages (
  ID NVARCHAR(36) NOT NULL,
  timestamp TIMESTAMP(7),
  target NVARCHAR(255),
  msg NCLOB,
  attempts INTEGER DEFAULT 0,
  "PARTITION" INTEGER DEFAULT 0,
  lastError NCLOB,
  lastAttemptTimestamp TIMESTAMP(7),
  status NVARCHAR(23),
  PRIMARY KEY(ID)
);

CREATE VIEW OrderService_Orders AS SELECT
  Orders_0.ID,
  Orders_0.createdAt,
  Orders_0.createdBy,
  Orders_0.modifiedAt,
  Orders_0.modifiedBy,
  Orders_0.customer,
  Orders_0.amount,
  Orders_0.status
FROM sap_cap_orders_Orders AS Orders_0;
