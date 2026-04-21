<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\Product;
use App\Models\OrderItem;
use Illuminate\Support\Facades\DB;

class UpdateProductSales extends Command
{
    /**
     * The name and signature of the console command.
     *
     * @var string
     */
    protected $signature = 'update:product-sales';

    /**
     * The console command description.
     *
     * @var string
     */
    protected $description = 'Update sales_count and sales_revenue metrics for all products from order_items';

    /**
     * Execute the console command.
     */
    public function handle()
    {
        $this->info('Starting product sales metrics update...');

        // Update sales metrics using optimized single query
        $updated = DB::statement("
            UPDATE products p
            LEFT JOIN (
                SELECT 
                    oi.product_id,
                    SUM(oi.quantity) as total_sales_count,
                    SUM(oi.quantity * oi.price) as total_sales_revenue
                FROM order_items oi
                INNER JOIN orders o ON oi.order_id = o.id
                WHERE o.payment_status = 'paid' 
                    AND o.order_status IN ('delivered', 'completed')
                GROUP BY oi.product_id
            ) sales ON p.id = sales.product_id
            SET 
                p.sales_count = COALESCE(sales.total_sales_count, 0),
                p.sales_revenue = COALESCE(sales.total_sales_revenue, 0)
        ");

        $this->info('Sales metrics updated successfully for all products.');
        $this->line("Affected rows: {$updated}");

        return self::SUCCESS;
    }
}

