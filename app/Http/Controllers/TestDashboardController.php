<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\Auth;

class TestDashboardController extends Controller
{
    public function index()
    {
        return Inertia::render('TestDashboard', [
            'message' => 'Test dashboard working!',
            'user' => Auth::user(),
        ]);
    }
}

