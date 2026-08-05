-- AlterTable
ALTER TABLE "order_lines" ADD COLUMN     "old_price_at_purchase" DECIMAL(12,2);

-- CreateIndex
CREATE INDEX "order_lines_product_id_idx" ON "order_lines"("product_id");

-- CreateIndex
CREATE INDEX "order_lines_order_id_idx" ON "order_lines"("order_id");

-- CreateIndex
CREATE INDEX "orders_created_at_idx" ON "orders"("created_at");

-- CreateIndex
CREATE INDEX "orders_customer_id_idx" ON "orders"("customer_id");
