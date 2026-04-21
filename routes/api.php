<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all API routes will
| automatically be assigned to the "api" middleware group designed for APIs.
| Learn more about the API middleware: https://laravel.com/docs/api-middleware
|
*/

// Cart API routes (moved from web.php to fix 419 CSRF)
Route::middleware('auth:sanctum')->prefix('cart')->group(function () {
    Route::get('/', [App\Http\Controllers\CartController::class, 'index']);
    Route::post('/add', [App\Http\Controllers\CartController::class, 'addToCart']);
    Route::put('/{cartItem}', [App\Http\Controllers\CartController::class, 'updateCartItem']);
    Route::delete('/{cartItem}', [App\Http\Controllers\CartController::class, 'removeCartItem']);
    Route::delete('/', [App\Http\Controllers\CartController::class, 'clearCart']);
    Route::get('/count', [App\Http\Controllers\CartController::class, 'getCartCount']);
    Route::get('/summary', [App\Http\Controllers\CartController::class, 'getCartSummary']);
    Route::post('/checkout', [App\Http\Controllers\CartController::class, 'checkout']);
});

// Additional cart route (was standalone in web.php)
Route::middleware('auth:sanctum')->post('/cart/add', [App\Http\Controllers\CartController::class, 'addToCart'])->name('cart.add');

